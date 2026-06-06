import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { roomService } from '../services/roomService';

export function useRooms() {
  return useQuery({
    queryKey: ['rooms'],
    queryFn: roomService.getRooms,
  });
}

export function useRoom(roomId: number) {
  return useQuery({
    queryKey: ['rooms', roomId],
    queryFn: () => roomService.getRoom(roomId),
    enabled: !!roomId,
  });
}

export function useMarkRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roomId, lastReadMessageId }: { roomId: number; lastReadMessageId: number }) =>
      roomService.markRead(roomId, lastReadMessageId),
    onSuccess: (_, { roomId }) => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['rooms', roomId] });
    },
  });
}
