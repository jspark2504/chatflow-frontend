'use client';

import { KeyboardEvent, useRef, useState } from 'react';

function IcSend() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3.4 20.4 21 12 3.4 3.6 3 10l12 2-12 2 .4 6.4Z" />
    </svg>
  );
}

interface MessageInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
}

export default function MessageInput({ onSend, disabled = false }: MessageInputProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 132)}px`;
  };

  const canSend = !disabled && value.trim().length > 0;

  return (
    <div className="shrink-0 px-4 pb-4 pt-2">
      <div
        className={`flex items-end gap-2 bg-[#26272b] border rounded-[16px] px-3.5 pt-3 pb-3 transition-colors ${
          disabled ? 'border-[#2c2e33] opacity-60' : 'border-[#2c2e33] focus-within:border-[#ff7a59]'
        }`}
      >
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          disabled={disabled}
          placeholder={disabled ? '연결 중...' : '메시지 입력'}
          className="flex-1 resize-none bg-transparent text-[14px] text-[#e9eaee] placeholder:text-[#6e7178] outline-none leading-[1.55] max-h-[132px] disabled:cursor-not-allowed"
        />
        <button
          onClick={submit}
          disabled={!canSend}
          title="전송"
          className={`shrink-0 w-[38px] h-[38px] rounded-[11px] flex items-center justify-center transition-all ${
            canSend
              ? 'bg-[#ff7a59] text-white hover:bg-[#ff9a7a] shadow-[0_3px_10px_rgba(255,122,89,0.35)]'
              : 'bg-[#2c2e33] text-[#54565c] cursor-not-allowed'
          }`}
        >
          <IcSend />
        </button>
      </div>
    </div>
  );
}
