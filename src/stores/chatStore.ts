import { create } from 'zustand';
import type { MessageResponse } from '@/features/chat/types/chat.types';

interface ChatState {
  messagesByRoom: Record<number, MessageResponse[]>;
  addMessage: (message: MessageResponse) => void;
  prependMessages: (roomId: number, messages: MessageResponse[]) => void;
  setMessages: (roomId: number, messages: MessageResponse[]) => void;
  clearRoom: (roomId: number) => void;
  resetAll: () => void;
}

const useChatStore = create<ChatState>((set) => ({
  messagesByRoom: {},

  addMessage: (message) =>
    set((state) => ({
      messagesByRoom: {
        ...state.messagesByRoom,
        [message.roomId]: [...(state.messagesByRoom[message.roomId] ?? []), message],
      },
    })),

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

  resetAll: () => set({ messagesByRoom: {} }),
}));

export default useChatStore;
