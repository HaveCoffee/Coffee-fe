// services/conversationService.ts
// Service for user-to-user conversations (not Ella chatbot)

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

export interface SendMessageRequest {
  conversationId: string;
  message: string;
  recipientId?: string;
}

const USE_CONVERSATION_MOCK = __DEV__;

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
   * Get list of conversations
   * GET /conversations or GET /chats
   */
  async getConversations(): Promise<Conversation[]> {
    if (USE_CONVERSATION_MOCK) {
      return mockConversations;
    }
    return [];
  },

  /**
   * Get messages for a specific conversation
   * GET /conversations/{id}/messages or GET /chat/{id}/messages
   */
  async getConversationMessages(conversationId: string): Promise<ConversationMessage[]> {
    if (USE_CONVERSATION_MOCK) {
      return mockMessagesByConversationId[conversationId] || [];
    }
    return [];
  },

  /**
   * Send a message in a conversation
   * POST /conversations/{id}/messages or POST /chat/{id}/message
   */
  async sendMessage(conversationId: string, message: string, recipientId?: string): Promise<ConversationMessage> {
    if (USE_CONVERSATION_MOCK) {
      const newMessage: ConversationMessage = {
        id: `local-${Date.now()}`,
        conversationId,
        senderId: 'mock-user-123',
        senderName: 'You',
        text: message,
        timestamp: new Date().toISOString(),
        read: true,
      };

      if (!mockMessagesByConversationId[conversationId]) {
        mockMessagesByConversationId[conversationId] = [];
      }
      mockMessagesByConversationId[conversationId].push(newMessage);

      const index = mockConversations.findIndex(c => c.id === conversationId);
      if (index !== -1) {
        const updated = { ...mockConversations[index] };
        updated.lastMessage = message;
        updated.lastMessageTime = newMessage.timestamp;
        updated.unreadCount = 0;
        mockConversations[index] = updated;
      }

      return newMessage;
    }

    return {
      id: `local-${Date.now()}`,
      conversationId,
      senderId: '',
      senderName: '',
      text: message,
      timestamp: new Date().toISOString(),
      read: false,
    };
  },

  /**
   * Mark messages as read
   * PUT /conversations/{id}/read or POST /conversations/{id}/mark-read
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

  /**
   * Create a new conversation or start a chat with a user
   * POST /conversations or POST /chat/start
   */
  async createConversation(recipientId: string, initialMessage?: string, name?: string, userInfo?: UserInfo | string): Promise<Conversation> {
    if (USE_CONVERSATION_MOCK) {
      // Handle case where avatar is passed as a separate parameter for backward compatibility
      const avatarToUse = typeof userInfo === 'object' ? (userInfo.avatar || '') : (typeof userInfo === 'string' ? userInfo : '');
      const additionalInfo = typeof userInfo === 'object' ? userInfo : {};

      const newConversation: Conversation = {
        id: `conv-${Date.now()}`,
        userId: recipientId,
        userName: name || `User ${recipientId.slice(0, 6)}`,
        userAvatar: avatarToUse,
        lastMessage: initialMessage || 'New conversation started',
        lastMessageTime: new Date().toISOString(),
        unreadCount: 0,
        isOnline: true,
        ...additionalInfo
      };

      if (initialMessage) {
        const message: ConversationMessage = {
          id: `local-msg-${Date.now()}`,
          conversationId: newConversation.id,
          senderId: 'mock-user-123',
          senderName: 'You',
          text: initialMessage,
          timestamp: new Date().toISOString(),
          read: true,
        };
        mockMessagesByConversationId[conversation.id] = [message];
      }

      return conversation;
    }

    return {
      id: `local-conv-${Date.now()}`,
      userId: recipientId,
      userName: name || 'Coffee match',
      userAvatar: undefined,
      lastMessage: initialMessage || '',
      lastMessageTime: new Date().toISOString(),
      unreadCount: 0,
      isOnline: false,
    };
  },
};
