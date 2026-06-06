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
  const openHandlers = new Set<() => void>();
  const stateHandlers = new Set<() => void>();
  const pendingOutbound: unknown[] = [];

  function setState(next: ConnectionState) {
    state = next;
    stateHandlers.forEach((handler) => handler());
  }

  function flushPending() {
    if (ws?.readyState !== WebSocket.OPEN) return;
    while (pendingOutbound.length > 0) {
      ws.send(JSON.stringify(pendingOutbound.shift()));
    }
  }

  function notifyOpen() {
    openHandlers.forEach((handler) => handler());
  }

  function connect(token: string) {
    currentToken = token;
    if (ws) ws.close();
    setState('CONNECTING');
    ws = new WebSocket(WS_URL, [`access_token.${token}`]);

    ws.onopen = () => {
      setState('CONNECTED');
      retryDelay = 1_000;
      flushPending();
      notifyOpen();
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
      setState('DISCONNECTED');
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
    pendingOutbound.length = 0;
    if (retryTimer) clearTimeout(retryTimer);
    ws?.close();
    ws = null;
    setState('DISCONNECTED');
  }

  function send(payload: unknown) {
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(payload));
      return;
    }
    if (currentToken) {
      pendingOutbound.push(payload);
    }
  }

  function onOpen(handler: () => void): () => void {
    openHandlers.add(handler);
    if (state === 'CONNECTED') handler();
    return () => openHandlers.delete(handler);
  }

  function subscribe(handler: MessageHandler): () => void {
    handlers.add(handler);
    return () => handlers.delete(handler);
  }

  function subscribeState(handler: () => void): () => void {
    stateHandlers.add(handler);
    return () => stateHandlers.delete(handler);
  }

  function getState(): ConnectionState {
    return state;
  }

  return { connect, disconnect, send, subscribe, onOpen, subscribeState, getState };
}

export const wsClient = createWebSocketClient();
