type ConnectionState = 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED';
type MessageHandler = (data: unknown) => void;

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'ws://localhost:8081/ws/chat';
const MAX_BACKOFF_MS = 30_000;

function createWebSocketClient() {
  let ws: WebSocket | null = null;
  let state: ConnectionState = 'DISCONNECTED';
  let retryDelay = 1_000;
  let retryTimer: ReturnType<typeof setTimeout> | null = null;
  let currentToken = '';
  const handlers = new Set<MessageHandler>();

  function connect(token: string) {
    currentToken = token;
    if (ws) ws.close();
    state = 'CONNECTING';
    ws = new WebSocket(WS_URL, [`access_token.${token}`]);

    ws.onopen = () => {
      state = 'CONNECTED';
      retryDelay = 1_000;
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data as string) as unknown;
        handlers.forEach((h) => h(data));
      } catch {
        // ignore malformed frames
      }
    };

    ws.onerror = () => ws?.close();

    ws.onclose = () => {
      state = 'DISCONNECTED';
      if (currentToken) scheduleReconnect();
    };
  }

  function scheduleReconnect() {
    if (retryTimer) clearTimeout(retryTimer);
    retryTimer = setTimeout(() => connect(currentToken), retryDelay);
    retryDelay = Math.min(retryDelay * 2, MAX_BACKOFF_MS);
  }

  function disconnect() {
    currentToken = '';
    if (retryTimer) clearTimeout(retryTimer);
    ws?.close();
    ws = null;
    state = 'DISCONNECTED';
  }

  function send(payload: unknown) {
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(payload));
    }
  }

  function subscribe(handler: MessageHandler): () => void {
    handlers.add(handler);
    return () => handlers.delete(handler);
  }

  function getState(): ConnectionState {
    return state;
  }

  return { connect, disconnect, send, subscribe, getState };
}

export const wsClient = createWebSocketClient();
