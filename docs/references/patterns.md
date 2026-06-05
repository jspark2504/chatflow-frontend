# 프로젝트 패턴 모음

## 컴포넌트 패턴

### Feature 컴포넌트 기본 구조
```tsx
// features/[name]/components/ComponentName.tsx
interface ComponentNameProps {
  // props 타입 정의
}

export function ComponentName({ }: ComponentNameProps) {
  return (
    <div>
      {/* 구현 */}
    </div>
  )
}
```

### 로딩/에러/빈 상태 처리 패턴
```tsx
if (isLoading) return <Spinner />
if (isError) return <ErrorMessage message={error.message} />
if (!data?.length) return <EmptyState />
return <>{/* 정상 렌더링 */}</>
```

## API 패턴

### Service 함수 기본 구조
```ts
// features/[name]/services/[name]Service.ts
import { api } from '@/services/api'
import type { ResponseType } from '../types/[name].types'

export const [name]Service = {
  getList: () => api.get<ResponseType[]>('/api/endpoint'),
  getOne: (id: number) => api.get<ResponseType>(`/api/endpoint/${id}`),
}
```

### TanStack Query 훅 패턴
```ts
// features/[name]/hooks/use[Name].ts
export function use[Name]() {
  return useQuery({
    queryKey: ['name'],
    queryFn: () => [name]Service.getList(),
  })
}
```
