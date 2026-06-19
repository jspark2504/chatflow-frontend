export type RoomType = 'DIRECT' | 'GROUP';

export interface RoomMember {
  userId: number;
  nickname: string;
}

export interface RoomResponse {
  roomId: number;
  roomName: string;
  type: RoomType;
  memberCount: number;
  unreadCount: number;
  lastReadMessageId: number | null;
  createdAt: string;
  lastMessageAt: string | null;
  members: RoomMember[];
}

export interface CreateRoomRequest {
  type: RoomType;
  roomName?: string;
  targetUserId?: number;
  memberUserIds?: number[];
}

export interface MarkReadRequest {
  lastReadMessageId: number;
}
