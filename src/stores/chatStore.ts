import { create } from 'zustand';
import type { MessageType } from '@/features/chat/types/chat.types';

interface ChatState {
  messagesByRoom: Record<number, MessageType[]>;
  addMessage: (message: MessageType) => void;
  prependMessages: (roomId: number, messages: MessageType[]) => void;
  setMessages: (roomId: number, messages: MessageType[]) => void;
  clearRoom: (roomId: number) => void;
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
}));

export default useChatStore;
