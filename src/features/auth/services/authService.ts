import api from '@/services/api';
import authApi from '@/services/authApi';
import type { LoginRequest, LoginResponse, SignupRequest, SignupResponse } from '../types/auth.types';

export const authService = {
  signup: async (data: SignupRequest): Promise<SignupResponse> => {
    const res = await authApi.post<SignupResponse>('/api/auth/signup', data);
    return res.data;
  },

  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const res = await authApi.post<LoginResponse>('/api/auth/login', data);
    return res.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/api/auth/logout');
  },
};
