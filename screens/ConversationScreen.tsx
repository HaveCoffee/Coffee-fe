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

import Avatar from '../components/Avatar';
import { Colors } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
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
  const { id: paramUserId } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const theme = useColorScheme() ?? 'light';

  const userId = propUserId || paramUserId;

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const flatListRef = useRef<FlatList>(null);
  const translateY = useRef(new Animated.Value(0)).current;

  /* ---------------- Load Conversation ---------------- */
  const loadConversation = useCallback(async () => {
    if (!userId) return;

    try {
      setIsLoading(true);
      const conversation =
        await conversationService.getConversationMessages(userId);
      setMessages(conversation.messages || []);
    } catch (error) {
      console.error('Error loading conversation:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadConversation();
  }, [loadConversation]);

  /* ---------------- Send Message ---------------- */
  const handleSend = async () => {
    if (!message.trim() || !userId || isSending) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: message,
      senderId: user?.id || '',
      recipientId: userId,
      timestamp: new Date().toISOString(),
      status: 'sending',
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage('');
    setIsSending(true);

    try {
      await conversationService.sendMessage(userId, message);
      setMessages(prev =>
        prev.map(m =>
          m.id === newMessage.id ? { ...m, status: 'sent' } : m
        )
      );
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev =>
        prev.map(m =>
          m.id === newMessage.id ? { ...m, status: 'error' } : m
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
    const isMe = item.senderId === user?.id;
    const isError = item.status === 'error';

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
            isMe && { backgroundColor: Colors[theme].tint },
          ]}
        >
          <Text style={[styles.messageText, isMe && styles.userText]}>{item.text}</Text>

          <Text style={[styles.messageTime, isMe && styles.userMessageTime]}>
            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>

          {isMe && isError && (
            <TouchableOpacity style={styles.retryButton} onPress={() => handleSend()}>
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
          <Text style={styles.headerTitle}>{propUserName || 'Chat'}</Text>
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
              style={[
                styles.sendButton,
                { opacity: !message.trim() || isSending ? 0.6 : 1 },
              ]}
              onPress={handleSend}
              disabled={!message.trim() || isSending}
            >
              {isSending ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Ionicons name="send" size={20} color="#fff" />
              )}
            </TouchableOpacity>
          </Animated.View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}

/* ---------------- Styles ---------------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: { fontSize: 18, fontWeight: '600' },
  chatWrapper: {
    flex: 1,
    position: 'relative',
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
    padding: 12,
    borderRadius: 18,
  },
  botBubble: {
    backgroundColor: '#F5F5F5',
    borderTopLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: '#7C4DFF',
    borderTopRightRadius: 4,
  },
  failedBubble: {
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
    color: '#2F2F2F',
  },
  userText: {
    color: '#fff',
  },
  messageTime: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },
  userMessageTime: {
    color: 'rgba(255,255,255,0.7)',
  },
  retryButton: {
    marginTop: 8,
    padding: 4,
  },
  statusIcon: { marginLeft: 4 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 16,
    fontSize: 16,
    marginRight: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#7C4DFF',
  },
});
