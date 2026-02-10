import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  Dimensions,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Avatar from '../components/Avatar';
import { useAuth } from '../context/AuthContext';
import { chatService, MatchCard, Message, OptionButton } from '../services/chatService';
import { coffeeMlService } from '../services/coffeeMlService';

const { width } = Dimensions.get('window');
const INPUT_BAR_MIN_HEIGHT = 60;

export default function EllaChat() {
  const params = useLocalSearchParams<{ onboarding?: string }>();
  const isOnboarding = params.onboarding === 'true';
  const { checkOnboarding } = useAuth();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const inputContainerRef = useRef<View>(null);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Keyboard show/hide handlers
  useEffect(() => {
    const updateKeyboardSpace = (event: any) => {
      setKeyboardHeight(event.endCoordinates.height);
      setIsKeyboardVisible(true);
      // Scroll to bottom when keyboard appears
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    };

    const resetKeyboardSpace = () => {
      setKeyboardHeight(0);
      setIsKeyboardVisible(false);
    };

    const keyboardWillShow = Keyboard.addListener(
      'keyboardWillShow',
      updateKeyboardSpace
    );
    const keyboardDidShow = Keyboard.addListener(
      'keyboardDidShow',
      updateKeyboardSpace
    );
    const keyboardWillHide = Keyboard.addListener(
      'keyboardWillHide',
      resetKeyboardSpace
    );
    const keyboardDidHide = Keyboard.addListener(
      'keyboardDidHide',
      resetKeyboardSpace
    );

    return () => {
      keyboardWillShow.remove();
      keyboardDidShow.remove();
      keyboardWillHide.remove();
      keyboardDidHide.remove();
    };
  }, []);

  const loadChatHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Load stored thread_id for conversation continuity
      const storedThreadId = await chatService.getThreadId();
      setThreadId(storedThreadId);
      
      // Coffee-ml API doesn't provide chat history endpoint
      // Conversation continuity is maintained via thread_id
      // Start with a welcome message
      const history = await chatService.getChatHistory();
      if (history.length === 0) {
        const welcomeMessage = isOnboarding
          ? "Hi! I'm Ella, your AI assistant. I'll help you set up your profile by getting to know you better. Let's start with a few questions - what are you interested in?"
          : "Hey There! How are you doing today?";
        setMessages([{
          id: 'welcome',
          type: 'text',
          content: welcomeMessage,
          sender: 'bot',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'sent',
        }]);
      } else {
        setMessages(history);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      // Set a welcome message even if history fails to load
      const welcomeMessage = isOnboarding
        ? "Hi! I'm Ella, your AI assistant. I'll help you set up your profile by getting to know you better. Let's start with a few questions - what are you interested in?"
        : "Hey There! How are you doing today?";
      setMessages([{
        id: 'welcome',
        type: 'text',
        content: welcomeMessage,
        sender: 'bot',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'sent',
      }]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadChatHistory();

      const onBackPress = () => {
        router.replace('/(tabs)');
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => {
        subscription.remove();
      };
    }, [loadChatHistory, router])
  );

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  useEffect(() => {
    const showEvent = Platform.OS === 'android' ? 'keyboardDidShow' : 'keyboardWillShow';
    const hideEvent = Platform.OS === 'android' ? 'keyboardDidHide' : 'keyboardWillHide';

    const showSub = Keyboard.addListener(showEvent, () => {
      setIsKeyboardVisible(true);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 50);
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Check if profile is complete
  const checkProfileComplete = useCallback(async (): Promise<boolean> => {
    try {
      const profile = await coffeeMlService.getOwnProfile();
      // Profile is complete if it has profile_data with meaningful content
      if (!profile?.profile_data) {
        return false;
      }
      const hasVibeSummary = Boolean(profile.profile_data.vibe_summary);
      const hasInterests = Boolean(profile.profile_data.interests && profile.profile_data.interests.length > 0);
      return hasVibeSummary || hasInterests;
    } catch (error: any) {
      // If profile doesn't exist or endpoint fails, assume incomplete
      console.log('Profile check failed:', error);
      return false;
    }
  }, []);

  const handleSend = async (text?: string) => {
    const message = (text ?? inputText).trim();
    if (!message) return;

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setInputText('');

    const tempId = `temp-${Date.now()}`;
    const userMessage: Message = {
      id: tempId,
      type: 'text',
      content: message,
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sending',
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      // Send message with current thread_id for conversation continuity
      const response = await chatService.sendMessage(message, threadId || undefined);
      
      // Update thread_id from response
      const newThreadId = await chatService.getThreadId();
      if (newThreadId && newThreadId !== threadId) {
        setThreadId(newThreadId);
      }
      
      // Update the temporary message status and add bot response
      setMessages(prev => {
        const updated = prev.map(m =>
          m.id === tempId ? { ...m, status: 'sent' as const } : m
        );
        return [...updated, response];
      });

      // If in onboarding mode, check if profile is now complete after each message
      if (isOnboarding) {
        // Wait a bit for the AI to process and save profile data
        setTimeout(async () => {
          const isComplete = await checkProfileComplete();
          if (isComplete) {
            // Profile is complete, navigate to main app
            router.replace('/(tabs)');
          }
        }, 2000); // Give the backend time to save profile data
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev =>
        prev.map(m =>
          m.id === tempId ? { ...m, status: 'failed' } : m
        )
      );
      
      // Show user-friendly error
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        type: 'text',
        content: error instanceof Error && error.message.includes('backend') 
          ? '⚠️ Chat server is not responding. Please contact support or try again later.'
          : '⚠️ Failed to send message. Please try again.',
        sender: 'bot',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'sent',
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleOptionSelect = async (option: OptionButton) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Add user's selection as a message
    const userMessage: Message = {
      id: `opt-${Date.now()}`,
      type: 'text',
      content: option.label,
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await chatService.sendOptionSelection(option.id, option.value);
      setMessages(prev => [...prev, response]);
    } catch (error) {
      console.error('Error sending option selection:', error);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.sender === 'user';

    return (
      <View
        style={[
          styles.messageContainer,
          isUser && styles.userMessageContainer,
        ]}
      >
        {!isUser && (
          <View style={styles.avatarContainer}>
            <Avatar size={32} />
          </View>
        )}
        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userBubble : styles.botBubble,
            item.status === 'failed' && styles.failedBubble,
          ]}
        >
          {item.type === 'text' && (
            <Text style={[styles.messageText, isUser && styles.userText]}>
              {item.content as string}
            </Text>
          )}

          {item.type === 'options' && (
            <View style={styles.optionsContainer}>
              <View style={styles.optionsGrid}>
                {(item.content as OptionButton[]).map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={styles.optionButton}
                    onPress={() => handleOptionSelect(option)}
                  >
                    <Ionicons
                      name={option.icon as any}
                      size={32}
                      color="#7C4DFF"
                      style={styles.optionIcon}
                    />
                    <Text style={styles.optionLabel}>{option.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {item.type === 'match' && (
            <View style={styles.matchCard}>
              <View style={styles.matchHeader}>
                <Avatar size={60} />
                <View style={styles.matchHeaderText}>
                  <Text style={styles.matchName}>{(item.content as MatchCard).name}</Text>
                  <Text style={styles.matchAvailability}>
                    {(item.content as MatchCard).availability}
                  </Text>
                </View>
                <View style={styles.matchPercentageBadge}>
                  <Ionicons name="flash" size={16} color="#7C4DFF" />
                  <Text style={styles.matchPercentageText}>
                    {(item.content as MatchCard).matchPercentage}%
                  </Text>
                </View>
              </View>
              <Text style={styles.matchDescription}>
                {(item.content as MatchCard).description}
              </Text>
              {(item.content as MatchCard).sharedInterests.length > 0 && (
                <View style={styles.interestsContainer}>
                  <Text style={styles.interestsLabel}>Shared Interests:</Text>
                  <View style={styles.interestsTags}>
                    {(item.content as MatchCard).sharedInterests.map((interest: string, index: number) => (
                      <View key={index} style={styles.interestTag}>
                        <Text style={styles.interestTagText}>{interest}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
              {(item.content as MatchCard).conversationStarter && (
                <View style={styles.starterContainer}>
                  <Text style={styles.starterLabel}>Conversation Starter:</Text>
                  <Text style={styles.starterText}>
                    {(item.content as MatchCard).conversationStarter}
                  </Text>
                </View>
              )}
              <TouchableOpacity style={styles.sayHelloButton}>
                <Text style={styles.sayHelloText}>Say Hello</Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={[styles.messageTime, isUser && styles.userMessageTime]}>
            {item.time}
          </Text>

          {item.status === 'failed' && (
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => handleSend(String(item.content))}
            >
              <Ionicons name="refresh" size={16} color="#FF3B30" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7C4DFF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/(tabs)')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#2F2F2F" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Ella</Text>
        </View>
        <TouchableOpacity style={styles.infoButton} onPress={async () => {
          try {
            console.log('🔍 [ELLA] Manual profile check triggered...');
            const isComplete = await checkProfileComplete();
            
            if (isComplete) {
              console.log('🔄 [ELLA] Updating AuthContext...');
              await checkOnboarding();
              console.log('✅ [ELLA] Navigating to main app');
              router.replace('/(tabs)');
            } else {
              console.log('⚠️ [ELLA] Profile not complete yet');
            }
          } catch (error) {
            console.error('Manual profile check error:', error);
          }
        }}>
          <Ionicons name="information-circle-outline" size={24} color="#2F2F2F" />
        </TouchableOpacity>
      </View>

      {/* Chat Messages */}
      <KeyboardAvoidingView
        style={styles.chatWrapper}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.chatContent,
            { 
              paddingBottom: Math.max(
                INPUT_BAR_MIN_HEIGHT + 24 + insets.bottom,
                keyboardHeight > 0 ? keyboardHeight + INPUT_BAR_MIN_HEIGHT + 32 : 0  // Increased spacing
              )
            },
          ]}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        />

        {/* Input Bar */}
        <View
          ref={inputContainerRef}
          style={[
            styles.inputContainer,
            { 
              paddingBottom: Math.max(insets.bottom, 8),
            },
          ]}
        >
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type your message..."
            placeholderTextColor="#9CA3AF"
            style={styles.input}
            multiline={false}
            maxLength={500}
            autoFocus
            onFocus={() => {
              setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 50);
            }}
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={() => handleSend()}
            disabled={!inputText.trim()}
          >
            <Ionicons name="send" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  chatWrapper: {
    flex: 1,
    position: 'relative',
  },
  chatContent: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 100, // Increased padding at bottom to account for input container and extra space
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    padding: 4,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2F2F2F',
  },
  infoButton: {
    padding: 4,
  },
  chatContent: {
    padding: 16,
    paddingBottom: 20,
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
    borderBottomRightRadius: 16,
    shadowColor: '#171a1f',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  userBubble: {
    backgroundColor: '#9D85FF',
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 16,
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
    fontWeight: '400',
    color: '#171A1F',
    fontFamily: 'Montserrat',
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
  optionsContainer: {
    marginTop: 8,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  optionButton: {
    width: (width - 80) / 2 - 12,
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  optionIcon: {
    marginBottom: 8,
  },
  optionLabel: {
    fontSize: 14,
    color: '#2F2F2F',
    fontWeight: '500',
  },
  matchCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    width: '100%',
  },
  matchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  matchHeaderText: {
    flex: 1,
    marginLeft: 12,
  },
  matchName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2F2F2F',
    marginBottom: 4,
  },
  matchAvailability: {
    fontSize: 14,
    color: '#666',
  },
  matchPercentageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  matchPercentageText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7C4DFF',
  },
  matchDescription: {
    fontSize: 14,
    color: '#555',
    marginBottom: 12,
    lineHeight: 20,
  },
  interestsContainer: {
    marginBottom: 12,
  },
  interestsLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  interestsTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  interestTag: {
    backgroundColor: '#C8E6C9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  interestTagText: {
    fontSize: 12,
    color: '#2F2F2F',
  },
  starterContainer: {
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  starterLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 6,
  },
  starterText: {
    fontSize: 14,
    color: '#2F2F2F',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  sayHelloButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    alignItems: 'center',
    marginTop: 8,
  },
  sayHelloText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
    lineHeight: 26,
    fontWeight: '400',
    color: '#565D6D',
    fontFamily: 'Montserrat',
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
