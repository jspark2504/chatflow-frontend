'use client';

import { use, useSyncExternalStore } from 'react';
import ChatLayout, { roomAvatarStyle } from '@/components/layout/ChatLayout';
import { wsClient } from '@/lib/websocket';
import RoomDetailPanel from '@/features/room/components/RoomDetailPanel';
import MessageList from '@/features/chat/components/MessageList';
import MessageInput from '@/features/chat/components/MessageInput';
import { useRoom } from '@/features/room/hooks/useRooms';
import { useRoomChat } from '@/features/chat/hooks/useRoomChat';

function IcHash() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="4" y1="9" x2="20" y2="9" /><line x1="4" y1="15" x2="20" y2="15" />
      <line x1="10" y1="3" x2="8" y2="21" /><line x1="16" y1="3" x2="14" y2="21" />
    </svg>
  );
}

export default function ChatRoomPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId: roomIdParam } = use(params);
  const roomId = Number(roomIdParam);

  const { data: room, isError: roomError } = useRoom(roomId);
  const { messages, hasMore, isLoading, isLoadingMore, loadMore, sendMessage } = useRoomChat(roomId);
  const wsState = useSyncExternalStore(wsClient.subscribeState, wsClient.getState, () => 'DISCONNECTED' as const);
  const wsDisconnected = wsState !== 'CONNECTED';
  const roomAvatar = room ? roomAvatarStyle(room) : null;

  return (
    <ChatLayout rightPanel={<RoomDetailPanel room={room} />}>
      {/* Chat header */}
      <header className="shrink-0 flex items-center gap-3 px-5 py-[14px] border-b border-[#232428] bg-[#1a1b1e]">
        {roomError ? (
          <span className="text-[13px] text-red-400">채팅방을 불러오지 못했습니다.</span>
        ) : room ? (
          <>
            {room.type === 'GROUP' && roomAvatar ? (
              <div
                className="flex items-center justify-center w-7 h-7 rounded-[9px] text-[12px] font-bold text-white"
                style={{ background: roomAvatar.background }}
              >
                {roomAvatar.initial}
              </div>
            ) : (
              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-[#232428] text-[#a3a6ad]">
                <IcHash />
              </div>
            )}
            <div>
              <h2 className="text-[14.5px] font-bold text-[#e9eaee] leading-tight">{room.roomName}</h2>
              <p className="text-[12px] text-[#6e7178] mt-[1px]">
                {room.type === 'DIRECT' ? '1:1 채팅' : `그룹 · ${room.memberCount}명`}
              </p>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2.5 animate-pulse">
            <div className="w-7 h-7 rounded-[9px] bg-[#232428]" />
            <div className="space-y-1.5">
              <div className="h-3 w-24 rounded bg-[#232428]" />
              <div className="h-2.5 w-16 rounded bg-[#232428]" />
            </div>
          </div>
        )}
      </header>

      {/* Messages */}
      <MessageList
        roomId={roomId}
        messages={messages}
        members={room?.members}
        hasMore={hasMore}
        isLoading={isLoading}
        isLoadingMore={isLoadingMore}
        onLoadMore={loadMore}
      />

      {/* Input */}
      <MessageInput onSend={sendMessage} disabled={wsDisconnected} />
    </ChatLayout>
  );
}
