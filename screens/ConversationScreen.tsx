import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useRoute } from '@react-navigation/native';
import React, { useState } from 'react';
import {
    FlatList,
    Image,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { RootStackParamList } from '../navigation/types';

type Message = {
  id: string;
  text: string;
  sender: 'me' | 'them';
  time: string;
};

type ConversationScreenRouteProp = RouteProp<RootStackParamList, 'Conversation'>;

export default function ConversationScreen() {
  const route = useRoute<ConversationScreenRouteProp>();
  const { conversationId } = route.params;
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
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <View style={styles.userInfo}>
          <View style={styles.avatarContainer}>
            <Image
              source={require('../assets/placeholder-avatar.png')}
              style={styles.avatar}
            />
            <View style={styles.onlineIndicator} />
          </View>
          <View>
            <Text style={styles.userName}>Anya</Text>
            <Text style={styles.userStatus}>Online</Text>
          </View>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.notificationIcon}>
            <Ionicons name="notifications-outline" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="ellipsis-vertical" size={24} color="black" />
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
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 10,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  onlineIndicator: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: 'white',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
  },
  userStatus: {
    fontSize: 12,
    color: 'gray',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationIcon: {
    marginRight: 20,
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
    backgroundColor: '#FF9500',
    borderTopRightRadius: 4,
  },
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0f0f0',
    borderTopLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    color: 'black',
  },
  messageTime: {
    fontSize: 10,
    color: 'rgba(0,0,0,0.5)',
    marginTop: 4,
    alignSelf: 'flex-end',
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
    backgroundColor: '#FF9500',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
  },
});
