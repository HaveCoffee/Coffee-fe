// hooks/useWebSocket.ts
import { useEffect, useState } from 'react';
import { websocketService } from '../services/websocketService';

export interface WebSocketStatus {
  isConnected: boolean;
  connectionState: string;
  reconnectAttempts: number;
}

export const useWebSocket = () => {
  const [status, setStatus] = useState<WebSocketStatus>({
    isConnected: false,
    connectionState: 'disconnected',
    reconnectAttempts: 0,
  });

  useEffect(() => {
    // Update status when connection changes
    const handleConnectionChange = (data: any) => {
      setStatus({
        isConnected: websocketService.isConnected(),
        connectionState: websocketService.getConnectionState(),
        reconnectAttempts: 0, // Reset on successful connection
      });
    };

    const handleDisconnection = (data: any) => {
      setStatus(prev => ({
        isConnected: false,
        connectionState: 'disconnected',
        reconnectAttempts: prev.reconnectAttempts + 1,
      }));
    };

    // Listen for connection events
    websocketService.on('connected', handleConnectionChange);
    websocketService.on('disconnected', handleDisconnection);
    websocketService.on('error', handleDisconnection);

    // Initial status
    setStatus({
      isConnected: websocketService.isConnected(),
      connectionState: websocketService.getConnectionState(),
      reconnectAttempts: 0,
    });

    return () => {
      websocketService.off('connected', handleConnectionChange);
      websocketService.off('disconnected', handleDisconnection);
      websocketService.off('error', handleDisconnection);
    };
  }, []);

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

  return {
    status,
    connect,
    disconnect,
    sendMessage,
    joinChat,
    leaveChat,
    on: websocketService.on.bind(websocketService),
    off: websocketService.off.bind(websocketService),
  };
};