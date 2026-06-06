import { useQuery } from '@tanstack/react-query';
import { userService } from '../services/userService';

export function useSearchUsers(q: string) {
  return useQuery({
    queryKey: ['users', 'search', q],
    queryFn: () => userService.search(q),
    enabled: q.trim().length >= 2,
    staleTime: 30_000,
  });
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ['users', 'me'],
    queryFn: userService.getMe,
    staleTime: 5 * 60_000,
  });
}
