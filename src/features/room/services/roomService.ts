import api from '@/services/api';
import type { RoomResponse } from '../types/room.types';

export const roomService = {
  getRooms: async (): Promise<RoomResponse[]> => {
    const res = await api.get<RoomResponse[]>('/api/chat/rooms');
    return res.data;
  },

  getRoom: async (roomId: number): Promise<RoomResponse> => {
    const res = await api.get<RoomResponse>(`/api/chat/rooms/${roomId}`);
    return res.data;
  },

  markRead: async (roomId: number, lastReadMessageId: number): Promise<void> => {
    await api.put(`/api/chat/rooms/${roomId}/read`, { lastReadMessageId });
  },
};
