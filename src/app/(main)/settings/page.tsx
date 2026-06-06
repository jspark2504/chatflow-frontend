'use client';

import { useRouter } from 'next/navigation';
import useAuthStore from '@/stores/authStore';
import { useLogout } from '@/features/auth/hooks/useAuth';
import { useCurrentUser } from '@/features/user/hooks/useUsers';
import ChatLayout from '@/components/layout/ChatLayout';
import { nameToColor } from '@/components/layout/ChatLayout';

function IcChevronLeft() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const storeUser = useAuthStore((s) => s.user);
  const logout = useLogout();
  const { data: me, isLoading } = useCurrentUser();

  const user = me ?? storeUser;
  const nickname = user?.nickname ?? '';
  const avatarColor = nickname ? nameToColor(nickname) : '#6e7178';
  const initial = nickname.slice(0, 1).toUpperCase();

  return (
    <ChatLayout>
      <div className="flex flex-1 flex-col min-h-0 overflow-y-auto">
        {/* Header */}
        <header className="shrink-0 flex items-center gap-3 px-5 py-4 border-b border-[#232428]">
          <button
            onClick={() => router.back()}
            className="w-8 h-8 rounded-[9px] flex items-center justify-center text-[#6e7178] hover:bg-[#232428] hover:text-[#e9eaee] transition-colors"
          >
            <IcChevronLeft />
          </button>
          <h1 className="text-[15px] font-bold text-[#e9eaee]">내 정보</h1>
        </header>

        <div className="flex-1 flex flex-col items-center px-6 py-10 gap-6">
          {/* Avatar */}
          <div
            className="w-[88px] h-[88px] rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-[0_8px_24px_rgba(0,0,0,0.3)]"
            style={{ background: avatarColor }}
          >
            {initial}
          </div>

          {/* Info card */}
          <div className="w-full max-w-sm bg-[#232428] rounded-2xl border border-[#2c2e33] overflow-hidden">
            {isLoading ? (
              <div className="p-5 space-y-4 animate-pulse">
                <div className="h-4 w-24 rounded bg-[#2a2c31]" />
                <div className="h-4 w-40 rounded bg-[#2a2c31]" />
                <div className="h-4 w-32 rounded bg-[#2a2c31]" />
              </div>
            ) : (
              <>
                <div className="px-5 py-4 border-b border-[#2c2e33]">
                  <div className="text-[11px] font-bold uppercase tracking-[0.05em] text-[#54565c] mb-1">닉네임</div>
                  <div className="text-[14.5px] font-[600] text-[#e9eaee]">{user?.nickname ?? '—'}</div>
                </div>
                <div className="px-5 py-4">
                  <div className="text-[11px] font-bold uppercase tracking-[0.05em] text-[#54565c] mb-1">이메일</div>
                  <div className="text-[14.5px] text-[#a3a6ad]">{user?.email ?? '—'}</div>
                </div>
              </>
            )}
          </div>

          {/* Logout */}
          <div className="w-full max-w-sm">
            <button
              onClick={logout}
              className="w-full py-3 rounded-[14px] bg-red-500/10 text-red-400 text-[14px] font-semibold hover:bg-red-500/20 transition-colors border border-red-500/20"
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>
    </ChatLayout>
  );
}
