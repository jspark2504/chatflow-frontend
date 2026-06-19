'use client';

import { useLayoutEffect, useRef } from 'react';
import useAuthStore from '@/stores/authStore';
import { nameToColor } from '@/components/layout/ChatLayout';
import type { MessageResponse, PendingMessage } from '../types/chat.types';

function IcRetry() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}

function IcSpinner() {
  return (
    <svg className="animate-spin" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });
}

// ── Block types ───────────────────────────────────────────────────────────────
type DateBlock = { kind: 'date'; label: string };
type MsgGroup = { kind: 'group'; senderId: number; isOwn: boolean; items: MessageResponse[] };
type Block = DateBlock | MsgGroup;

function buildBlocks(messages: MessageResponse[], currentUserId: string | undefined): Block[] {
  const out: Block[] = [];
  let lastDate = '';
  let cur: MsgGroup | null = null;

  for (const msg of messages) {
    const date = fmtDate(msg.createdAt);
    if (date !== lastDate) {
      lastDate = date;
      out.push({ kind: 'date', label: date });
      cur = null;
    }
    const isOwn = String(msg.senderId) === currentUserId;
    if (cur && cur.senderId === msg.senderId) {
      cur.items.push(msg);
    } else {
      cur = { kind: 'group', senderId: msg.senderId, isOwn, items: [msg] };
      out.push(cur);
    }
  }
  return out;
}

// ── Message group ─────────────────────────────────────────────────────────────
interface GroupProps {
  block: MsgGroup;
  getNickname: (id: number) => string;
}

function MsgGroupView({ block, getNickname }: GroupProps) {
  const { isOwn, senderId, items } = block;
  const name = isOwn ? '' : getNickname(senderId);
  const color = isOwn ? '' : nameToColor(name || String(senderId));
  const initial = isOwn ? '' : (name || String(senderId)).slice(0, 1).toUpperCase();

  return (
    <div className={`flex gap-[11px] mb-[6px] ${isOwn ? 'flex-row-reverse' : ''}`}>
      {/* Avatar placeholder for own / actual for others */}
      {!isOwn ? (
        <div
          className="w-[38px] h-[38px] rounded-full flex items-center justify-center text-[14px] font-semibold text-white shrink-0 self-end mb-[2px]"
          style={{ background: color }}
        >
          {initial}
        </div>
      ) : (
        <div className="w-[38px] shrink-0" />
      )}

      {/* Bubble stack */}
      <div className={`flex flex-col min-w-0 max-w-[66%] ${isOwn ? 'items-end' : 'items-start'}`}>
        {!isOwn && name && (
          <span className="mb-[5px] px-0.5 text-[12.5px] font-[650] text-[#a3a6ad]">{name}</span>
        )}
        {items.map((msg, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <div
              key={msg.messageId}
              className={`flex items-end gap-[7px] ${isOwn ? 'flex-row-reverse' : ''} ${idx > 0 ? 'mt-[3px]' : ''}`}
            >
              <div
                className={`px-[13px] py-[9px] text-[14px] leading-[1.55] break-words whitespace-pre-wrap max-w-full ${
                  isOwn
                    ? 'bg-[#ff7a59] text-white rounded-[16px] rounded-tr-[5px]'
                    : 'bg-[#232428] text-[#e9eaee] rounded-[16px] rounded-tl-[5px]'
                }`}
              >
                {msg.content}
              </div>
              {isLast && (
                <div className={`flex flex-col gap-[1px] pb-[2px] shrink-0 ${isOwn ? 'items-end' : 'items-start'}`}>
                  {isOwn && (
                    <span className={`text-[10px] font-bold ${msg.read ? 'text-[#ff7a59]' : 'text-[#54565c]'}`}>
                      {msg.read ? '읽음' : '안읽음'}
                    </span>
                  )}
                  <span className="text-[10.5px] text-[#54565c] whitespace-nowrap">{fmtTime(msg.createdAt)}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface MessageListProps {
  roomId: number;
  messages: MessageResponse[];
  pending?: PendingMessage[];
  members?: Array<{ userId: number; nickname: string }>;
  hasMore: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
  onRetry?: (clientId: string) => void;
}

export default function MessageList({
  roomId,
  messages,
  pending = [],
  members = [],
  hasMore,
  isLoading,
  isLoadingMore,
  onLoadMore,
  onRetry,
}: MessageListProps) {
  const currentUserId = useAuthStore((s) => s.user?.id);
  const containerRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);
  const prevScrollHeightRef = useRef(0);
  const prevMessageCountRef = useRef(0);

  const getNickname = (id: number): string =>
    members.find((m) => m.userId === id)?.nickname ?? `User ${id}`;

  // 방 진입 시 최하단으로
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
      isAtBottomRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  // 메시지 추가/선두 삽입 시 스크롤 처리
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el || messages.length === 0) return;

    const delta = messages.length - prevMessageCountRef.current;
    if (delta > 0 && prevMessageCountRef.current > 0 && prevScrollHeightRef.current > 0) {
      el.scrollTop = el.scrollHeight - prevScrollHeightRef.current;
      prevScrollHeightRef.current = 0;
    } else if (isAtBottomRef.current) {
      el.scrollTop = el.scrollHeight;
    }
    prevMessageCountRef.current = messages.length;
  }, [messages]);

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    isAtBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
    if (el.scrollTop < 80 && hasMore && !isLoadingMore) {
      prevScrollHeightRef.current = el.scrollHeight;
      onLoadMore();
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <span className="text-[13px] text-[#6e7178]">메시지 불러오는 중...</span>
      </div>
    );
  }

  const blocks = buildBlocks(messages, currentUserId);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto px-5 pt-5 pb-3"
    >
      {isLoadingMore && (
        <div className="flex justify-center py-3">
          <span className="text-[12px] text-[#6e7178]">이전 메시지 불러오는 중...</span>
        </div>
      )}
      {!isLoadingMore && hasMore && (
        <div className="flex justify-center py-3">
          <button
            onClick={() => {
              prevScrollHeightRef.current = containerRef.current?.scrollHeight ?? 0;
              onLoadMore();
            }}
            className="text-[12px] text-[#6e7178] hover:text-[#a3a6ad] transition-colors"
          >
            이전 메시지 더 보기
          </button>
        </div>
      )}

      {messages.length === 0 && (
        <div className="flex flex-1 h-full items-center justify-center">
          <p className="text-[13px] text-[#6e7178]">첫 번째 메시지를 보내보세요</p>
        </div>
      )}

      {blocks.map((block, i) => {
        if (block.kind === 'date') {
          return (
            <div key={`date-${i}`} className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-[#2c2e33]" />
              <span className="shrink-0 text-[11px] font-medium text-[#54565c] px-1">{block.label}</span>
              <div className="flex-1 h-px bg-[#2c2e33]" />
            </div>
          );
        }
        return (
          <MsgGroupView
            key={`group-${block.items[0].messageId}`}
            block={block}
            getNickname={getNickname}
          />
        );
      })}

      {pending.map((p) => (
        <div key={p.clientId} className="flex gap-[11px] mb-[6px] flex-row-reverse">
          <div className="w-[38px] shrink-0" />
          <div className="flex flex-col min-w-0 max-w-[66%] items-end">
            <div className="flex items-end gap-[7px] flex-row-reverse">
              <div
                className={`px-[13px] py-[9px] text-[14px] leading-[1.55] break-words whitespace-pre-wrap max-w-full rounded-[16px] rounded-tr-[5px] bg-[#ff7a59] text-white ${
                  p.status === 'failed' ? 'opacity-50 ring-1 ring-red-400' : 'opacity-60'
                }`}
              >
                {p.content}
              </div>
              <div className="flex flex-col gap-[2px] pb-[2px] shrink-0 items-end">
                {p.status === 'sending' ? (
                  <span className="text-[#6e7178]"><IcSpinner /></span>
                ) : (
                  onRetry && (
                    <button
                      onClick={() => onRetry(p.clientId)}
                      title="재전송"
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <IcRetry />
                    </button>
                  )
                )}
                <span className={`text-[10px] whitespace-nowrap ${p.status === 'failed' ? 'text-red-400' : 'text-[#6e7178]'}`}>
                  {p.status === 'failed' ? '전송 실패' : '전송 중'}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
