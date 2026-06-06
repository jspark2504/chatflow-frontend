export interface RoomResponse {
  roomId: number;
  name: string;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
  lastReadMessageId: number | null;
}

export interface CreateRoomRequest {
  name: string;
  participantIds: number[];
}

export interface MarkReadRequest {
  lastReadMessageId: number;
}
