import api from '@/services/api';
import type { UserResponse } from '../types/user.types';

export const userService = {
  search: async (q: string): Promise<UserResponse[]> => {
    const res = await api.get<UserResponse[]>('/api/users/search', { params: { nickname: q } });
    return res.data;
  },

  getById: async (userId: number): Promise<UserResponse> => {
    const res = await api.get<UserResponse>(`/api/users/${userId}`);
    return res.data;
  },

  getMe: async (): Promise<UserResponse> => {
    const res = await api.get<UserResponse>('/api/users/me');
    return res.data;
  },
};
