// services/chatService.ts
import * as SecureStore from 'expo-secure-store';
import { chatApi } from '../utils/api';

export interface Message {
  id: string;
  type: 'text' | 'options' | 'action' | 'match';
  content: string | any;
  sender: 'user' | 'bot';
  time: string;
  status?: 'sending' | 'sent' | 'failed';
  threadId?: string;
}

export interface OptionButton {
  id: string;
  label: string;
  icon: string;
  value: string;
}

export interface MatchCard {
  name: string;
  availability: string;
  matchPercentage: number;
  description: string;
  sharedInterests: string[];
  conversationStarter?: string;
}

const THREAD_ID_STORAGE_KEY = 'chat_thread_id';
const USE_CHAT_MOCK = false;

let mockChatHistory: Message[] = [
  {
    id: 'welcome',
    type: 'text',
    content:
      "Hi! I'm Ella, your AI assistant. This is mock data so you can preview the chat UI.",
    sender: 'bot',
    time: new Date().toISOString(),
    status: 'sent',
  },
];

export const chatService = {
  async startOnboarding(): Promise<Message> {
    if (USE_CHAT_MOCK) {
      const message: Message = {
        id: Date.now().toString(),
        type: 'text',
        content: "Hi! I'm Ella, your AI assistant. This is mock data so you can preview the chat UI.",
        sender: 'bot',
        time: new Date().toISOString(),
        status: 'sent',
      };

      mockChatHistory = [...mockChatHistory, message];

      try {
        await SecureStore.setItemAsync(THREAD_ID_STORAGE_KEY, 'mock-thread');
      } catch (err) {
        console.warn('Failed to save mock thread ID:', err);
      }

      return message;
    }

    try {
      const response = await chatApi.sendMessage(
        'START_ONBOARDING',
        undefined,
        { is_onboarding: true }
      );

      return {
        id: Date.now().toString(),
        type: 'text',
        content: response.response,
        sender: 'bot',
        time: new Date().toISOString(),
        threadId: response.thread_id,
      };
    } catch (error) {
      console.error('Error starting onboarding:', error);
      throw new Error('Failed to start onboarding. Please try again.');
    }
  },

  async sendMessage(
    message: string, 
    threadId?: string
  ): Promise<Message> {
    if (USE_CHAT_MOCK) {
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        type: 'text',
        content: message,
        sender: 'user',
        time: new Date().toISOString(),
        status: 'sent',
      };

      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        type: 'text',
        content: "Ella (mock): That sounds interesting! Tell me a bit more.",
        sender: 'bot',
        time: new Date().toISOString(),
        status: 'sent',
      };

      mockChatHistory = [...mockChatHistory, userMessage, botMessage];

      try {
        await SecureStore.setItemAsync(THREAD_ID_STORAGE_KEY, 'mock-thread');
      } catch (err) {
        console.warn('Failed to save mock thread ID:', err);
      }

      return botMessage;
    }

    try {
      const result = await chatApi.sendMessage(message, threadId);

      const botMessage: Message = {
        id: Date.now().toString(),
        type: 'text',
        content: result.response,
        sender: 'bot',
        time: new Date().toISOString(),
        status: 'sent',
        threadId: result.thread_id,
      };

      try {
        if (result.thread_id) {
          await SecureStore.setItemAsync(THREAD_ID_STORAGE_KEY, result.thread_id);
        }
      } catch (err) {
        console.warn('Failed to save thread ID:', err);
      }

      mockChatHistory = [...mockChatHistory, botMessage];

      return botMessage;
    } catch (error) {
      console.error('Error sending message:', error);
      throw new Error('Failed to send message. Please try again.');
    }
  },

  async getChatHistory(): Promise<Message[]> {
    if (USE_CHAT_MOCK) {
      return mockChatHistory;
    }
    return [];
  },

  async sendOptionSelection(id: string, value: string): Promise<Message> {
    // For now we keep this entirely on the frontend and do not hit the backend.
    const botMessage: Message = {
      id: `bot-opt-${Date.now()}`,
      type: 'text',
      content: `Ella (mock): Thanks for choosing "${value}". Tell me a bit more about that.`,
      sender: 'bot',
      time: new Date().toISOString(),
      status: 'sent',
    };

    mockChatHistory = [...mockChatHistory, botMessage];
    return botMessage;
  },

  async sendVoiceMessage(fileUri: string): Promise<Message> {
    // Simple stub that treats voice messages like a normal message reply.
    const botMessage: Message = {
      id: `bot-voice-${Date.now()}`,
      type: 'text',
      content: 'Ella (mock): I received your voice note!',
      sender: 'bot',
      time: new Date().toISOString(),
      status: 'sent',
    };

    mockChatHistory = [...mockChatHistory, botMessage];
    return botMessage;
  },

  async saveThreadId(threadId: string | null) {
    try {
      if (threadId) {
        await SecureStore.setItemAsync(THREAD_ID_STORAGE_KEY, threadId);
      }
    } catch (err) {
      console.warn('Failed to save thread ID:', err);
    }
  },

  async getThreadId(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(THREAD_ID_STORAGE_KEY);
    } catch (err) {
      console.warn('Error reading thread ID:', err);
      return null;
    }
  },
};