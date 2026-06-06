'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useSignup } from '../hooks/useAuth';

function getPasswordStrength(password: string): number {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  return score;
}

const STRENGTH_CONFIG: Record<number, { label: string; color: string }> = {
  0: { label: '', color: '' },
  1: { label: '매우 약함', color: 'bg-red-500' },
  2: { label: '약함', color: 'bg-orange-500' },
  3: { label: '보통', color: 'bg-yellow-500' },
  4: { label: '강함', color: 'bg-green-400' },
  5: { label: '매우 강함', color: 'bg-[#3ba55d]' },
};

export default function SignupForm() {
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const { mutate: signup, isPending, error } = useSignup();

  const strength = getPasswordStrength(password);
  const strengthConfig = STRENGTH_CONFIG[strength];
  const passwordMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const errorMessage = (() => {
    if (!error) return null;
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const serverMessage = error.response?.data?.message as string | undefined;
      if (status === 409) return '이미 사용 중인 이메일입니다.';
      if (status === 400) return serverMessage ?? '입력값을 확인해주세요.';
      if (status === 500) return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      return serverMessage ?? '회원가입에 실패했습니다.';
    }
    return '회원가입에 실패했습니다.';
  })();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (passwordMismatch) return;
    signup({ nickname, email, password });
  };

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">회원가입</h1>
        <p className="mt-1 text-sm text-zinc-400">ChatFlow를 시작하세요</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="nickname" className="text-zinc-300 text-sm">
            닉네임
          </Label>
          <Input
            id="nickname"
            type="text"
            placeholder="사용할 닉네임 입력"
            autoComplete="nickname"
            required
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="bg-[#2c2e33] border-[#3a3c42] text-white placeholder:text-zinc-500 focus-visible:ring-[#ff7a59] focus-visible:border-[#ff7a59]"
          />
        </div>

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
            placeholder="8자 이상, 영문/숫자/특수문자"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-[#2c2e33] border-[#3a3c42] text-white placeholder:text-zinc-500 focus-visible:ring-[#ff7a59] focus-visible:border-[#ff7a59]"
          />

          {/* 비밀번호 강도 미터 */}
          {password.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((level) => (
                  <div
                    key={level}
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      strength >= level ? strengthConfig.color : 'bg-[#3a3c42]'
                    }`}
                  />
                ))}
              </div>
              {strengthConfig.label && (
                <p className="text-xs text-zinc-400">
                  비밀번호 강도:{' '}
                  <span
                    className={
                      strength <= 2
                        ? 'text-red-400'
                        : strength === 3
                          ? 'text-yellow-400'
                          : 'text-green-400'
                    }
                  >
                    {strengthConfig.label}
                  </span>
                </p>
              )}
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword" className="text-zinc-300 text-sm">
            비밀번호 확인
          </Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="비밀번호 재입력"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={`bg-[#2c2e33] border-[#3a3c42] text-white placeholder:text-zinc-500 focus-visible:ring-[#ff7a59] focus-visible:border-[#ff7a59] ${
              passwordMismatch ? 'border-red-500 focus-visible:ring-red-500' : ''
            }`}
          />
          {passwordMismatch && (
            <p className="text-xs text-red-400">비밀번호가 일치하지 않습니다.</p>
          )}
        </div>

        {errorMessage && (
          <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
            {errorMessage}
          </p>
        )}

        <Button
          type="submit"
          disabled={isPending || passwordMismatch}
          className="w-full bg-[#ff7a59] hover:bg-[#ff9a7a] text-white font-semibold h-11 rounded-xl transition-colors disabled:opacity-50"
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              가입 중...
            </span>
          ) : (
            '회원가입'
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-500">
        이미 계정이 있으신가요?{' '}
        <Link
          href="/login"
          className="text-[#ff7a59] hover:text-[#ff9a7a] font-medium transition-colors"
        >
          로그인
        </Link>
      </p>
    </div>
  );
}
