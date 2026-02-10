// services/conversationService.ts
// Service for user-to-user conversations (not Ella chatbot)

import * as SecureStore from 'expo-secure-store';
import { AUTH_TOKEN_KEY } from '../constants/auth';
import { websocketService } from './websocketService';

export interface Conversation {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
}

export interface ConversationMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  read: boolean;
}

export interface Message {
  id: string;
  text: string;
  senderId: string;
  recipientId: string;
  timestamp: string;
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'error';
}

export interface SendMessageRequest {
  conversationId: string;
  message: string;
  recipientId?: string;
}

const USE_CONVERSATION_MOCK = false; // Use real data from active matches

const mockConversations: Conversation[] = [
  {
    id: 'conv-1',
    userId: 'match-1',
    userName: 'Anya',
    userAvatar: undefined,
    lastMessage: "Let's meet at The Daily Grind tomorrow?",
    lastMessageTime: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    unreadCount: 2,
    isOnline: true,
  },
  {
    id: 'conv-2',
    userId: 'match-2',
    userName: 'Arjun',
    userAvatar: undefined,
    lastMessage: 'That new pour-over place was incredible.',
    lastMessageTime: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    unreadCount: 0,
    isOnline: false,
  },
  {
    id: 'conv-3',
    userId: 'match-3',
    userName: 'Maya',
    userAvatar: undefined,
    lastMessage: 'Sharing some book recs for our next coffee.',
    lastMessageTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    unreadCount: 1,
    isOnline: true,
  },
];

const mockMessagesByConversationId: Record<string, ConversationMessage[]> = {
  'conv-1': [
    {
      id: 'm-1',
      conversationId: 'conv-1',
      senderId: 'match-1',
      senderName: 'Anya',
      text: "Hey, I found a cosy cafe near MG Road. Free after 6 pm tomorrow?",
      timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      read: true,
    },
    {
      id: 'm-2',
      conversationId: 'conv-1',
      senderId: 'mock-user-123',
      senderName: 'You',
      text: 'That sounds perfect. I love that side of town.',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      read: true,
    },
    {
      id: 'm-3',
      conversationId: 'conv-1',
      senderId: 'match-1',
      senderName: 'Anya',
      text: "Great, I'll book a table for two.",
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      read: false,
    },
  ],
  'conv-2': [
    {
      id: 'm-4',
      conversationId: 'conv-2',
      senderId: 'match-2',
      senderName: 'Arjun',
      text: 'Sharing the link to that coffee gear we discussed.',
      timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      read: true,
    },
  ],
  'conv-3': [
    {
      id: 'm-5',
      conversationId: 'conv-3',
      senderId: 'match-3',
      senderName: 'Maya',
      text: 'Finished that book you recommended. Mind blown.',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      read: false,
    },
  ],
};

export const conversationService = {
  /**
   * Get user profile
   * GET /me
   */
  async getUserProfile() {
    try {
      const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
      if (!token) throw new Error('No auth token found');

      const response = await fetch('https://havecoffee.in/api/v1/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Get user profile error:', error);
      throw error;
    }
  },

  /**
   * Get messages with specific user
   * GET /chat/messages/{userId}
   */
  async getChatMessages(userId: string): Promise<Message[]> {
    try {
      console.log(`🔍 [API] Fetching messages for user: ${userId}`);
      const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
      if (!token) throw new Error('No auth token found');

      const url = `https://havecoffee.in/api/v1/chat/messages/${userId}`;
      console.log(`🔍 [API] Calling: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log(`🔍 [API] Response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log(`🔍 [API] Error response: ${errorText}`);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`🔍 [API] Response data:`, data);
      
      // Transform API response to Message format
      // Handle both array response and object with messages array
      let messagesArray = [];
      
      if (Array.isArray(data)) {
        messagesArray = data;
      } else if (data.messages && Array.isArray(data.messages)) {
        messagesArray = data.messages;
      } else if (data.data && Array.isArray(data.data)) {
        messagesArray = data.data;
      }
      
      const messages = messagesArray.map(msg => ({
        id: msg.id || msg.messageId || msg.message_id || Date.now().toString(),
        text: msg.content || msg.text || msg.message || '',
        senderId: msg.senderId || msg.sender_id || '',
        recipientId: msg.receiverId || msg.recipient_id || userId,
        timestamp: msg.createdAt || msg.timestamp || msg.created_at || new Date().toISOString(),
        status: 'sent' as const,
      }));
      
      console.log(`🔍 [API] Transformed ${messages.length} messages`);
      return messages;
    } catch (error) {
      console.error('❌ Get messages error:', error);
      return [];
    }
  },

  /**
   * Get conversation with messages
   */
  async getConversationMessages(userId: string): Promise<{ messages: Message[] }> {
    const messages = await this.getChatMessages(userId);
    return { messages };
  },

  /**
   * Send message via WebSocket only
   */
  async sendMessage(recipientId: string, text: string): Promise<void> {
    const wsSuccess = websocketService.sendMessage(recipientId, text);
    if (!wsSuccess) {
      throw new Error('WebSocket not connected. Please check your connection.');
    }
  },

  async getConversations(): Promise<Conversation[]> {
    if (USE_CONVERSATION_MOCK) {
      return mockConversations;
    }
    return [];
  },

  /**
   * Mark messages as read
   */
  async markAsRead(conversationId: string, messageIds?: string[]): Promise<void> {
    if (USE_CONVERSATION_MOCK) {
      const messages = mockMessagesByConversationId[conversationId];
      if (messages) {
        mockMessagesByConversationId[conversationId] = messages.map(m => ({
          ...m,
          read: true,
        }));
      }

      const index = mockConversations.findIndex(c => c.id === conversationId);
      if (index !== -1) {
        const updated = { ...mockConversations[index] };
        updated.unreadCount = 0;
        mockConversations[index] = updated;
      }
    }
    return;
  },
};
