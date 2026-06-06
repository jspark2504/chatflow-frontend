import { useCallback, useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { wsClient } from '@/lib/websocket';
import useChatStore from '@/stores/chatStore';
import { chatService } from '../services/chatService';
import { roomService } from '@/features/room/services/roomService';
import type { MessageResponse } from '../types/chat.types';

const EMPTY_MESSAGES: MessageResponse[] = [];

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
  const messages = useChatStore((s) => s.messagesByRoom[roomId] ?? EMPTY_MESSAGES);

  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Stable ref to avoid stale closures in WS handler
  const roomIdRef = useRef(roomId);
  roomIdRef.current = roomId;

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
      const msg = extractMessage(data as WsFrame);
      if (!msg || msg.roomId !== roomIdRef.current) return;
      addMessage(msg);
      void roomService.markRead(roomIdRef.current, msg.messageId).then(() => {
        queryClient.invalidateQueries({ queryKey: ['rooms'] });
      });
    });

    return () => {
      cancelled = true;
      unsubscribeOpen();
      unsubscribe();
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
      wsClient.send({ type: 'SEND', roomId, content, messageType: 'TEXT' });
    },
    [roomId],
  );

  return { messages, hasMore, isLoading, isLoadingMore, loadMore, sendMessage };
}
