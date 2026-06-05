# ChatFlow Frontend — Agent 가이드

## 시작하기 전에
반드시 CLAUDE.md를 먼저 읽고 프로젝트 컨텍스트를 파악할 것.

## 역할 정의
이 프로젝트에서 AI 에이전트는 다음 역할을 수행한다:
- **빌더**: 컴포넌트, 훅, 서비스 코드 작성
- **검토자**: 작성한 코드를 docs/quality/review-checklists.md 기준으로 자체 검토
- **문서 작성자**: 주요 패턴을 docs/references/patterns.md에 기록

## 작업 순서
1. CLAUDE.md 읽기
2. 작업 범위 파악
3. 구현
4. docs/quality/review-checklists.md 체크리스트 실행
5. 문제 수정 후 완료 보고

## 절대 규칙
- any 타입 사용 금지
- 하드코딩 금지 (URL, 상수 모두 환경변수 또는 constants 파일)
- API 호출은 반드시 src/services/api.ts 인스턴스 사용
- console.log 커밋 금지
- 컴포넌트는 반드시 features/ 또는 components/ 하위에 위치

## 자체 검토 기준 (4/5 이상이어야 완료)
| 항목 | 기준 |
|------|------|
| 타입 안전성 | any 없음, 모든 props 타입 정의 |
| 재사용성 | 하드코딩 없음, props로 제어 가능 |
| 일관성 | 기존 패턴과 동일한 구조 |
| 에러 처리 | 로딩/에러/빈 상태 모두 처리 |
| 접근성 | 시맨틱 HTML, aria 속성 |
