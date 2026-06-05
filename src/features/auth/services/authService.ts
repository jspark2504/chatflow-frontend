import api from '@/services/api';
import type { ApiResponse } from '@/types/api.types';
import type { AuthResponse, LoginRequest, SignupRequest } from '../types/auth.types';

export const authService = {
  signup: async (data: SignupRequest): Promise<AuthResponse> => {
    const res = await api.post<ApiResponse<AuthResponse>>('/api/auth/signup', data);
    return res.data.data;
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const res = await api.post<ApiResponse<AuthResponse>>('/api/auth/login', data);
    return res.data.data;
  },
};
