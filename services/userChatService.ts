// services/userChatService.ts
import { apiRequest } from '../utils/api';

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
}

export interface ChatConversation {
  userId: string;
  messages: ChatMessage[];
  lastMessage?: ChatMessage;
  unreadCount: number;
}

const CHAT_API_BASE_URL = 'https://havecoffee.in/api/v1';

export const userChatService = {
  /**
   * Get chat messages with a specific user
   * GET /api/v1/chat/{user_id}
   */
  async getChatMessages(userId: string): Promise<ChatConversation> {
    try {
      return await apiRequest(
        `/chat/${userId}`, 
        'GET', 
        null, 
        null, 
        CHAT_API_BASE_URL
      );
    } catch (error: any) {
      if (error.status === 404) {
        console.warn(`⚠️ Chat endpoint not available for user ${userId}`);
        // Return empty conversation as fallback
        return {
          userId,
          messages: [],
          unreadCount: 0
        };
      }
      throw error;
    }
  },

  /**
   * Send message to a specific user
   * POST /api/v1/chat/{user_id}
   */
  async sendMessage(userId: string, message: string): Promise<ChatMessage> {
    try {
      return await apiRequest(
        `/chat/${userId}`, 
        'POST', 
        { message }, 
        null, 
        CHAT_API_BASE_URL
      );
    } catch (error: any) {
      if (error.status === 404) {
        throw new Error('User chat endpoint not available');
      }
      throw error;
    }
  },

  /**
   * Mark messages as read
   * PUT /api/v1/chat/{user_id}/read
   */
  async markAsRead(userId: string): Promise<void> {
    try {
      await apiRequest(
        `/chat/${userId}/read`, 
        'PUT', 
        null, 
        null, 
        CHAT_API_BASE_URL
      );
    } catch (error: any) {
      if (error.status === 404) {
        console.warn('⚠️ Mark as read endpoint not available');
        return; // Silently fail for non-critical feature
      }
      throw error;
    }
  },
};