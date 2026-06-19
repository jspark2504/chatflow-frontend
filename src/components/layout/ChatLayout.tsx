'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import useAuthStore from '@/stores/authStore';
import useOnlineStore from '@/stores/onlineStore';
import { useLogout } from '@/features/auth/hooks/useAuth';
import { useRooms } from '@/features/room/hooks/useRooms';
import CreateRoomModal from '@/features/room/components/CreateRoomModal';
import type { RoomResponse } from '@/features/room/types/room.types';

// ── Color utils ───────────────────────────────────────────────────────────────
const AV_COLORS = ['#7c6af5', '#3ba55d', '#f0b232', '#5865f2', '#eb459e', '#ff7a59'];
export const GROUP_ROOM_AVATAR = 'linear-gradient(135deg,#5b8cff,#3b6fe0)';

export function nameToColor(name: string): string {
  return AV_COLORS[(name.charCodeAt(0) ?? 0) % AV_COLORS.length];
}

export function roomAvatarStyle(room: Pick<RoomResponse, 'type' | 'roomName'>) {
  const isGroup = room.type === 'GROUP';
  return {
    initial: room.roomName.slice(0, 1).toUpperCase(),
    background: isGroup ? GROUP_ROOM_AVATAR : nameToColor(room.roomName),
    shapeClass: isGroup ? 'rounded-[12px]' : 'rounded-full',
  };
}

// ── Icons ─────────────────────────────────────────────────────────────────────
function IcSearch() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" />
    </svg>
  );
}
function IcEdit() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}
function IcSettings() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </svg>
  );
}
function IcUser() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  );
}
function IcLogout() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

// ── Time format ───────────────────────────────────────────────────────────────
function fmtTime(iso: string): string {
  const d = new Date(iso);
  const days = Math.floor((Date.now() - d.getTime()) / 86_400_000);
  if (days === 0) return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  if (days === 1) return '어제';
  if (days < 7) return d.toLocaleDateString('ko-KR', { weekday: 'short' });
  return d.toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' });
}

// ── Room row ──────────────────────────────────────────────────────────────────
function SidebarRoom({ room, isActive, currentUserId }: { room: RoomResponse; isActive: boolean; currentUserId: number | null }) {
  const isOnline = useOnlineStore((s) => s.isOnline);
  const subtitle =
    room.type === 'DIRECT'
      ? room.members.map((m) => m.nickname).join(' · ')
      : `멤버 ${room.memberCount}명`;
  const { background, initial, shapeClass } = roomAvatarStyle(room);

  const peerUserId =
    room.type === 'DIRECT' && currentUserId !== null
      ? (room.members.find((m) => m.userId !== currentUserId)?.userId ?? null)
      : null;
  const peerOnline = peerUserId !== null && isOnline(peerUserId);

  return (
    <div className="relative px-0">
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[22px] rounded-r-[3px] bg-[#ff7a59] z-10" />
      )}
      <Link
        href={`/chat/${room.roomId}`}
        className={`flex items-center gap-[11px] px-[10px] py-[9px] rounded-[11px] transition-colors ${
          isActive ? 'bg-[#232428]' : 'hover:bg-[#212327]'
        }`}
      >
        <div
          className={`w-11 h-11 ${shapeClass} flex items-center justify-center text-[15px] font-semibold text-white shrink-0 relative`}
          style={{ background }}
        >
          {initial}
          {peerOnline && (
            <span className="absolute right-0 bottom-0 w-[10px] h-[10px] rounded-full bg-[#3ba55d] border-[2px] border-[#161719]" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2">
            <span className={`text-[14px] truncate ${room.unreadCount > 0 ? 'font-bold' : 'font-[600]'} text-[#e9eaee]`}>
              {room.roomName}
            </span>
            <span className="text-[11px] text-[#54565c] shrink-0">{fmtTime(room.createdAt)}</span>
          </div>
          <div className="flex items-center justify-between gap-2 mt-0.5">
            <span className={`text-[12.5px] truncate ${room.unreadCount > 0 ? 'text-[#a3a6ad]' : 'text-[#6e7178]'}`}>
              {subtitle}
            </span>
            {room.unreadCount > 0 && (
              <span className="shrink-0 min-w-[18px] h-[18px] px-[5px] rounded-full bg-[#ff7a59] text-white text-[11px] font-bold flex items-center justify-center shadow-[0_2px_6px_rgba(255,122,89,0.4)]">
                {room.unreadCount > 99 ? '99+' : room.unreadCount}
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function AppSidebar({ onNewChat }: { onNewChat: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { data: rooms = [], isLoading, isError } = useRooms();

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const filteredRooms = useMemo(() => {
    if (!query.trim()) return rooms;
    const q = query.trim().toLowerCase();
    return rooms.filter((r) => r.roomName.toLowerCase().includes(q));
  }, [rooms, query]);

  const initial = (user?.nickname ?? '?').slice(0, 1).toUpperCase();
  const avatarColor = user ? nameToColor(user.nickname) : '#6e7178';

  return (
    <aside className="w-[280px] shrink-0 bg-[#161719] border-r border-[#232428] flex flex-col overflow-hidden">
      {/* Search */}
      <div className="px-3 pt-3 pb-1.5">
        <div className="flex items-center gap-2 bg-[#26272b] border border-transparent rounded-[10px] px-3 py-[8px] transition-colors focus-within:border-[#ff7a59] focus-within:bg-[#2b2c31]">
          <span className="text-[#6e7178] shrink-0"><IcSearch /></span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="채팅방 검색"
            className="flex-1 bg-transparent border-none outline-none text-[13.5px] text-[#e9eaee] placeholder:text-[#6e7178]"
          />
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-[18px] py-[6px] mt-1">
        <span className="text-[11px] font-bold uppercase tracking-[0.05em] text-[#54565c]">채팅방</span>
        <button
          onClick={onNewChat}
          title="새 채팅"
          className="w-[26px] h-[26px] rounded-[9px] flex items-center justify-center text-[#a3a6ad] hover:bg-[#232428] hover:text-[#e9eaee] transition-colors"
        >
          <IcEdit />
        </button>
      </div>

      {/* Room list */}
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {isLoading && (
          <div className="flex flex-col gap-1 pt-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-2.5 py-2.5 animate-pulse">
                <div className="w-11 h-11 rounded-full bg-[#2a2c31] shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-20 rounded bg-[#2a2c31]" />
                  <div className="h-3 w-28 rounded bg-[#232428]" />
                </div>
              </div>
            ))}
          </div>
        )}
        {isError && <p className="px-4 py-3 text-[13px] text-red-400">목록을 불러오지 못했습니다.</p>}
        {!isLoading && !isError && filteredRooms.length === 0 && (
          <p className="px-4 py-6 text-[13px] text-[#6e7178] text-center">
            {query ? '검색 결과가 없어요' : '참여 중인 채팅방이 없어요'}
          </p>
        )}
        {filteredRooms.map((room) => (
          <SidebarRoom
            key={room.roomId}
            room={room}
            isActive={pathname === `/chat/${room.roomId}`}
            currentUserId={user ? Number(user.id) : null}
          />
        ))}
      </div>

      {/* Profile */}
      <div className="border-t border-[#232428] p-2 relative" ref={dropdownRef}>
        {showDropdown && (
          <div className="absolute bottom-full left-2 right-2 mb-1 bg-[#232428] border border-[#2c2e33] rounded-xl shadow-[0_12px_32px_rgba(0,0,0,0.45)] overflow-hidden z-50">
            <button
              onClick={() => { setShowDropdown(false); router.push('/settings'); }}
              className="w-full flex items-center gap-2.5 px-4 py-[10px] text-[13.5px] text-[#e9eaee] hover:bg-[#2a2c31] transition-colors text-left"
            >
              <IcUser />내 정보
            </button>
            <div className="h-px bg-[#2c2e33]" />
            <button
              onClick={() => { setShowDropdown(false); logout(); }}
              className="w-full flex items-center gap-2.5 px-4 py-[10px] text-[13.5px] text-red-400 hover:bg-[#2a2c31] transition-colors text-left"
            >
              <IcLogout />로그아웃
            </button>
          </div>
        )}
        <button
          onClick={() => setShowDropdown((v) => !v)}
          className="w-full flex items-center gap-[11px] rounded-[10px] px-2 py-2 hover:bg-[#212327] transition-colors"
        >
          <div
            className="w-[42px] h-[42px] rounded-full flex items-center justify-center text-[15px] font-semibold text-white shrink-0 relative"
            style={{ background: avatarColor }}
          >
            {initial}
            <span className="absolute right-0 bottom-0 w-[11px] h-[11px] rounded-full bg-[#3ba55d] border-[2.5px] border-[#161719]" />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <div className="text-[14.5px] font-[650] text-[#e9eaee] truncate">{user?.nickname}</div>
            <div className="flex items-center gap-[5px] mt-[1px] text-[12px] text-[#a3a6ad]">
              <span className="w-[7px] h-[7px] rounded-full bg-[#3ba55d] shadow-[0_0_0_2px_rgba(59,165,93,0.18)]" />
              온라인
            </div>
          </div>
          <span className="text-[#6e7178]"><IcSettings /></span>
        </button>
      </div>
    </aside>
  );
}

// ── Layout ────────────────────────────────────────────────────────────────────
interface ChatLayoutProps {
  children: React.ReactNode;
  rightPanel?: React.ReactNode;
}

export default function ChatLayout({ children, rightPanel }: ChatLayoutProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="flex h-screen bg-[#1a1b1e] overflow-hidden">
      <AppSidebar onNewChat={() => setShowModal(true)} />
      <main className="flex flex-1 flex-col min-w-0 min-h-0 overflow-hidden">
        {children}
      </main>
      {rightPanel}
      {showModal && <CreateRoomModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
