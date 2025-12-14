// context/ChatContext.tsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import { Message, Match, sendMessage, getMatches, sendVoiceMessage } from '../services/chatService';

interface ChatContextType {
  messages: Message[];
  matches: Match[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  fetchMatches: () => Promise<void>;
  sendVoiceMessage: (audioUri: string) => Promise<void>;
  clearError: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendMessage = useCallback(async (content: string) => {
    try {
      setIsLoading(true);
      const newMessage = await sendMessage(content);
      setMessages(prev => [...prev, newMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleFetchMatches = useCallback(async () => {
    try {
      setIsLoading(true);
      const fetchedMatches = await getMatches();
      setMatches(fetchedMatches);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch matches');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSendVoiceMessage = useCallback(async (audioUri: string) => {
    try {
      setIsLoading(true);
      const newMessage = await sendVoiceMessage(audioUri);
      setMessages(prev => [...prev, newMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send voice message');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <ChatContext.Provider
      value={{
        messages,
        matches,
        isLoading,
        error,
        sendMessage: handleSendMessage,
        fetchMatches: handleFetchMatches,
        sendVoiceMessage: handleSendVoiceMessage,
        clearError,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};