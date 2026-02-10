// screens/ConversationScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import * as SecureStore from 'expo-secure-store';
import Avatar from '../components/Avatar';
import { Colors } from '../constants/theme';
import { AUTH_TOKEN_KEY } from '../constants/auth';
import { useAuth } from '../context/AuthContext';
import { useWebSocketContext } from '../context/WebSocketContext';
import { useNotifications } from '../context/NotificationContext';
import { useColorScheme } from '../hooks/use-color-scheme';
import { conversationService, Message } from '../services/conversationService';

type ConversationScreenProps = {
  userId?: string;
  userName?: string;
  userAvatar?: string;
};

export default function ConversationScreen(props: ConversationScreenProps) {
  const { userId: propUserId, userName: propUserName } = props;

  const router = useRouter();
  const { id: paramUserId, userName: paramUserName } = useLocalSearchParams<{ id: string; userName?: string }>();
  const { user } = useAuth();
  const { isConnected, connectionState, sendMessage, joinChat, leaveChat, on, off } = useWebSocketContext();
  const { markAsRead } = useNotifications();
  const theme = useColorScheme() ?? 'light';

  const userId = propUserId || paramUserId;
  const initialUserName = propUserName || paramUserName || 'Chat';

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [chatUserName, setChatUserName] = useState(initialUserName);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Extract current user ID from JWT token
  useEffect(() => {
    const getCurrentUserId = async () => {
      try {
        const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
        if (token) {
          // Decode JWT to get user ID
          const payload = JSON.parse(atob(token.split('.')[1]));
          const userId = payload.userId || payload.user_id || payload.sub;
          setCurrentUserId(userId);
          console.log('Current user ID from JWT:', userId);
        }
      } catch (error) {
        console.error('Failed to extract user ID from token:', error);
      }
    };
    getCurrentUserId();
  }, []);

  const flatListRef = useRef<FlatList>(null);
  const translateY = useRef(new Animated.Value(0)).current;

  /* ---------------- Load Conversation ---------------- */
  const loadConversation = useCallback(async () => {
    if (!userId) return;

    try {
      setIsLoading(true);
      console.log(`📱 [CHAT] Loading conversation for user: ${userId}`);
      
      // If we don't have a user name, try to get it from the profile
      if (!propUserName && !paramUserName) {
        try {
          const { coffeeMlService } = await import('../services/coffeeMlService');
          const profile = await coffeeMlService.getPublicProfile(userId);
          const profileData = profile.profile_data || {};
          const userName = profileData.name || 
                          profileData.display_name || 
                          profileData.username ||
                          // Extract from vibe_summary if available
                          (profileData.vibe_summary ? 
                            (() => {
                              const vibeText = profileData.vibe_summary;
                              const iAmMatch = vibeText.match(/I am ([A-Z][a-z]+)/i);
                              if (iAmMatch) return iAmMatch[1];
                              const nameMatch = vibeText.match(/(?:my name is|i'm|i am) ([A-Z][a-z]+)/i);
                              if (nameMatch) return nameMatch[1];
                              const firstWordMatch = vibeText.match(/^([A-Z][a-z]+)(?:\s|,|\.|!)/);
                              if (firstWordMatch && firstWordMatch[1].length > 2) return firstWordMatch[1];
                              return null;
                            })()
                          : null) ||
                          `User ${userId.substring(0, 6)}`;
          setChatUserName(userName);
        } catch (error) {
          console.log('Could not fetch user profile for name:', error);
          setChatUserName(`User ${userId.substring(0, 6)}`);
        }
      }
      
      const conversation =
        await conversationService.getConversationMessages(userId);
      console.log(`📱 [CHAT] Loaded ${conversation.messages?.length || 0} messages`);
      setMessages(conversation.messages || []);
    } catch (error) {
      console.error('Error loading conversation:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId, propUserName, paramUserName]);

  useEffect(() => {
    loadConversation();
    
    // Join chat room when component mounts
    if (userId && isConnected) {
      joinChat(userId);
    }
    
    // Mark messages as read when entering this chat
    if (userId) {
      markAsRead(userId);
    }
    
    // Listen for incoming messages
    const handleNewMessage = (data: any) => {
      console.log('[Chat] Received message event:', data);
      if (data.type === 'chat_message') {
        // Check if message is for this conversation
        const isSender = data.senderId === userId || data.sender_id === userId;
        const isRecipient = data.receiverId === userId || data.recipient_id === userId;
        
        if (isSender || isRecipient) {
          const newMsg: Message = {
            id: data.id || data.message_id || data.messageId || Date.now().toString(),
            text: data.content || data.text || '',
            senderId: data.senderId || data.sender_id || '',
            recipientId: data.receiverId || data.recipient_id || '',
            timestamp: data.createdAt || data.timestamp || new Date().toISOString(),
            status: 'sent',
          };
          setMessages(prev => {
            // Avoid duplicates
            if (prev.find(m => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          scrollToBottom();
        }
      }
    };
    
    // Listen for message delivery confirmations
    const handleMessageDelivered = (data: any) => {
      if (data.type === 'message_delivered') {
        setMessages(prev =>
          prev.map(m =>
            m.id === data.message_id ? { ...m, status: 'delivered' } : m
          )
        );
      }
    };
    
    // Listen for message read confirmations
    const handleMessageRead = (data: any) => {
      if (data.type === 'message_read') {
        setMessages(prev =>
          prev.map(m =>
            m.id === data.message_id ? { ...m, status: 'read' } : m
          )
        );
      }
    };
    
    // Listen for connection status
    const handleConnectionChange = (data: any) => {
      if (data.type === 'connected' && userId) {
        console.log('[Chat] WebSocket connected - joining chat');
        joinChat(userId);
      }
    };
    
    on('chat_message', handleNewMessage);
    on('message_delivered', handleMessageDelivered);
    on('message_read', handleMessageRead);
    on('connected', handleConnectionChange);
    
    return () => {
      off('chat_message', handleNewMessage);
      off('message_delivered', handleMessageDelivered);
      off('message_read', handleMessageRead);
      off('connected', handleConnectionChange);
      
      if (userId) {
        leaveChat(userId);
      }
    };
  }, [loadConversation, userId, isConnected, joinChat, leaveChat, on, off]);

  /* ---------------- Send Message ---------------- */
  const handleSend = async () => {
    if (!message.trim() || !userId || isSending) return;

    const messageText = message.trim();
    setMessage('');
    setIsSending(true);

    const messageId = Date.now().toString();
    const newMessage: Message = {
      id: messageId,
      text: messageText,
      senderId: currentUserId || '',
      recipientId: userId,
      timestamp: new Date().toISOString(),
      status: 'sending',
    };

    setMessages(prev => [...prev, newMessage]);

    try {
      if (!isConnected) {
        throw new Error('Not connected to chat server');
      }
      
      // Send via WebSocket only (no duplicate API call)
      await conversationService.sendMessage(userId, messageText);
      
      // Update message status
      setMessages(prev =>
        prev.map(m =>
          m.id === messageId ? { ...m, status: 'sent' } : m
        )
      );
    } catch (error: any) {
      console.error('Error sending message:', error);
      setMessages(prev =>
        prev.map(m =>
          m.id === messageId ? { ...m, status: 'error' } : m
        )
      );
    } finally {
      setIsSending(false);
      scrollToBottom();
    }
  };

  /* ---------------- Keyboard Handling ---------------- */
  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      e => {
        setKeyboardVisible(true);
        setKeyboardHeight(e.endCoordinates.height);

        Animated.timing(translateY, {
          toValue: -e.endCoordinates.height,
          duration: 250,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }).start(() => scrollToBottom());
      }
    );

    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        Animated.timing(translateY, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }).start();
        setKeyboardVisible(false);
        setKeyboardHeight(0);
      }
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [translateY]);

  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  /* ---------------- Render Message ---------------- */
  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.senderId === currentUserId;
    const isError = item.status === 'error';
    const isSending = item.status === 'sending';

    return (
      <View style={[styles.messageContainer, isMe && styles.userMessageContainer]}>
        {!isMe && (
          <View style={styles.avatarContainer}>
            <Avatar size={32} />
          </View>
        )}

        <View
          style={[
            styles.messageBubble,
            isMe ? styles.userBubble : styles.botBubble,
            isError && styles.failedBubble,
          ]}
        >
          <Text style={[styles.messageText, isMe && styles.userText]}>{item.text}</Text>

          <Text style={[styles.messageTime, isMe && styles.userMessageTime]}>
            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>

          {isError && (
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                setMessage(item.text);
                setMessages(prev => prev.filter(m => m.id !== item.id));
              }}
            >
              <Ionicons name="refresh" size={16} color="#FF3B30" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  /* ---------------- Loading ---------------- */
  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors[theme].tint} />
          </View>
        </SafeAreaView>
      </>
    );
  }

  /* ---------------- UI ---------------- */
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={styles.headerTitle}>{chatUserName}</Text>
            {!isConnected && (
              <Text style={styles.connectionStatusOffline}>Chat offline</Text>
            )}
          </View>
          <View style={{ width: 24 }} />
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={90}
        >
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={item => item.id}
            contentContainerStyle={[
              styles.messagesList,
              { paddingBottom: keyboardVisible ? keyboardHeight + 20 : 20 },
            ]}
            onContentSizeChange={scrollToBottom}
          />

          {/* Input */}
          <Animated.View
            style={[styles.inputContainer, { transform: [{ translateY }] }]}
          >
            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              value={message}
              onChangeText={setMessage}
              multiline
            />

            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleSend}
              disabled={!message.trim() || isSending || !isConnected}
            >
              <Ionicons name="send" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </Animated.View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}

/* ---------------- Styles ---------------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#2F2F2F' },
  connectionStatusOffline: {
    fontSize: 12,
    color: '#F44336',
    marginTop: 2,
  },
  messagesList: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 100,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  userMessageContainer: {
    flexDirection: 'row-reverse',
  },
  avatarContainer: {
    marginRight: 8,
    marginTop: 4,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 16,
    borderRadius: 16,
  },
  botBubble: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 0,
    shadowColor: '#171a1f',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  userBubble: {
    backgroundColor: '#9D85FF',
    borderTopRightRadius: 0,
    shadowColor: '#171a1f',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  failedBubble: {
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
    color: '#171A1F',
  },
  userText: {
    color: '#FFFFFF',
  },
  messageTime: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 6,
  },
  userMessageTime: {
    color: 'rgba(255,255,255,0.8)',
  },
  retryButton: {
    marginTop: 8,
    padding: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#171a1f',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 4,
  },
  input: {
    flex: 1,
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#565D6D',
    borderWidth: 1,
    borderColor: '#DEE1E6',
    marginRight: 12,
  },
  sendButton: {
    width: 40,
    height: 36,
    borderRadius: 16,
    backgroundColor: '#9D85FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
