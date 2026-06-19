import { create } from 'zustand';
import type { MessageResponse, PendingMessage } from '@/features/chat/types/chat.types';

interface ChatState {
  messagesByRoom: Record<number, MessageResponse[]>;
  pendingByRoom: Record<number, PendingMessage[]>;
  addMessage: (message: MessageResponse) => void;
  prependMessages: (roomId: number, messages: MessageResponse[]) => void;
  setMessages: (roomId: number, messages: MessageResponse[]) => void;
  clearRoom: (roomId: number) => void;
  resetAll: () => void;
  addPending: (msg: PendingMessage) => void;
  removePending: (roomId: number, clientId: string) => void;
  markFailed: (roomId: number, clientId: string) => void;
  markSending: (roomId: number, clientId: string) => void;
}

const useChatStore = create<ChatState>((set) => ({
  messagesByRoom: {},
  pendingByRoom: {},

  addMessage: (message) =>
    set((state) => {
      const existing = state.messagesByRoom[message.roomId] ?? [];
      // 중복 echo(재전송 확인) 시 같은 messageId가 이미 있으면 무시
      if (existing.some((m) => m.messageId === message.messageId)) return state;
      return {
        messagesByRoom: {
          ...state.messagesByRoom,
          [message.roomId]: [...existing, message],
        },
      };
    }),

  prependMessages: (roomId, messages) =>
    set((state) => ({
      messagesByRoom: {
        ...state.messagesByRoom,
        [roomId]: [...messages, ...(state.messagesByRoom[roomId] ?? [])],
      },
    })),

  setMessages: (roomId, messages) =>
    set((state) => ({
      messagesByRoom: { ...state.messagesByRoom, [roomId]: messages },
    })),

  clearRoom: (roomId) =>
    set((state) => {
      const next = { ...state.messagesByRoom };
      delete next[roomId];
      return { messagesByRoom: next };
    }),

  resetAll: () => set({ messagesByRoom: {}, pendingByRoom: {} }),

  addPending: (msg) =>
    set((state) => ({
      pendingByRoom: {
        ...state.pendingByRoom,
        [msg.roomId]: [...(state.pendingByRoom[msg.roomId] ?? []), msg],
      },
    })),

  removePending: (roomId, clientId) =>
    set((state) => ({
      pendingByRoom: {
        ...state.pendingByRoom,
        [roomId]: (state.pendingByRoom[roomId] ?? []).filter((m) => m.clientId !== clientId),
      },
    })),

  markFailed: (roomId, clientId) =>
    set((state) => ({
      pendingByRoom: {
        ...state.pendingByRoom,
        [roomId]: (state.pendingByRoom[roomId] ?? []).map((m) =>
          m.clientId === clientId ? { ...m, status: 'failed' as const } : m,
        ),
      },
    })),

  markSending: (roomId, clientId) =>
    set((state) => ({
      pendingByRoom: {
        ...state.pendingByRoom,
        [roomId]: (state.pendingByRoom[roomId] ?? []).map((m) =>
          m.clientId === clientId ? { ...m, status: 'sending' as const } : m,
        ),
      },
    })),
}));

export default useChatStore;
