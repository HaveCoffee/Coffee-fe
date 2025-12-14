// services/chatService.ts
import { apiRequest, CHAT_API_BASE_URL } from '../utils/api';
import { getAuthToken } from './authService';

export type MessageType = 'text' | 'options' | 'match' | 'voice';

export interface Message {
  id: string;
  type: MessageType;
  content: string | OptionButton[] | MatchCard;
  sender: 'user' | 'bot';
  time: string;
  status?: 'sending' | 'sent' | 'failed';
}

export interface OptionButton {
  id: string;
  label: string;
  icon: string;
  value: string;
}

export interface MatchCard {
  id: string;
  name: string;
  profilePicture?: string;
  matchPercentage: number;
  availability: string;
  description: string;
  sharedInterests: string[];
  conversationStarter: string;
}

export const chatService = {
  async getChatHistory(): Promise<Message[]> {
    try {
      const token = await getAuthToken();
      const response = await apiRequest('/chat/history', 'GET', null, token, CHAT_API_BASE_URL);
      
      // Transform API response to Message format
      return response.messages?.map((msg: any) => ({
        id: msg.id || `msg-${Date.now()}-${Math.random()}`,
        type: msg.type || 'text',
        content: msg.content || msg.text || msg.message || '',
        sender: msg.sender || 'bot',
        time: msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'sent',
      })) || [];
    } catch (error) {
      console.error('Error fetching chat history:', error);
      return [];
    }
  },

  async sendMessage(message: string): Promise<Message> {
    try {
      const token = await getAuthToken();
      const response = await apiRequest('/chat/send', 'POST', { 
        message,
        timestamp: new Date().toISOString(),
      }, token, CHAT_API_BASE_URL);
      
      return {
        id: response.id || `msg-${Date.now()}`,
        type: response.type || 'text',
        content: this.parseMessageContent(response),
        sender: 'bot',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'sent',
      };
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  async sendOptionSelection(optionId: string, optionValue: string): Promise<Message> {
    try {
      const token = await getAuthToken();
      const response = await apiRequest('/chat/option', 'POST', {
        optionId,
        value: optionValue,
        timestamp: new Date().toISOString(),
      }, token, CHAT_API_BASE_URL);
      
      return {
        id: response.id || `msg-${Date.now()}`,
        type: response.type || 'text',
        content: this.parseMessageContent(response),
        sender: 'bot',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'sent',
      };
    } catch (error) {
      console.error('Error sending option selection:', error);
      throw error;
    }
  },

  async sendVoiceMessage(audioUri: string): Promise<Message> {
    try {
      const token = await getAuthToken();
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('audio', {
        uri: audioUri,
        type: 'audio/m4a',
        name: 'voice-message.m4a',
      } as any);
      formData.append('timestamp', new Date().toISOString());
      
      const response = await fetch(`${CHAT_API_BASE_URL}/chat/voice`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });
      
      const responseData = await response.json();
      
      return {
        id: responseData.id || `msg-${Date.now()}`,
        type: responseData.type || 'text',
        content: this.parseMessageContent(responseData),
        sender: 'bot',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'sent',
      };
    } catch (error) {
      console.error('Error sending voice message:', error);
      throw error;
    }
  },

  parseMessageContent(response: any): string | OptionButton[] | MatchCard {
    // Handle different response types
    if (response.type === 'options' && response.options) {
      return response.options.map((opt: any, index: number) => ({
        id: opt.id || `opt-${index}`,
        label: opt.label || opt.text,
        icon: opt.icon || this.getIconForLabel(opt.label || opt.text),
        value: opt.value || opt.label || opt.text,
      }));
    }
    
    if (response.type === 'match' && response.match) {
      return {
        id: response.match.id || `match-${Date.now()}`,
        name: response.match.name,
        profilePicture: response.match.profilePicture,
        matchPercentage: response.match.matchPercentage || response.match.matchScore || 0,
        availability: response.match.availability || 'Available soon',
        description: response.match.description || '',
        sharedInterests: response.match.sharedInterests || response.match.interests || [],
        conversationStarter: response.match.conversationStarter || response.match.starter || '',
      };
    }
    
    return response.content || response.text || response.message || '';
  },

  getIconForLabel(label: string): string {
    const lowerLabel = label.toLowerCase();
    if (lowerLabel.includes('movie') || lowerLabel.includes('film')) return 'film';
    if (lowerLabel.includes('book')) return 'book';
    if (lowerLabel.includes('sport')) return 'basketball';
    if (lowerLabel.includes('travel')) return 'airplane';
    if (lowerLabel.includes('music')) return 'musical-notes';
    if (lowerLabel.includes('food')) return 'restaurant';
    if (lowerLabel.includes('tech')) return 'laptop';
    return 'ellipse';
  },
};
