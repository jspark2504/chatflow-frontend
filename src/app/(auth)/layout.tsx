'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/stores/authStore';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && user) {
      router.replace('/');
    }
  }, [mounted, user, router]);

  // 하이드레이션 전 또는 로그인 상태면 렌더 생략
  if (!mounted || user) return null;

  return <>{children}</>;
}
