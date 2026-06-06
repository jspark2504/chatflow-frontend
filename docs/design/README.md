# ChatFlow Design Reference

> **이 폴더는 UI 레퍼런스 전용입니다.**  
> `src/`에서 직접 import 하지 말고, 스타일·레이아웃·컴포넌트 구조를 참고해 Next.js 앱으로 **이식**하세요.

## 파일 역할

| 파일 | 용도 |
|------|------|
| `ChatFlow.html` | 메인 채팅 앱 정적 목업 (CSS 변수·레이아웃 원본) |
| `main-app.jsx` | 채팅 앱 React 프로토타입 (사이드바·메시지·입력·우측 패널) |
| `components.jsx` | 공통 UI 조각 (아바타, 버튼, 메시지 버블 등) |
| `data.jsx` | **목업 데이터** (`ROOMS`, `AV`) — 실제 API 아님 |
| `Login.html` | 로그인 화면 레퍼런스 |
| `Signup.html` | 회원가입 화면 레퍼런스 |

## 디자인 토큰 (ChatFlow.html `:root` 기준)

| 토큰 | 값 |
|------|-----|
| 앱 배경 | `#1a1b1e` |
| 사이드바 | `#161719` |
| 카드/elevated | `#232428` |
| 보더 | `#2c2e33` |
| 포인트 (코랄) | `#ff7a59` |
| 본문 텍스트 | `#e9eaee` |
| 폰트 | Pretendard |

Tailwind 이식 시 로그인/채팅 페이지와 **동일 톤** 유지.

## `src/` 이식 매핑 (가이드)

| 레퍼런스 | 이식 대상 (예시) |
|----------|------------------|
| 사이드바 + 방 목록 | `src/components/layout/ChatLayout.tsx` |
| 메시지 목록/입력 | `src/features/chat/components/MessageList.tsx`, `MessageInput.tsx` |
| 우측 참여자 패널 | `src/features/room/components/RoomDetailPanel.tsx` (신규) |
| 하단 프로필/설정 | `ChatLayout` 하단 + `src/app/(main)/settings/page.tsx` |
| Login.html | `src/features/auth/components/LoginForm.tsx` (이미 유사) |
| Signup.html | `src/features/auth/components/SignupForm.tsx` |

## 백엔드 API (목업 ↔ 실제)

레퍼런스 `data.jsx` 필드와 **다를 수 있음**. 실제 API 기준:

```
GET  /api/chat/rooms          → roomId, roomName, type, unreadCount, members ...
GET  /api/chat/rooms/{id}/messages?size=&beforeMessageId=
PUT  /api/chat/rooms/{id}/read
GET  /api/users/me            → userId, email, nickname
POST /api/auth/login
```

- 로그아웃 API **없음** → `useLogout()` (WS 끊기 + clearAuth + `/login`) — **구현됨**
- 프로필 수정 API **없음** → `/settings` 조회만 — **구현됨**
- 상세: `docs/TASK-auth-logout.md`

## 로컬에서 목업 미리보기

`ChatFlow.html` / `Login.html` / `Signup.html`은 브라우저에서 파일 직접 열기.

`main-app.jsx`는 HTML shell에서 React CDN + `data.jsx` + `components.jsx` 로드하는 구조일 수 있음 — `ChatFlow.html` 참고.

## Claude Code 작업 시 프롬프트 예시

```
docs/design/README.md 와 main-app.jsx, ChatFlow.html 을 읽고
src/app/(main)/chat/ 레이아웃을 레퍼런스와 맞춰 이식해줘.
docs/design 은 import 금지. Tailwind + 기존 features/ 구조 사용.
```
