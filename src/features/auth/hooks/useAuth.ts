import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/stores/authStore';
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
