// context/WebSocketContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { websocketService } from '../services/websocketService';

interface WebSocketContextType {
  isConnected: boolean;
  connectionState: string;
  connect: () => void;
  disconnect: () => void;
  sendMessage: (recipientId: string, text: string) => boolean;
  joinChat: (chatId: string) => boolean;
  leaveChat: (chatId: string) => boolean;
  on: (event: string, handler: (data: any) => void) => void;
  off: (event: string, handler: (data: any) => void) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
};

interface WebSocketProviderProps {
  children: React.ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState('disconnected');
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Only connect if user is authenticated
    console.log('[WebSocket Context] useEffect triggered');
    console.log('[WebSocket Context] isAuthenticated:', isAuthenticated);
    console.log('[WebSocket Context] user:', user?.id);
    
    if (isAuthenticated && user) {
      console.log('[WebSocket] User authenticated, connecting...');
      setHasError(false);
      websocketService.connect();
    } else {
      console.log('[WebSocket] User not authenticated, disconnecting...');
      websocketService.disconnect();
    }

    // Listen for connection status changes
    const handleConnected = () => {
      console.log('[WebSocket] Connected');
      setIsConnected(true);
      setConnectionState('connected');
      setHasError(false);
    };

    const handleDisconnected = () => {
      console.log('[WebSocket] Disconnected');
      setIsConnected(false);
      setConnectionState('disconnected');
    };

    const handleError = (data: any) => {
      console.log('[WebSocket] Error:', data.error);
      setIsConnected(false);
      setConnectionState('error');
      setHasError(true);
    };

    websocketService.on('connected', handleConnected);
    websocketService.on('disconnected', handleDisconnected);
    websocketService.on('error', handleError);

    // Update initial state
    setIsConnected(websocketService.isConnected());
    setConnectionState(websocketService.getConnectionState());

    return () => {
      websocketService.off('connected', handleConnected);
      websocketService.off('disconnected', handleDisconnected);
      websocketService.off('error', handleError);
    };
  }, [isAuthenticated, user]);

  const connect = () => {
    websocketService.connect();
  };

  const disconnect = () => {
    websocketService.disconnect();
  };

  const sendMessage = (recipientId: string, text: string) => {
    return websocketService.sendMessage(recipientId, text);
  };

  const joinChat = (chatId: string) => {
    return websocketService.joinChat(chatId);
  };

  const leaveChat = (chatId: string) => {
    return websocketService.leaveChat(chatId);
  };

  const on = (event: string, handler: (data: any) => void) => {
    websocketService.on(event, handler);
  };

  const off = (event: string, handler: (data: any) => void) => {
    websocketService.off(event, handler);
  };

  const value: WebSocketContextType = {
    isConnected,
    connectionState,
    connect,
    disconnect,
    sendMessage,
    joinChat,
    leaveChat,
    on,
    off,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};