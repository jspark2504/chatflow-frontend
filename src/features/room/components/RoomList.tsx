'use client';

import { usePathname } from 'next/navigation';
import { useRooms } from '../hooks/useRooms';
import RoomItem from './RoomItem';

export default function RoomList() {
  const { data: rooms, isLoading, isError } = useRooms();
  const pathname = usePathname();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-1 p-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-3 rounded-lg animate-pulse">
            <div className="w-10 h-10 rounded-full bg-[#3a3c42]" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-24 rounded bg-[#3a3c42]" />
              <div className="h-3 w-32 rounded bg-[#2c2e33]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p className="px-4 py-3 text-sm text-red-400">채팅방 목록을 불러오지 못했습니다.</p>
    );
  }

  if (!rooms?.length) {
    return (
      <p className="px-4 py-3 text-sm text-zinc-500">참여 중인 채팅방이 없습니다.</p>
    );
  }

  return (
    <div className="flex flex-col gap-0.5 p-2">
      {rooms.map((room) => (
        <RoomItem
          key={room.roomId}
          room={room}
          isActive={pathname === `/chat/${room.roomId}`}
        />
      ))}
    </div>
  );
}
