import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { roomService } from '../services/roomService';
import type { CreateRoomRequest } from '../types/room.types';

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

export function useCreateRoom() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: CreateRoomRequest) => roomService.createRoom(data),
    onSuccess: (room) => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      router.push(`/chat/${room.roomId}`);
    },
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
