import { apiClient } from "./apiClient";

export interface ChatPeer {
  _id: string;
  name?: string;
  username?: string;
  profileImage?: string;
}

export interface ChatConversation {
  _id: string;
  peer: ChatPeer | null;
  lastMessageText: string;
  lastMessageAt?: string;
  unreadCount: number;
}

export interface ProductContext {
  productId: string;
  name: string;
  image: string;
  price: number;
  slug?: string;
}

export interface ChatMessage {
  _id: string;
  conversation: string;
  sender: ChatPeer;
  body: string;
  kind: "text" | "image" | "system" | "product";
  imageUrl?: string;
  productContext?: ProductContext;
  readBy: string[];
  createdAt: string;
}

interface ListResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export const fetchConversations = async (): Promise<ChatConversation[]> => {
  const res = await apiClient<ListResponse<ChatConversation[]>>("/messages/conversations");
  return res.data ?? [];
};

export const fetchMessages = async (
  conversationId: string,
  limit = 100
): Promise<ChatMessage[]> => {
  const res = await apiClient<ListResponse<ChatMessage[]>>(
    `/messages/conversations/${conversationId}/messages?limit=${limit}`
  );
  return res.data ?? [];
};

export const sendChatMessage = async (
  conversationId: string,
  payload: { body?: string; kind?: "text" | "image"; imageUrl?: string }
): Promise<ChatMessage | null> => {
  const res = await apiClient<ListResponse<ChatMessage>>(
    `/messages/conversations/${conversationId}/messages`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
  return res.data ?? null;
};

export const markConversationRead = async (conversationId: string): Promise<void> => {
  await apiClient(`/messages/conversations/${conversationId}/read`, { method: "POST" });
};

export interface UnreadSummary {
  messages: number;
  notifications: number;
  total: number;
}

export const fetchUnreadSummary = async (): Promise<UnreadSummary> => {
  const res = await apiClient<ListResponse<UnreadSummary>>("/messages/unread-summary");
  return res.data ?? { messages: 0, notifications: 0, total: 0 };
};
