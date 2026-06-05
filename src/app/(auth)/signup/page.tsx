import SignupForm from '@/features/auth/components/SignupForm';

function BrandPanel() {
  return (
    <div className="hidden lg:flex flex-col justify-center items-center flex-1 bg-[#111214] relative overflow-hidden px-12">
      {/* 배경 장식 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 -left-20 w-72 h-72 rounded-full bg-[#ff7a59]/10 blur-3xl" />
        <div className="absolute bottom-1/3 right-0 w-64 h-64 rounded-full bg-[#ff7a59]/5 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-md text-center">
        {/* 로고 */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[#ff7a59] flex items-center justify-center shadow-lg shadow-[#ff7a59]/30">
            <svg
              className="w-7 h-7 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <span className="text-3xl font-bold text-white tracking-tight">ChatFlow</span>
        </div>

        <h2 className="text-2xl font-bold text-white mb-3 leading-snug">
          지금 바로 시작하세요,
          <br />
          <span className="text-[#ff7a59]">무료로</span>
        </h2>
        <p className="text-zinc-400 text-base leading-relaxed mb-10">
          30초 안에 계정을 만들고
          <br />
          ChatFlow의 모든 기능을 경험하세요.
        </p>

        {/* 온보딩 스텝 */}
        <ol className="space-y-4 text-left inline-block">
          {[
            { step: '01', text: '이메일로 간편하게 가입' },
            { step: '02', text: '채팅방을 만들거나 초대받기' },
            { step: '03', text: '실시간으로 대화 시작하기' },
          ].map(({ step, text }) => (
            <li key={step} className="flex items-center gap-4">
              <span className="text-xs font-bold text-[#ff7a59] w-6 shrink-0">{step}</span>
              <span className="text-zinc-300 text-sm">{text}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <div className="flex flex-1 min-h-screen bg-[#1a1b1e]">
      <BrandPanel />

      {/* 폼 영역 */}
      <div className="flex flex-1 items-center justify-center px-6 py-12 lg:px-16">
        <div className="w-full max-w-sm bg-[#232428] border border-[#2c2e33] rounded-2xl p-8 shadow-2xl">
          <SignupForm />
        </div>
      </div>
    </div>
  );
}
