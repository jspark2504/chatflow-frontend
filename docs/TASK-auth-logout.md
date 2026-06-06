# 인증 · 로그아웃 · 내 정보 (구현 완료 기준)

## 로그아웃 (프론트 전용)

백엔드 `POST /api/auth/logout` **없음**. JWT 무상태.

### `useLogout()` — `src/features/auth/hooks/useAuth.ts`

로그아웃 시 순서:

1. `wsClient.disconnect()` — WebSocket 재연결 중단
2. `authStore.clearAuth()` — user, accessToken 삭제 (persist)
3. `chatStore.resetAll()` — 메시지 캐시 초기화
4. `queryClient.clear()` — React Query 캐시 초기화
5. `router.replace('/login')`

### UI 진입점

| 위치 | 동작 |
|------|------|
| `ChatLayout` 사이드바 하단 프로필 클릭 | 드롭다운 → **로그아웃** |
| `/settings` | **로그아웃** 버튼 |

## 내 정보

| 항목 | 값 |
|------|-----|
| 경로 | `/settings` |
| API | `GET /api/users/me` → `{ userId, email, nickname }` |
| 수정 | API 없음 — 읽기 전용 |

## 파일 맵

```
features/auth/hooks/useAuth.ts   → useLogin, useSignup, useLogout
app/(main)/settings/page.tsx     → 내 정보 페이지
components/layout/ChatLayout.tsx → 사이드바 프로필 메뉴
stores/authStore.ts              → clearAuth, persist
lib/websocket.ts                 → disconnect on logout
```

## Claude Code 확장 시

- 프로필 수정: 백엔드 `PATCH /api/users/me` 추가 후 settings 폼 연결
- 서버 로그아웃: Redis 토큰 블랙리스트 (선택, 현재 불필요)
