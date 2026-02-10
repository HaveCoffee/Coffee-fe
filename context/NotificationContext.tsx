// context/NotificationContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useWebSocketContext } from './WebSocketContext';

interface NotificationContextType {
  unreadCounts: Record<string, number>;
  totalUnreadCount: number;
  markAsRead: (userId: string) => void;
  incrementUnread: (userId: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const { on, off } = useWebSocketContext();

  const totalUnreadCount = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);

  const markAsRead = (userId: string) => {
    setUnreadCounts(prev => ({
      ...prev,
      [userId]: 0
    }));
  };

  const incrementUnread = (userId: string) => {
    setUnreadCounts(prev => ({
      ...prev,
      [userId]: (prev[userId] || 0) + 1
    }));
  };

  useEffect(() => {
    const handleNewMessage = (data: any) => {
      if (data.type === 'chat_message') {
        const senderId = data.senderId || data.sender_id;
        if (senderId) {
          incrementUnread(senderId);
        }
      }
    };

    on('chat_message', handleNewMessage);
    return () => off('chat_message', handleNewMessage);
  }, [on, off]);

  return (
    <NotificationContext.Provider value={{
      unreadCounts,
      totalUnreadCount,
      markAsRead,
      incrementUnread
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};