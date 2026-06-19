export interface MessageResponse {
  messageId: number;
  roomId: number;
  senderId: number;
  messageType: string;
  content: string;
  read: boolean;
  createdAt: string;
}

export interface MessagePageResponse {
  messages: MessageResponse[];
  hasMore: boolean;
  nextCursor: number | null;
}

export interface SendMessageRequest {
  content: string;
  messageType?: string;
}

export interface WsPresenceFrame {
  type: 'USER_ONLINE' | 'USER_OFFLINE';
  userId: number;
}
