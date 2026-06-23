import api from './api';
import type { Conversation, Message, ApiResponse } from '../types';

export const chatService = {
  async getConversations() {
    const { data } = await api.get<ApiResponse<Conversation[]>>('/chat/conversations');
    return data;
  },

  async getOrCreateConversation(listingId: string, landlordId: string) {
    const { data } = await api.post<ApiResponse<Conversation>>('/chat/conversations', {
      listingId, landlordId,
    });
    return data;
  },

  async getMessages(conversationId: string, page = 1) {
    const { data } = await api.get<ApiResponse<{ messages: Message[]; hasMore: boolean }>>(
      `/chat/conversations/${conversationId}/messages?page=${page}`
    );
    return data;
  },

  async markRead(conversationId: string) {
    await api.patch(`/chat/conversations/${conversationId}/read`);
  },
};