// services/websocketService.ts
import * as SecureStore from 'expo-secure-store';
import { io, Socket } from 'socket.io-client';
import { AUTH_TOKEN_KEY } from '../constants/auth';

type MessageHandler = (data: any) => void;

class WebSocketService {
  private socket: Socket | null = null;
  private messageHandlers: Map<string, Set<MessageHandler>> = new Map();
  private serverUrl = 'https://havecoffee.in';

  async connect() {
    if (this.socket?.connected) {
      console.log('[Socket.IO] Already connected');
      return;
    }

    console.log('[Socket.IO] Connecting to server:', this.serverUrl);

    try {
      const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
      
      if (!token) {
        console.warn('[Socket.IO] ❌ No auth token found, cannot connect');
        this.handleMessage({ type: 'error', error: 'No auth token' });
        return;
      }
      
      console.log('[Socket.IO] ✅ Token found:', token.substring(0, 30) + '...');
      console.log('[Socket.IO] 🔌 Attempting connection to:', this.serverUrl);
      
      this.socket = io(this.serverUrl, {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 2000,
        timeout: 10000,
      });
      
      console.log('[Socket.IO] 📡 Socket.IO client created, waiting for connection...');
      
      this.socket.on('connect', () => {
        console.log('[Socket.IO] ✅✅✅ CONNECTED SUCCESSFULLY!');
        console.log('[Socket.IO] Socket ID:', this.socket?.id);
        console.log('[Socket.IO] Transport:', this.socket?.io?.engine?.transport?.name);
        this.handleMessage({ type: 'connected' });
      });
      
      this.socket.on('disconnect', (reason) => {
        console.log('[Socket.IO] ❌ Disconnected. Reason:', reason);
        this.handleMessage({ type: 'disconnected', reason });
      });
      
      this.socket.on('connect_error', (error) => {
        console.error('[Socket.IO] ❌ CONNECTION ERROR!');
        console.error('[Socket.IO] Error message:', error.message);
        console.error('[Socket.IO] Error type:', error.type);
        console.error('[Socket.IO] Full error:', JSON.stringify(error, null, 2));
        this.handleMessage({ type: 'error', error: error.message });
      });
      
      this.socket.on('reconnect_attempt', (attemptNumber) => {
        console.log('[Socket.IO] 🔄 Reconnect attempt:', attemptNumber);
      });
      
      this.socket.on('reconnect_failed', () => {
        console.error('[Socket.IO] ❌ Reconnection failed after all attempts');
      });
      
      // Listen for chat messages
      this.socket.on('new_message', (data) => {
        console.log('[Socket.IO] 📨 Received new_message:', data);
        this.handleMessage({ type: 'chat_message', ...data });
      });
      
      // Listen for message status updates
      this.socket.on('message_delivered', (data) => {
        this.handleMessage({ type: 'message_delivered', ...data });
      });
      
      this.socket.on('message_read', (data) => {
        this.handleMessage({ type: 'message_read', ...data });
      });
      
      // Listen for user presence
      this.socket.on('user_online', (data) => {
        this.handleMessage({ type: 'user_online', ...data });
      });
      
      this.socket.on('user_offline', (data) => {
        this.handleMessage({ type: 'user_offline', ...data });
      });
      
    } catch (error) {
      console.error('[Socket.IO] Failed to connect:', error);
      this.handleMessage({ type: 'error', error });
    }
  }

  disconnect() {
    console.log('[Socket.IO] Disconnecting...');
    
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    
    this.messageHandlers.clear();
  }

  // Send chat message
  sendMessage(recipientId: string, text: string) {
    if (!this.socket?.connected) {
      console.warn('[Socket.IO] Cannot send message - not connected');
      return false;
    }

    try {
      this.socket.emit('send_message', {
        receiverId: recipientId,
        content: text
      });
      console.log('[Socket.IO] Message sent to:', recipientId);
      return true;
    } catch (error) {
      console.error('[Socket.IO] Failed to send message:', error);
      return false;
    }
  }

  // Join a chat room
  joinChat(chatId: string) {
    if (!this.socket?.connected) {
      console.warn('[Socket.IO] Cannot join chat - not connected');
      return false;
    }

    try {
      this.socket.emit('join_chat', { chat_id: chatId });
      console.log('[Socket.IO] Joined chat:', chatId);
      return true;
    } catch (error) {
      console.error('[Socket.IO] Failed to join chat:', error);
      return false;
    }
  }

  // Leave a chat room
  leaveChat(chatId: string) {
    if (!this.socket?.connected) {
      return false;
    }

    try {
      this.socket.emit('leave_chat', { chat_id: chatId });
      console.log('[Socket.IO] Left chat:', chatId);
      return true;
    } catch (error) {
      console.error('[Socket.IO] Failed to leave chat:', error);
      return false;
    }
  }

  // Mark messages as read
  markAsRead(chatId: string, messageIds: string[]) {
    if (!this.socket?.connected) {
      return false;
    }

    try {
      this.socket.emit('mark_read', { chat_id: chatId, message_ids: messageIds });
      return true;
    } catch (error) {
      console.error('[Socket.IO] Failed to mark as read:', error);
      return false;
    }
  }

  on(event: string, handler: MessageHandler) {
    if (!this.messageHandlers.has(event)) {
      this.messageHandlers.set(event, new Set());
    }
    this.messageHandlers.get(event)!.add(handler);
  }

  off(event: string, handler: MessageHandler) {
    this.messageHandlers.get(event)?.delete(handler);
  }

  private handleMessage(data: any) {
    const { type } = data;
    
    // Handle specific message types
    const handlers = this.messageHandlers.get(type);
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }

    // Also trigger 'message' event for all messages
    const allHandlers = this.messageHandlers.get('message');
    if (allHandlers) {
      allHandlers.forEach(handler => handler(data));
    }
  }

  // Get connection status
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Get connection state
  getConnectionState(): string {
    if (!this.socket) return 'disconnected';
    if (this.socket.connected) return 'connected';
    if (this.socket.connecting) return 'connecting';
    return 'disconnected';
  }
}

export const websocketService = new WebSocketService();

// Message types for TypeScript
export interface SocketMessage {
  type: string;
  [key: string]: any;
}

export interface ChatMessage extends SocketMessage {
  type: 'chat_message';
  message_id: string;
  sender_id: string;
  recipient_id: string;
  text: string;
  timestamp: string;
}

export interface MessageDelivered extends SocketMessage {
  type: 'message_delivered';
  message_id: string;
  chat_id: string;
}

export interface MessageRead extends SocketMessage {
  type: 'message_read';
  message_id: string;
  chat_id: string;
  read_by: string;
}

export interface UserOnline extends SocketMessage {
  type: 'user_online';
  user_id: string;
}

export interface UserOffline extends SocketMessage {
  type: 'user_offline';
  user_id: string;
}
