import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

// Mock data - replace with actual data from your API
const CHAT_DATA = {
  'ella': {
    name: 'Ella',
    messages: [
      { id: '1', text: 'Hello! How can I help you today?', sent: false, time: '10:30 AM' },
      { id: '2', text: 'I\'d like to know more about your coffee selection', sent: true, time: '10:31 AM' },
      { id: '3', text: 'Of course! We have a wide variety of coffee beans from different regions.', sent: false, time: '10:32 AM' },
    ]
  },
  'support': {
    name: 'Support Team',
    messages: [
      { id: '1', text: 'Your order #12345 has been confirmed', sent: false, time: '9:15 AM' },
      { id: '2', text: 'Thanks! When will it be delivered?', sent: true, time: '9:16 AM' },
    ]
  },
  'updates': {
    name: 'Order Updates',
    messages: [
      { id: '1', text: 'Your coffee is on its way!', sent: false, time: '2:30 PM' },
      { id: '2', text: 'Great! Looking forward to it.', sent: true, time: '2:35 PM' },
    ]
  }
};

export default function ChatScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const flatListRef = useRef(null);

  // Initialize chat data
  useEffect(() => {
    if (id && CHAT_DATA[id]) {
      setMessages(CHAT_DATA[id].messages);
    }
  }, [id]);

  const sendMessage = async () => {
    if (message.trim() === '') return;
    
    const newMessage = {
      id: Date.now().toString(),
      text: message,
      sent: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage('');

    try {
      // Uncomment this when your API is ready
      // await chatService.sendMessage(message);
      
      // Simulate a response
      setTimeout(() => {
        const responseMessage = {
          id: (Date.now() + 1).toString(),
          text: `This is an automated response to: ${message}`,
          sent: false,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, responseMessage]);
      }, 1000);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const renderMessage = ({ item }) => (
    <View style={[
      styles.messageBubble,
      item.sent ? styles.sentBubble : styles.receivedBubble
    ]}>
      <Text style={[
        styles.messageText,
        item.sent ? styles.sentText : styles.receivedText
      ]}>
        {item.text}
      </Text>
      <Text style={[
        styles.messageTime,
        item.sent ? styles.sentTime : styles.receivedTime
      ]}>
        {item.time}
      </Text>
    </View>
  );

  if (!id || !CHAT_DATA[id]) {
    return (
      <View style={styles.container}>
        <Text>Chat not found</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <View style={[styles.chatAvatar, { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E0E0E0', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }]}>
          <Svg width={40} height={40} viewBox="0 0 200 200" fill="none">
            <Circle cx="100" cy="100" r="100" fill="#E0E0E0" />
            <Circle cx="100" cy="80" r="40" fill="#9E9E9E" />
            <Path d="M100 130C122.091 130 140 147.909 140 170H60C60 147.909 77.9086 130 100 130Z" fill="#9E9E9E" />
          </Svg>
        </View>
        <Text style={styles.chatTitle}>{CHAT_DATA[id].name}</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesContainer}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder="Type a message..."
          placeholderTextColor="#999"
        />
        <TouchableOpacity 
          style={styles.sendButton}
          onPress={sendMessage}
          disabled={message.trim() === ''}
        >
          <Ionicons 
            name="send" 
            size={24} 
            color={message.trim() === '' ? '#ccc' : '#007AFF'} 
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  backButton: {
    marginRight: 12,
  },
  chatAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  chatTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  messagesContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  sentBubble: {
    backgroundColor: '#007AFF',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  receivedBubble: {
    backgroundColor: '#e5e5ea',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  sentText: {
    color: '#fff',
  },
  receivedText: {
    color: '#000',
  },
  messageTime: {
    fontSize: 10,
    marginTop: 4,
    textAlign: 'right',
  },
  sentTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  receivedTime: {
    color: 'rgba(0, 0, 0, 0.5)',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    fontSize: 16,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
