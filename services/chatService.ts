// services/chatService.ts
import { apiRequest } from '../utils/api';
import { getAuthToken } from './authService';

export const chatService = {
  async getChatHistory() {
    try {
      const token = await getAuthToken();
      return await apiRequest('/v1/chat/history', 'GET', null, token);
    } catch (error) {
      console.error('Error fetching chat history:', error);
      throw error;
    }
  },

  async sendMessage(message: string) {
    try {
      const token = await getAuthToken();
      const timestamp = new Date().toISOString();
      return await apiRequest('/v1/chat/send', 'POST', { message, timestamp }, token);
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }
};