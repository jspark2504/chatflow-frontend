'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/stores/authStore';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const _hasHydrated = useAuthStore((state) => state._hasHydrated);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !_hasHydrated) return;
    if (!user) router.replace('/login');
  }, [mounted, _hasHydrated, user, router]);

  // hydration 완료 전 또는 미로그인 상태이면 렌더 생략
  if (!mounted || !_hasHydrated || !user) return null;

  return <>{children}</>;
}
