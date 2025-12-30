// hooks/useOnboarding.ts
import { useCallback, useState } from 'react';
import { chatService, Message } from '../services/chatService';

export const useOnboarding = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  const startOnboarding = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const welcomeMessage = await chatService.startOnboarding();
      setMessages([welcomeMessage]);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to start onboarding'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendMessage = useCallback(async (message: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'text',
      content: message,
      sender: 'user',
      time: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const lastThreadId = messages[messages.length - 1]?.threadId;
      const botMessage = await chatService.sendMessage(message, lastThreadId);

      setMessages(prev => [...prev, botMessage]);

      // If needed in future we can infer completion from message content;
      // for now, keep isComplete as-is (main onboarding flow uses profile completeness).
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to send message'));
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  return {
    messages,
    isLoading,
    error,
    isComplete,
    startOnboarding,
    sendMessage,
  };
};