import { useCallback, useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { wsClient } from '@/lib/websocket';
import useChatStore from '@/stores/chatStore';
import useAuthStore from '@/stores/authStore';
import { chatService } from '../services/chatService';
import { roomService } from '@/features/room/services/roomService';
import type { MessageResponse, PendingMessage } from '../types/chat.types';

const EMPTY_MESSAGES: MessageResponse[] = [];
const EMPTY_PENDING: PendingMessage[] = [];
const SEND_TIMEOUT_MS = 5_000;

type WsFrame =
  | { type: 'MESSAGE'; message: MessageResponse }
  | { type: string; [key: string]: unknown };

function extractMessage(data: unknown): MessageResponse | null {
  if (!data || typeof data !== 'object') return null;
  const frame = data as Record<string, unknown>;
  // wrapped: { type: 'MESSAGE', message: {...} }
  if (frame.type === 'MESSAGE' && frame.message) return frame.message as MessageResponse;
  // unwrapped: { messageId, roomId, ... }
  if (typeof frame.messageId === 'number') return frame as unknown as MessageResponse;
  return null;
}

export function useRoomChat(roomId: number) {
  const queryClient = useQueryClient();
  const addMessage = useChatStore((s) => s.addMessage);
  const setMessages = useChatStore((s) => s.setMessages);
  const prependMessages = useChatStore((s) => s.prependMessages);
  const addPending = useChatStore((s) => s.addPending);
  const removePending = useChatStore((s) => s.removePending);
  const markFailed = useChatStore((s) => s.markFailed);
  const markSending = useChatStore((s) => s.markSending);
  const messages = useChatStore((s) => s.messagesByRoom[roomId] ?? EMPTY_MESSAGES);
  const pending = useChatStore((s) => s.pendingByRoom[roomId] ?? EMPTY_PENDING);
  const currentUserId = useAuthStore((s) => s.user?.id);

  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Stable refs to avoid stale closures in WS handler
  const roomIdRef = useRef(roomId);
  roomIdRef.current = roomId;
  const currentUserIdRef = useRef(currentUserId);
  currentUserIdRef.current = currentUserId;

  // clientId → timeout handle; cleared on confirm/fail/room-leave
  const timeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    chatService.getMessages(roomId).then((res) => {
      if (cancelled) return;
      // API는 최신순(DESC) — UI·읽음 처리는 시간순(ASC)으로 맞춤
      const chronological = [...res.messages].reverse();
      setMessages(roomId, chronological);
      setHasMore(res.hasMore);
      setNextCursor(res.nextCursor);
      setIsLoading(false);

      const latestMsg = chronological.at(-1);
      if (latestMsg) {
        void roomService.markRead(roomId, latestMsg.messageId).then(() => {
          queryClient.invalidateQueries({ queryKey: ['rooms'] });
        });
      }
    }).catch(() => {
      if (!cancelled) setIsLoading(false);
    });

    const joinRoom = () => wsClient.send({ type: 'JOIN', roomId });
    joinRoom();
    const unsubscribeOpen = wsClient.onOpen(joinRoom);

    const unsubscribe = wsClient.subscribe((data) => {
      const frame = data as Record<string, unknown>;

      // ERROR frame from server → fail the oldest 'sending' pending in this room
      if (frame.type === 'ERROR') {
        const roomPending = useChatStore.getState().pendingByRoom[roomIdRef.current] ?? [];
        const oldest = roomPending.find((m) => m.status === 'sending');
        if (oldest) {
          const t = timeoutsRef.current.get(oldest.clientId);
          if (t !== undefined) clearTimeout(t);
          timeoutsRef.current.delete(oldest.clientId);
          markFailed(roomIdRef.current, oldest.clientId);
        }
        return;
      }

      const msg = extractMessage(data as WsFrame);
      if (!msg || msg.roomId !== roomIdRef.current) return;

      // Server echo of own message → remove matching pending (oldest same-content 'sending')
      if (String(msg.senderId) === currentUserIdRef.current) {
        const roomPending = useChatStore.getState().pendingByRoom[roomIdRef.current] ?? [];
        const match = roomPending.find(
          (m) => m.content === msg.content && m.status === 'sending',
        );
        if (match) {
          const t = timeoutsRef.current.get(match.clientId);
          if (t !== undefined) clearTimeout(t);
          timeoutsRef.current.delete(match.clientId);
          removePending(roomIdRef.current, match.clientId);
        }
      }

      addMessage(msg);
      void roomService.markRead(roomIdRef.current, msg.messageId).then(() => {
        queryClient.invalidateQueries({ queryKey: ['rooms'] });
      });
    });

    return () => {
      cancelled = true;
      unsubscribeOpen();
      unsubscribe();
      timeoutsRef.current.forEach((t) => clearTimeout(t));
      timeoutsRef.current.clear();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  const loadMore = useCallback(async () => {
    if (!hasMore || nextCursor == null || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const res = await chatService.getMessages(roomId, 20, nextCursor);
      prependMessages(roomId, [...res.messages].reverse());
      setHasMore(res.hasMore);
      setNextCursor(res.nextCursor);
    } finally {
      setIsLoadingMore(false);
    }
  }, [roomId, hasMore, nextCursor, isLoadingMore, prependMessages]);

  const sendMessage = useCallback(
    (content: string) => {
      const clientId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const pending: PendingMessage = {
        clientId,
        roomId,
        senderId: Number(currentUserIdRef.current ?? 0),
        content,
        status: 'sending',
        createdAt: new Date().toISOString(),
      };
      addPending(pending);
      wsClient.send({ type: 'SEND', roomId, content, messageType: 'TEXT' });

      const t = setTimeout(() => {
        timeoutsRef.current.delete(clientId);
        markFailed(roomId, clientId);
      }, SEND_TIMEOUT_MS);
      timeoutsRef.current.set(clientId, t);
    },
    [roomId, addPending, markFailed],
  );

  const retrySend = useCallback(
    (clientId: string) => {
      const roomPending = useChatStore.getState().pendingByRoom[roomId] ?? [];
      const target = roomPending.find((m) => m.clientId === clientId);
      if (!target || target.status !== 'failed') return;

      const existing = timeoutsRef.current.get(clientId);
      if (existing !== undefined) clearTimeout(existing);

      markSending(roomId, clientId);
      wsClient.send({ type: 'SEND', roomId, content: target.content, messageType: 'TEXT' });

      const t = setTimeout(() => {
        timeoutsRef.current.delete(clientId);
        markFailed(roomId, clientId);
      }, SEND_TIMEOUT_MS);
      timeoutsRef.current.set(clientId, t);
    },
    [roomId, markSending, markFailed],
  );

  return { messages, pending, hasMore, isLoading, isLoadingMore, loadMore, sendMessage, retrySend };
}
