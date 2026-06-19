import { useEffect } from 'react';
import { wsClient } from '@/lib/websocket';
import useOnlineStore from '@/stores/onlineStore';
import { statusService } from '../services/statusService';
import type { WsPresenceFrame } from '@/features/chat/types/chat.types';

export function useOnlineStatus() {
  const setSnapshot = useOnlineStore((s) => s.setSnapshot);
  const setOnline = useOnlineStore((s) => s.setOnline);
  const setOffline = useOnlineStore((s) => s.setOffline);

  useEffect(() => {
    // REST 스냅샷: 현재 온라인 유저 초기 로드
    statusService.getOnlineUsers().then(setSnapshot).catch(() => {});

    // WS 프레즌스 이벤트 구독
    const unsubscribe = wsClient.subscribe((data) => {
      if (!data || typeof data !== 'object') return;
      const frame = data as Partial<WsPresenceFrame>;
      if (frame.type === 'USER_ONLINE' && typeof frame.userId === 'number') {
        setOnline(frame.userId);
      } else if (frame.type === 'USER_OFFLINE' && typeof frame.userId === 'number') {
        setOffline(frame.userId);
      }
    });

    return unsubscribe;
  // setSnapshot/setOnline/setOffline은 Zustand 액션으로 참조 안정적
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
