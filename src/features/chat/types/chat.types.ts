export interface MessageType {
  messageId: number;
  roomId: number;
  senderId: number;
  senderNickname: string;
  content: string;
  createdAt: string;
  readCount: number;
}

export interface MessageListResponse {
  messages: MessageType[];
  hasMore: boolean;
  nextCursor: number | null;
}

export interface SendMessagePayload {
  roomId: number;
  content: string;
}
