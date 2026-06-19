import { create } from 'zustand';

interface OnlineState {
  onlineUserIds: Set<number>;
  setSnapshot: (userIds: number[]) => void;
  setOnline: (userId: number) => void;
  setOffline: (userId: number) => void;
  isOnline: (userId: number) => boolean;
}

const useOnlineStore = create<OnlineState>((set, get) => ({
  onlineUserIds: new Set<number>(),

  setSnapshot: (userIds) =>
    set({ onlineUserIds: new Set(userIds) }),

  setOnline: (userId) =>
    set((state) => ({ onlineUserIds: new Set([...state.onlineUserIds, userId]) })),

  setOffline: (userId) =>
    set((state) => {
      const next = new Set(state.onlineUserIds);
      next.delete(userId);
      return { onlineUserIds: next };
    }),

  isOnline: (userId) => get().onlineUserIds.has(userId),
}));

export default useOnlineStore;
