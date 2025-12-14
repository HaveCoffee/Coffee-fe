import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    FlatList,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Avatar from '../components/Avatar';

type Message = {
  id: string;
  text: string;
  sender: 'me' | 'them';
  time: string;
};

export default function ConversationScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [message, setMessage] = useState('');
  
  // Mock messages - in a real app, this would come from your state management
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hey! Looking forward to our coffee. What's your preferred spot in the city center?",
      sender: 'them',
      time: '10:05 AM',
    },
    {
      id: '2',
      text: "Hi Anya! There's a cozy place called 'The Grind' near the park. How about that?",
      sender: 'me',
      time: '10:07 AM',
    },
    {
      id: '3',
      text: 'Sounds perfect! Is 2 PM good for you on Wednesday?',
      sender: 'them',
      time: '10:08 AM',
    },
    {
      id: '4',
      text: 'Wednesday 2 PM works great! I\'ll send you the location.',
      sender: 'me',
      time: '10:10 AM',
    },
  ]);

  const handleSend = () => {
    if (message.trim() === '') return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      text: message,
      sender: 'me',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    
    setMessages([...messages, newMessage]);
    setMessage('');
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageBubble,
        item.sender === 'me' ? styles.myMessage : styles.theirMessage,
      ]}
    >
      <Text style={styles.messageText}>{item.text}</Text>
      <Text style={styles.messageTime}>{item.time}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Conversation</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.notificationIcon}>
            <Ionicons name="notifications-outline" size={24} color="black" />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationCount}>3</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.profileImageContainer}>
            <Avatar size={32} />
            <View style={styles.onlineIndicator} />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="ellipsis-vertical" size={20} color="black" />
          </TouchableOpacity>
        </View>
      </View>

      {/* User Profile Section */}
      <View style={styles.profileSection}>
        <View style={styles.profileImageWrapper}>
          <Avatar size={100} />
          <View style={styles.onlineIndicatorLarge} />
          <TouchableOpacity style={styles.reportButton}>
            <Ionicons name="warning" size={20} color="#FF3B30" />
          </TouchableOpacity>
        </View>
        <Text style={styles.userName}>Anya</Text>
        <Text style={styles.userBio}>Marketing Specialist, loves indie music</Text>
        <View style={styles.availabilityContainer}>
          <Ionicons name="calendar-outline" size={16} color="#666" />
          <Text style={styles.availabilityText}>Available Fri 3 PM for a coffee</Text>
        </View>
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity style={styles.confirmButton}>
            <Text style={styles.confirmButtonText}>Confirm Coffee</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.declineButton}>
            <Text style={styles.declineButtonText}>Decline</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        style={styles.messagesContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={90}
      >
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          inverted={false}
        />
      </KeyboardAvoidingView>

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.attachmentButton}>
          <Ionicons name="attach" size={24} color="#4A4A4A" />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Type your message..."
          value={message}
          onChangeText={setMessage}
          multiline
        />
        <TouchableOpacity 
          style={styles.sendButton}
          onPress={handleSend}
        >
          <Ionicons name="send" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  notificationIcon: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    right: -5,
    top: -5,
    backgroundColor: 'red',
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationCount: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  profileImageContainer: {
    position: 'relative',
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 25,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  profileImageWrapper: {
    position: 'relative',
    marginBottom: 15,
  },
  onlineIndicatorLarge: {
    position: 'absolute',
    right: 5,
    bottom: 5,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
    borderWidth: 3,
    borderColor: 'white',
  },
  reportButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 5,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#2F2F2F',
  },
  userBio: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    textAlign: 'center',
  },
  availabilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  availabilityText: {
    fontSize: 14,
    color: '#666',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#7C4DFF',
    borderRadius: 25,
    padding: 15,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  declineButton: {
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#7C4DFF',
    borderRadius: 25,
    padding: 15,
    alignItems: 'center',
  },
  declineButtonText: {
    color: '#7C4DFF',
    fontSize: 16,
    fontWeight: '600',
  },
  onlineIndicator: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4CAF50',
    borderWidth: 1.5,
    borderColor: 'white',
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  messagesList: {
    paddingBottom: 20,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 18,
    marginVertical: 5,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#7C4DFF',
    borderTopRightRadius: 4,
  },
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#F5F5F5',
    borderTopLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    color: '#2F2F2F',
    lineHeight: 20,
  },
  messageTime: {
    fontSize: 11,
    color: '#999',
    marginTop: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  attachmentButton: {
    padding: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    maxHeight: 100,
    marginHorizontal: 5,
  },
  sendButton: {
    backgroundColor: '#7C4DFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
  },
});
