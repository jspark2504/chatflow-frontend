@AGENTS.md
# ChatFlow Frontend — Claude Code 가이드

## 프로젝트 개요
실시간 채팅 서비스 ChatFlow의 프론트엔드 클라이언트.
백엔드: chatflow-server (WebFlux + Kafka + Redis Pub/Sub)

## 기술 스택
- Next.js 15 (App Router)
- TypeScript (strict mode)
- TailwindCSS
- shadcn/ui
- TanStack Query
- Axios
- Zustand
- WebSocket (STOMP 미사용, 순수 WebSocket)

## 절대 규칙 (위반 금지)
- `any` 타입 사용 금지 — unknown 또는 명시적 타입 사용
- 하드코딩 금지 — 모든 URL, 상수는 환경변수 또는 constants 파일 사용
- `console.log` 금지 — 디버깅 후 반드시 제거
- 직접 fetch 금지 — 반드시 src/services/api.ts의 Axios 인스턴스 사용
- 인라인 스타일 금지 — TailwindCSS 클래스만 사용

## 폴더 구조
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (main)/
│   │   ├── layout.tsx        # 3단 레이아웃
│   │   ├── page.tsx          # 채팅방 미선택
│   │   └── chat/[roomId]/page.tsx
│   ├── layout.tsx
│   ├── globals.css
│   └── providers.tsx
├── features/
│   ├── auth/
│   ├── chat/
│   ├── room/
│   ├── user/
│   └── notification/
├── components/
│   ├── ui/                   # shadcn/ui 기반
│   └── layout/
├── hooks/
├── services/
│   └── api.ts                # Axios 인스턴스 (여기서만 API 호출)
├── stores/
│   ├── authStore.ts
│   ├── chatStore.ts
│   └── uiStore.ts
├── types/
├── lib/
│   ├── queryClient.ts
│   └── websocket.ts
└── utils/

## 각 feature 폴더 구조
features/[name]/
├── components/
├── hooks/
├── services/
└── types/

## API 엔드포인트
BASE_URL: process.env.NEXT_PUBLIC_API_URL

POST   /api/auth/signup
POST   /api/auth/login
GET    /api/users/search?q=닉네임
GET    /api/users/{userId}
POST   /api/chat/rooms
GET    /api/chat/rooms
GET    /api/chat/rooms/{roomId}
GET    /api/chat/rooms/{roomId}/messages
PUT    /api/chat/messages/{messageId}/read
GET    /api/conversations/recent
GET    /api/conversations/unread
GET    /api/notifications
PUT    /api/notifications/{id}/read
GET    /api/status/online-users

## WebSocket
URL: process.env.NEXT_PUBLIC_WS_URL (예: ws://localhost:8080/ws/chat)
구독: /topic/chat/{roomId}
발행: /app/chat/send
- JWT를 연결 시 헤더에 포함
- 재연결: Exponential Backoff (1s → 2s → 4s → max 30s)
- 연결 상태: CONNECTING / CONNECTED / DISCONNECTED

## 상태 관리 기준
| 상태 종류              | 도구           |
|----------------------|----------------|
| 인증 (token, user)    | Zustand        |
| 서버 데이터 (목록 등)  | TanStack Query |
| 실시간 메시지          | Zustand        |
| UI 상태 (모달 등)     | Zustand        |

## 디자인 시스템
- 다크모드 기본
- 색상: 배경 #1a1b1e, 카드 #232428, 테두리 #2c2e33
- 액센트: 코랄 #ff7a59
- 온라인 상태: 초록 #3ba55d
- 폰트: Pretendard
- 컴포넌트: shadcn/ui 기반 확장

## 코드 작성 규칙
- 컴포넌트: PascalCase (MessageItem.tsx)
- 훅: camelCase, use 접두사 (useMessages.ts)
- 타입: PascalCase + Type/Interface suffix (MessageType)
- 상수: UPPER_SNAKE_CASE
- 새 기능은 반드시 features/ 하위에 작성
- 공통 컴포넌트만 components/에 작성