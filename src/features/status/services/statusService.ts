import api from '@/services/api';

export const statusService = {
  getOnlineUsers: async (): Promise<number[]> => {
    const res = await api.get<number[]>('/api/status/online-users');
    return res.data;
  },
};
