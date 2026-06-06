'use client';

import Link from 'next/link';
import type { RoomResponse } from '../types/room.types';

function formatTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86_400_000);
  if (diffDays === 0) return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 1) return '어제';
  if (diffDays < 7) return date.toLocaleDateString('ko-KR', { weekday: 'short' });
  return date.toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' });
}

interface RoomItemProps {
  room: RoomResponse;
  isActive?: boolean;
}

export default function RoomItem({ room, isActive = false }: RoomItemProps) {
  const subtitle =
    room.type === 'DIRECT'
      ? room.members.map((m) => m.nickname).join(' · ')
      : `멤버 ${room.memberCount}명`;

  return (
    <Link
      href={`/chat/${room.roomId}`}
      className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors cursor-pointer ${
        isActive ? 'bg-[#2c2e33]' : 'hover:bg-[#232428]'
      }`}
    >
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#3a3c42] flex items-center justify-center text-sm font-semibold text-zinc-300">
        {room.roomName.slice(0, 1).toUpperCase()}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-semibold text-white truncate">{room.roomName}</span>
          <span className="flex-shrink-0 text-xs text-zinc-500">{formatTime(room.createdAt)}</span>
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <span className="text-xs text-zinc-400 truncate">{subtitle}</span>
          {room.unreadCount > 0 && (
            <span className="flex-shrink-0 min-w-[18px] h-[18px] px-1 rounded-full bg-[#ff7a59] text-white text-[11px] font-bold flex items-center justify-center">
              {room.unreadCount > 99 ? '99+' : room.unreadCount}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
