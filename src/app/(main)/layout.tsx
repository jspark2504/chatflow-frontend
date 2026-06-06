'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/stores/authStore';
import { wsClient } from '@/lib/websocket';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const _hasHydrated = useAuthStore((state) => state._hasHydrated);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !_hasHydrated) return;
    if (!user) router.replace('/login');
  }, [mounted, _hasHydrated, user, router]);

  // WS 연결: 로그인 상태일 때 유지, 로그아웃 시 해제
  useEffect(() => {
    if (!_hasHydrated || !accessToken) return;
    wsClient.connect(accessToken);
    return () => wsClient.disconnect();
  }, [_hasHydrated, accessToken]);

  if (!mounted || !_hasHydrated || !user) return null;

  return <>{children}</>;
}
