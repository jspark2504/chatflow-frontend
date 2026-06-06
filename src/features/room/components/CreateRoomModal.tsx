'use client';

import { useState } from 'react';
import { useCreateRoom } from '../hooks/useRooms';
import { useSearchUsers } from '@/features/user/hooks/useUsers';
import type { RoomType } from '../types/room.types';
import type { UserResponse } from '@/features/user/types/user.types';

interface Props {
  onClose: () => void;
}

export default function CreateRoomModal({ onClose }: Props) {
  const [tab, setTab] = useState<RoomType>('DIRECT');
  const [searchQ, setSearchQ] = useState('');
  const [roomName, setRoomName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<UserResponse[]>([]);

  const { data: searchResults = [] } = useSearchUsers(searchQ);
  const { mutate: createRoom, isPending, error } = useCreateRoom();

  const toggleUser = (u: UserResponse) => {
    if (tab === 'DIRECT') {
      setSelectedUsers([u]);
    } else {
      setSelectedUsers((prev) =>
        prev.find((p) => p.userId === u.userId)
          ? prev.filter((p) => p.userId !== u.userId)
          : [...prev, u],
      );
    }
  };

  const isSelected = (u: UserResponse) => selectedUsers.some((p) => p.userId === u.userId);

  const handleCreate = () => {
    if (tab === 'DIRECT') {
      if (!selectedUsers[0]) return;
      createRoom({ type: 'DIRECT', targetUserId: selectedUsers[0].userId });
    } else {
      if (!roomName.trim() || selectedUsers.length === 0) return;
      createRoom({
        type: 'GROUP',
        roomName: roomName.trim(),
        memberUserIds: selectedUsers.map((u) => u.userId),
      });
    }
  };

  const canCreate =
    tab === 'DIRECT' ? selectedUsers.length === 1 : selectedUsers.length > 0 && !!roomName.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <div className="relative w-full max-w-md rounded-2xl bg-[#232428] border border-[#2c2e33] shadow-2xl mx-4">
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[#2c2e33]">
          <h2 className="text-base font-semibold text-white">새 채팅방</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition-colors text-lg leading-none">
            ✕
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* 탭 */}
          <div className="flex rounded-lg bg-[#1a1b1e] p-1 gap-1">
            {(['DIRECT', 'GROUP'] as RoomType[]).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setSelectedUsers([]); }}
                className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${
                  tab === t ? 'bg-[#2c2e33] text-white' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {t === 'DIRECT' ? '1:1 채팅' : '그룹 채팅'}
              </button>
            ))}
          </div>

          {/* 그룹: 방 이름 */}
          {tab === 'GROUP' && (
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">방 이름</label>
              <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="채팅방 이름 입력"
                className="w-full rounded-lg bg-[#1a1b1e] border border-[#3a3c42] px-3 py-2 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-[#ff7a59]"
              />
            </div>
          )}

          {/* 사용자 검색 */}
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">
              사용자 검색 {tab === 'GROUP' && selectedUsers.length > 0 && `(${selectedUsers.length}명 선택)`}
            </label>
            <input
              type="text"
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              placeholder="닉네임 검색 (2자 이상)"
              className="w-full rounded-lg bg-[#1a1b1e] border border-[#3a3c42] px-3 py-2 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-[#ff7a59]"
            />

            {searchResults.length > 0 && (
              <div className="mt-2 rounded-lg border border-[#3a3c42] overflow-hidden">
                {searchResults.map((u) => (
                  <button
                    key={u.userId}
                    onClick={() => toggleUser(u)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 text-sm transition-colors ${
                      isSelected(u)
                        ? 'bg-[#ff7a59]/15 text-white'
                        : 'bg-[#1a1b1e] text-zinc-300 hover:bg-[#2c2e33]'
                    }`}
                  >
                    <span>{u.nickname}</span>
                    <span className="text-xs text-zinc-500">{u.email}</span>
                    {isSelected(u) && <span className="text-[#ff7a59] text-xs">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 선택된 사용자 (그룹) */}
          {tab === 'GROUP' && selectedUsers.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {selectedUsers.map((u) => (
                <span
                  key={u.userId}
                  className="flex items-center gap-1 rounded-full bg-[#ff7a59]/20 text-[#ff7a59] text-xs px-2.5 py-1"
                >
                  {u.nickname}
                  <button onClick={() => toggleUser(u)} className="leading-none">✕</button>
                </span>
              ))}
            </div>
          )}

          {error && (
            <p className="text-xs text-red-400">채팅방 생성에 실패했습니다.</p>
          )}

          <button
            onClick={handleCreate}
            disabled={!canCreate || isPending}
            className="w-full rounded-xl bg-[#ff7a59] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#ff9a7a] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isPending ? '생성 중...' : '채팅방 만들기'}
          </button>
        </div>
      </div>
    </div>
  );
}
