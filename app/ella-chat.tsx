import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Avatar from '../components/Avatar';
import { useVoiceRecorder } from '../hooks/useVoiceRecorder';
import { chatService, MatchCard, Message, OptionButton } from '../services/chatService';

const { width } = Dimensions.get('window');

export default function EllaChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();
  const { isRecording, startRecording, stopRecording } = useVoiceRecorder();

  const loadChatHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      const history = await chatService.getChatHistory();
      setMessages(history);
    } catch (error) {
      console.error('Error loading chat history:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadChatHistory();
    }, [loadChatHistory])
  );

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

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
      const response = await chatService.sendMessage(message);
      setMessages(prev =>
        prev.map(m =>
          m.id === tempId ? { ...m, status: 'sent' } : m
        ).concat(response)
      );
    } catch (error) {
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
                    {(item.content as MatchCard).sharedInterests.map((interest, index) => (
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
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
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
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.chatContent}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Input Bar */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachmentButton}>
            <Ionicons name="attach" size={24} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.cameraButton}>
            <Ionicons name="camera-outline" size={24} color="#666" />
          </TouchableOpacity>
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type your message..."
            placeholderTextColor="#999"
            style={styles.input}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={() => handleSend()}
            disabled={!inputText.trim()}
          >
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.voiceButton}
            onPress={async () => {
              if (isRecording) {
                const uri = await stopRecording();
                if (uri) {
                  try {
                    const response = await chatService.sendVoiceMessage(uri);
                    setMessages(prev => [...prev, response]);
                  } catch (error) {
                    console.error('Error sending voice message:', error);
                  }
                }
              } else {
                await startRecording();
              }
            }}
          >
            <Ionicons 
              name={isRecording ? "stop" : "mic"} 
              size={24} 
              color={isRecording ? "#FF3B30" : "#7C4DFF"} 
            />
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
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  attachmentButton: {
    padding: 8,
    marginRight: 4,
  },
  cameraButton: {
    padding: 8,
    marginRight: 4,
  },
  input: {
    flex: 1,
    maxHeight: 100,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: '#2F2F2F',
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    marginHorizontal: 4,
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
  voiceButton: {
    padding: 8,
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
