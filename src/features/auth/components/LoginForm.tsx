'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useLogin } from '../hooks/useAuth';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);

  const { mutate: login, isPending, error } = useLogin();

  const errorMessage = axios.isAxiosError(error)
    ? (error.response?.data?.message ?? '로그인에 실패했습니다.')
    : error
      ? '로그인에 실패했습니다.'
      : null;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    login({ email, password });
  };

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">로그인</h1>
        <p className="mt-1 text-sm text-zinc-400">ChatFlow에 오신 걸 환영합니다</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-zinc-300 text-sm">
            이메일
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-[#2c2e33] border-[#3a3c42] text-white placeholder:text-zinc-500 focus-visible:ring-[#ff7a59] focus-visible:border-[#ff7a59]"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-zinc-300 text-sm">
            비밀번호
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="비밀번호 입력"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-[#2c2e33] border-[#3a3c42] text-white placeholder:text-zinc-500 focus-visible:ring-[#ff7a59] focus-visible:border-[#ff7a59]"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Checkbox
              id="remember"
              checked={remember}
              onCheckedChange={(checked) => setRemember(!!checked)}
              className="border-[#3a3c42] data-[state=checked]:bg-[#ff7a59] data-[state=checked]:border-[#ff7a59]"
            />
            <Label htmlFor="remember" className="text-sm text-zinc-400 cursor-pointer">
              로그인 상태 유지
            </Label>
          </div>
          <button
            type="button"
            className="text-sm text-[#ff7a59] hover:text-[#ff9a7a] transition-colors"
          >
            비밀번호 찾기
          </button>
        </div>

        {errorMessage && (
          <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
            {errorMessage}
          </p>
        )}

        <Button
          type="submit"
          disabled={isPending}
          className="w-full bg-[#ff7a59] hover:bg-[#ff9a7a] text-white font-semibold h-11 rounded-xl transition-colors disabled:opacity-50"
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              로그인 중...
            </span>
          ) : (
            '로그인'
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-500">
        계정이 없으신가요?{' '}
        <Link
          href="/signup"
          className="text-[#ff7a59] hover:text-[#ff9a7a] font-medium transition-colors"
        >
          회원가입
        </Link>
      </p>
    </div>
  );
}
