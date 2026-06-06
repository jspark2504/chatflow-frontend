import { useEffect } from 'react';
import { wsClient } from '@/lib/websocket';
import useAuthStore from '@/stores/authStore';

export function useWebSocket() {
  const accessToken = useAuthStore((s) => s.accessToken);

  useEffect(() => {
    if (!accessToken) return;
    wsClient.connect(accessToken);
    return () => wsClient.disconnect();
  }, [accessToken]);
}
