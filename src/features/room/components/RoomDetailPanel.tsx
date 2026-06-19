'use client';

import { nameToColor, roomAvatarStyle } from '@/components/layout/ChatLayout';
import useOnlineStore from '@/stores/onlineStore';
import type { RoomMember, RoomResponse } from '../types/room.types';

function IcUsers() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function MemberRow({ member, isFirst, isOnline }: { member: RoomMember; isFirst: boolean; isOnline: boolean }) {
  const color = nameToColor(member.nickname);
  const initial = member.nickname.slice(0, 1).toUpperCase();
  return (
    <div className="flex items-center gap-[11px] px-[10px] py-[8px] rounded-[10px] hover:bg-[#212327] transition-colors cursor-pointer">
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-semibold text-white shrink-0 relative"
        style={{ background: color }}
      >
        {initial}
        {isOnline && (
          <span className="absolute right-0 bottom-0 w-[10px] h-[10px] rounded-full bg-[#3ba55d] border-2 border-[#161719]" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[13.5px] font-[600] text-[#e9eaee] truncate">{member.nickname}</span>
          {isFirst && (
            <span className="shrink-0 text-[10px] font-bold text-[#ff7a59] bg-[rgba(255,122,89,0.14)] px-[7px] py-[2px] rounded-[6px]">
              방장
            </span>
          )}
        </div>
        <span className={`text-[11.5px] ${isOnline ? 'text-[#3ba55d]' : 'text-[#54565c]'}`}>
          {isOnline ? '온라인' : '오프라인'}
        </span>
      </div>
    </div>
  );
}

interface RoomDetailPanelProps {
  room: RoomResponse | undefined;
}

export default function RoomDetailPanel({ room }: RoomDetailPanelProps) {
  const isOnline = useOnlineStore((s) => s.isOnline);

  if (!room) {
    return (
      <aside className="w-[280px] shrink-0 bg-[#161719] border-l border-[#232428] flex flex-col items-center justify-center">
        <div className="flex flex-col items-center text-center px-7 py-8">
          <div className="w-14 h-14 rounded-[16px] bg-[#232428] border border-[#2c2e33] flex items-center justify-center text-[#6e7178] mb-4">
            <IcUsers />
          </div>
          <div className="text-[14.5px] font-[650] text-[#a3a6ad] mb-1.5">채팅방 정보</div>
          <div className="text-[13px] text-[#54565c] leading-relaxed">
            채팅방을 선택하면<br />참여자 정보가 표시됩니다.
          </div>
        </div>
      </aside>
    );
  }

  const { background: heroBackground, initial: heroInitial, shapeClass: heroShape } = roomAvatarStyle(room);
  const onlineCount = room.members.filter((m) => isOnline(m.userId)).length;

  return (
    <aside className="w-[280px] shrink-0 bg-[#161719] border-l border-[#232428] flex flex-col overflow-hidden">
      {/* Hero */}
      <div className="flex flex-col items-center px-5 pt-6 pb-5 border-b border-[#232428] text-center">
        <div
          className={`w-[72px] h-[72px] ${heroShape === 'rounded-[12px]' ? 'rounded-[20px]' : 'rounded-full'} flex items-center justify-center text-2xl font-bold text-white shadow-[0_8px_24px_rgba(0,0,0,0.3)]`}
          style={{ background: heroBackground }}
        >
          {heroInitial}
        </div>
        <div className="mt-3 text-[16px] font-bold text-[#e9eaee]">{room.roomName}</div>
        <div className="mt-1 text-[12.5px] text-[#6e7178]">
          {room.type === 'DIRECT' ? '1:1 채팅' : '그룹 채팅'}
        </div>
        <div className="flex gap-2 mt-4 w-full">
          <div className="flex-1 bg-[#232428] rounded-[11px] py-2.5 text-center">
            <div className="text-[15px] font-bold text-[#e9eaee]">{room.memberCount}</div>
            <div className="text-[10.5px] text-[#6e7178] mt-0.5">참여자</div>
          </div>
          <div className="flex-1 bg-[#232428] rounded-[11px] py-2.5 text-center">
            <div className="text-[15px] font-bold text-[#3ba55d]">{onlineCount}</div>
            <div className="text-[10.5px] text-[#6e7178] mt-0.5">온라인</div>
          </div>
        </div>
      </div>

      {/* Members */}
      <div className="flex items-center justify-between px-5 pt-4 pb-1.5">
        <span className="text-[11px] font-bold uppercase tracking-[0.05em] text-[#54565c]">
          참여자 — {room.members.length}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto px-[10px] pb-4">
        {room.members.map((m, i) => (
          <MemberRow key={m.userId} member={m} isFirst={i === 0} isOnline={isOnline(m.userId)} />
        ))}
      </div>
    </aside>
  );
}
