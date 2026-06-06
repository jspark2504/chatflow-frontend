import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import useAuthStore from '@/stores/authStore';
import useChatStore from '@/stores/chatStore';
import { wsClient } from '@/lib/websocket';
import { authService } from '../services/authService';
import type { LoginRequest, SignupRequest } from '../types/auth.types';

export function useLogin() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: ({ userId, email, nickname, accessToken }) => {
      setAuth({ id: String(userId), email, nickname }, accessToken);
      router.replace('/chat');
    },
  });
}

export function useSignup() {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: SignupRequest) => authService.signup(data),
    onSuccess: () => {
      router.push('/login');
    },
  });
}

/** 서버 토큰 무효화(Redis 블랙리스트) 후 클라이언트 세션 정리 */
export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const resetChat = useChatStore((state) => state.resetAll);

  return useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // 네트워크 오류 등 — 클라이언트 정리는 계속 진행
    }
    wsClient.disconnect();
    clearAuth();
    resetChat();
    queryClient.clear();
    router.replace('/login');
  }, [clearAuth, queryClient, resetChat, router]);
}
