// app/(chat)/index.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Image, ImageSourcePropType } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

// Inline Avatar component with SVG fallback
const Avatar = ({ source, size = 40 }: { source?: ImageSourcePropType; size?: number }) => {
  if (source) {
    return (
      <Image
        source={source}
        style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}
        onError={() => console.log('Error loading avatar')}
      />
    );
  }

  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
      <Svg width={size} height={size} viewBox="0 0 200 200" fill="none">
        <Circle cx="100" cy="100" r="100" fill="#E0E0E0" />
        <Circle cx="100" cy="80" r="40" fill="#9E9E9E" />
        <Path d="M100 130C122.091 130 140 147.909 140 170H60C60 147.909 77.9086 130 100 130Z" fill="#9E9E9E" />
      </Svg>
    </View>
  );
};

const chatList = [
  {
    id: 'ella',
    name: 'Ella',
    lastMessage: 'Hello! How can I help you today?',
    time: '10:30 AM',
    unread: 2,
  },
  {
    id: 'support',
    name: 'Support Team',
    lastMessage: 'Your order #12345 has been confirmed',
    time: 'Yesterday',
    unread: 0,
  },
  {
    id: 'updates',
    name: 'Order Updates',
    lastMessage: 'Your coffee is on its way!',
    time: 'Yesterday',
    unread: 0,
  }
];

export default function ChatList() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <TouchableOpacity>
          <Ionicons name="search" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.chatList}>
        {chatList.map((chat) => (
          <TouchableOpacity 
            key={chat.id} 
            style={styles.chatItem}
            onPress={() => router.push(`/(chat)/${chat.id}`)}
          >
            <Avatar 
              source={chat.id === 'ella' ? require('../../assets/ella-avatar.png') : undefined} 
              size={56}
            />
            <View style={styles.chatInfo}>
              <View style={styles.chatHeader}>
                <Text style={styles.chatName}>{chat.name}</Text>
                <Text style={styles.chatTime}>{chat.time}</Text>
              </View>
              <Text style={styles.chatMessage} numberOfLines={1}>
                {chat.lastMessage}
              </Text>
            </View>
            {chat.unread > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{chat.unread}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  chatList: {
    flex: 1,
  },
  chatItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
    alignItems: 'center',
  },
  chatInfo: {
    flex: 1,
    marginLeft: 16,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
  },
  chatTime: {
    fontSize: 12,
    color: '#888',
  },
  chatMessage: {
    fontSize: 14,
    color: '#666',
  },
  unreadBadge: {
    backgroundColor: '#007AFF',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  avatar: {
    overflow: 'hidden',
    backgroundColor: '#E0E0E0',
  },
});