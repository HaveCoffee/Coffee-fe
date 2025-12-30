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
import { useVoiceRecorder } from '../hooks/useVoiceRecorder';
import { chatService, MatchCard, Message, OptionButton } from '../services/chatService';
import { coffeeMlService } from '../services/coffeeMlService';
import { logVerificationResults, verifyChatAPIEndpoints } from '../utils/apiVerifier';

const { width } = Dimensions.get('window');
const INPUT_BAR_MIN_HEIGHT = 60;

export default function EllaChat() {
  const params = useLocalSearchParams<{ onboarding?: string }>();
  const isOnboarding = params.onboarding === 'true';
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const inputContainerRef = useRef<View>(null);
  const router = useRouter();
  const { isRecording, startRecording, stopRecording } = useVoiceRecorder();
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
      
      // Verify API endpoints in development mode (only once)
      if (__DEV__ && !(global as any).__API_VERIFIED__) {
        (global as any).__API_VERIFIED__ = true;
        const results = await verifyChatAPIEndpoints();
        logVerificationResults(results);
      }
      
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
        <TouchableOpacity style={styles.infoButton}>
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
              minHeight: INPUT_BAR_MIN_HEIGHT,
              paddingHorizontal: 16,
              paddingTop: 8,
              justifyContent: 'space-between',
              backgroundColor: '#fff',
              borderTopWidth: StyleSheet.hairlineWidth,
              borderTopColor: '#E5E5E5',
              transform: [
                { translateY: -keyboardHeight },
              ],
              marginBottom: keyboardHeight > 0 ? 8 : 0, // Add extra margin when keyboard is visible
            },
          ]}
        >
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type your message..."
            placeholderTextColor="#999"
            style={[styles.input, { flex: 1, marginRight: 8 }]}
            multiline
            maxLength={500}
            autoFocus
            onFocus={() => {
              setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 50);
            }}
          />
          <TouchableOpacity
            style={[styles.sendButton, { marginLeft: 8 }]}
            onPress={() => handleSend()}
            disabled={!inputText.trim()}
          >
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Recording Overlay */}
      {isRecording && (
        <View style={styles.recordingOverlay}>
          <View style={styles.recordingContainer}>
            <View style={styles.recordingIndicator}>
              <Ionicons name="mic" size={32} color="#fff" />
            </View>
            <Text style={styles.recordingText}>Listening...</Text>
            <Text style={styles.recordingHint}>Tap cancel to stop</Text>
            <TouchableOpacity
              style={styles.cancelRecordingButton}
              onPress={async () => {
                await stopRecording();
              }}
            >
              <Text style={styles.cancelRecordingText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
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
    paddingTop: 8,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  input: {
    minHeight: 40,
    maxHeight: 120,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 16,
    color: '#333',
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#7C4DFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  recordingOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    minWidth: 200,
  },
  recordingIndicator: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#7C4DFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  recordingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2F2F2F',
    marginBottom: 8,
  },
  recordingHint: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  cancelRecordingButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  cancelRecordingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
