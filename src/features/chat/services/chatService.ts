import api from '@/services/api';
import type { MessageListResponse } from '../types/chat.types';

export const chatService = {
  getMessages: async (
    roomId: number,
    size = 20,
    beforeMessageId?: number,
  ): Promise<MessageListResponse> => {
    const params: Record<string, number> = { size };
    if (beforeMessageId !== undefined) params.beforeMessageId = beforeMessageId;
    const res = await api.get<MessageListResponse>(`/api/chat/rooms/${roomId}/messages`, { params });
    return res.data;
  },
};
