'use client';

import ChatLayout from '@/components/layout/ChatLayout';
import RoomDetailPanel from '@/features/room/components/RoomDetailPanel';

function EmptyChat() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="flex flex-col items-center text-center max-w-[360px] px-6">
        {/* Animated logo */}
        <div className="relative mb-6">
          <div className="w-[78px] h-[78px] rounded-[22px] bg-gradient-to-br from-[#ff7a59] to-[#ff4f8b] flex items-center justify-center shadow-[0_16px_40px_rgba(255,90,110,0.3)]">
            <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z" />
            </svg>
          </div>
          <span className="absolute inset-0 rounded-[22px] border-2 border-[#ff7a59] animate-ping opacity-20" />
        </div>
        <h2 className="text-[22px] font-[750] tracking-[-0.02em] text-[#e9eaee] mb-2">
          대화를 시작해보세요
        </h2>
        <p className="text-[13.5px] text-[#6e7178] leading-relaxed">
          왼쪽 목록에서 채팅방을 선택하거나<br />새로운 대화를 시작하세요.
        </p>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <ChatLayout rightPanel={<RoomDetailPanel room={undefined} />}>
      <EmptyChat />
    </ChatLayout>
  );
}
