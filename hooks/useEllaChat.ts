// hooks/useEllaChat.ts
import { useState, useCallback, useEffect } from 'react';
import { chatService, Message } from '../services/chatService';

export const useEllaChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load chat history on mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const history = await chatService.getChatHistory();
        if (history.length > 0) {
          setMessages(history);
        } else {
          // Add welcome message if no history
          setMessages([{
            id: 'welcome',
            type: 'text',
            content: 'Hi there! I\'m Ella, your AI assistant. How can I help you today?',
            sender: 'bot',
            time: new Date().toISOString(),
          }]);
        }
      } catch (err) {
        console.error('Failed to load chat history:', err);
        setError('Failed to load chat history');
      }
    };

    loadHistory();
  }, []);

  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'text',
      content: message,
      sender: 'user',
      time: new Date().toISOString(),
      status: 'sending'
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await chatService.sendMessage(message);
      setMessages(prev => {
        const updated = [...prev];
        const userMsgIndex = updated.findIndex(m => m.id === userMessage.id);
        if (userMsgIndex !== -1) {
          updated[userMsgIndex] = { ...updated[userMsgIndex], status: 'sent' as const };
        }
        return [...updated, response];
      });
    } catch (err: any) {
      console.error('Error sending message:', err);
      setError(err.message || 'Failed to send message');
      setMessages(prev => {
        const updated = [...prev];
        const userMsgIndex = updated.findIndex(m => m.id === userMessage.id);
        if (userMsgIndex !== -1) {
          updated[userMsgIndex] = { 
            ...updated[userMsgIndex], 
            status: 'failed' as const 
          };
        }
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
  };
};