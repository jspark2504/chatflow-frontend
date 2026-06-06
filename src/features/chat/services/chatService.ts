import api from '@/services/api';
import type { MessagePageResponse } from '../types/chat.types';

export const chatService = {
  getMessages: async (
    roomId: number,
    size = 20,
    beforeMessageId?: number,
  ): Promise<MessagePageResponse> => {
    const params: Record<string, number> = { size };
    if (beforeMessageId !== undefined) params.beforeMessageId = beforeMessageId;
    const res = await api.get<MessagePageResponse>(`/api/chat/rooms/${roomId}/messages`, { params });
    return res.data;
  },
};
