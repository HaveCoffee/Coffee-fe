import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { chatService, Message, MessageType } from '../services/chatService';

const { width } = Dimensions.get('window');

/* ---------------------------- STYLES ---------------------------- */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },

  backButton: { marginRight: 12 },

  infoButton: { marginLeft: 12 },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },

  headerCenter: { flex: 1, alignItems: 'center' },

  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2F2F2F',
  },

  headerSubtitle: {
    fontSize: 12,
    color: '#666',
  },

  chatContainer: { flex: 1, padding: 16 },

  chatContent: { paddingBottom: 16 },

  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },

  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },

  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },

  messageContainer: {
    marginBottom: 16,
    alignItems: 'flex-start',
  },

  userContainer: { alignItems: 'flex-end' },

  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },

  botBubble: {
    backgroundColor: '#f0f0f0',
    borderTopLeftRadius: 4,
  },

  userBubble: {
    backgroundColor: '#7C4DFF',
    borderBottomRightRadius: 4,
  },

  failedMessageBubble: {
    borderWidth: 1,
    borderColor: '#FF3B30',
  },

  messageText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },

  userText: { color: '#fff' },

  failedMessage: { color: '#FF3B30' },

  matchContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    width: '100%',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  matchName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2F2F2F',
    marginBottom: 4,
  },
  matchDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  matchScore: {
    fontSize: 14,
    fontWeight: '500',
    color: '#7C4DFF',
    marginBottom: 4,
  },
  matchAvailability: {
    fontSize: 13,
    color: '#28a745',
    fontStyle: 'italic',
  },

  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },

  messageTime: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
  },

  retryButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },

  inputContainer: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },

  keyboardAvoidingView: { width: '100%' },

  input: {
    flex: 1,
    maxHeight: 120,
    padding: 8,
    fontSize: 16,
  },

  iconButton: { padding: 6 },

  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#6B46C1',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
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
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },

  recordingIndicator: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#6B46C1',
    justifyContent: 'center',
    alignItems: 'center',
  },

  recordingPulse: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    opacity: 0.5,
  },

  recordingText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },

  recordingHint: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },

  cancelRecordingButton: {
    width: 80,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },

  cancelRecordingText: { color: '#fff', fontSize: 16 },
  
  // Match content styles
  matchContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    width: '100%',
  },
  matchName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#2F2F2F',
  },
  matchDescription: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  matchScore: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 4,
  },
  matchAvailability: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  matchInterests: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  matchStarter: {
    fontSize: 14,
    color: '#2F2F2F',
    fontStyle: 'italic',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 8,
    marginTop: 4,
  },
});

/* ---------------------------- COMPONENT ---------------------------- */

export default function EllaChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const scrollViewRef = useRef<ScrollView>(null);
  const router = useRouter();

  const loadChatHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      const history = await chatService.getChatHistory();
      setMessages(history);
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
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleSend = async (text?: string) => {
    const message = (text ?? inputText).trim();
    if (!message) return;

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setInputText('');

    const tempId = `temp-${Date.now()}`;
    setMessages(prev => [
      ...prev,
      {
        id: tempId,
        type: 'text',
        content: message,
        sender: 'user',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'sending' as const,
      },
    ]);

    try {
      const res = await chatService.sendMessage(message);
      setMessages(prev =>
        prev.map(m =>
          m.id === tempId
            ? { ...m, status: 'sent' as const }
            : m
        ).concat({
          id: res.id,
          type: res.type as MessageType,
          content: res.content,
          sender: 'bot',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'sent',
        })
      );
    } catch {
      setMessages(prev =>
        prev.map(m =>
          m.id === tempId ? { ...m, status: 'failed' } : m
        )
      );
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7C4DFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} />
        </TouchableOpacity>
        <Image source={require('../assets/ella-avatar.png')} style={styles.avatar} />
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Ella</Text>
          <Text style={styles.headerSubtitle}>Your AI Wingman</Text>
        </View>
      </View>

      {/* CHAT */}
      <ScrollView ref={scrollViewRef} style={styles.chatContainer}>
        {messages.map(m => (
          <View
            key={m.id}
            style={[
              styles.messageContainer,
              m.sender === 'user' && styles.userContainer,
            ]}
          >
            <View
              style={[
                styles.messageBubble,
                m.sender === 'user' ? styles.userBubble : styles.botBubble,
                m.status === 'failed' && styles.failedMessageBubble,
              ]}
            >
              {typeof m.content === 'string' ? (
                <Text
                  style={[
                    styles.messageText,
                    m.sender === 'user' && styles.userText,
                    m.status === 'failed' && styles.failedMessage,
                  ]}
                >
                  {m.content}
                </Text>
              ) : (
                <View style={styles.matchContainer}>
                  <Text style={styles.matchName}>{m.content.name}</Text>
                  <Text style={styles.matchDescription}>{m.content.description}</Text>
                  <Text style={styles.matchScore}>Match Score: {m.content.matchScore}%</Text>
                  <Text style={styles.matchAvailability}>Available: {m.content.availability}</Text>
                  <Text style={styles.matchInterests}>
                    Interests: {m.content.interests.join(', ')}
                  </Text>
                  <Text style={styles.matchStarter}>{m.content.starter}</Text>
                </View>
              )}
              <View style={styles.messageFooter}>
                <Text style={styles.messageTime}>{m.time}</Text>
                {m.status === 'failed' && (
                  <TouchableOpacity
                    style={styles.retryButton}
                    onPress={() => handleSend(String(m.content))}
                  >
                    <Ionicons name="refresh" size={14} color="#fff" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* INPUT */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.inputContainer}>
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            style={styles.input}
            multiline
          />
          <TouchableOpacity style={styles.sendButton} onPress={() => handleSend()}>
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* RECORDING OVERLAY */}
      {isRecording && (
        <View style={styles.recordingOverlay}>
          <View style={styles.recordingContainer}>
            <View style={styles.recordingIndicator}>
              <Ionicons name="mic" size={28} color="#fff" />
            </View>
            <Text style={styles.recordingText}>Listening...</Text>
            <Text style={styles.recordingHint}>Tap cancel to stop</Text>
            <TouchableOpacity
              style={styles.cancelRecordingButton}
              onPress={() => setIsRecording(false)}
            >
              <Text style={styles.cancelRecordingText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}
