import { useInfiniteQuery } from '@tanstack/react-query';
import { chatService } from '../services/chatService';
import type { MessagePageResponse } from '../types/chat.types';

export function useMessages(roomId: number) {
  return useInfiniteQuery({
    queryKey: ['messages', roomId],
    queryFn: ({ pageParam }: { pageParam: number | undefined }) =>
      chatService.getMessages(roomId, 20, pageParam),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage: MessagePageResponse) =>
      lastPage.hasMore && lastPage.nextCursor != null ? lastPage.nextCursor : undefined,
    enabled: !!roomId,
  });
}
