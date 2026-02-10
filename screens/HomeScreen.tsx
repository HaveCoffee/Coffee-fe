import { Ionicons } from '@expo/vector-icons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Avatar from '../components/Avatar';
import { ConnectionStatus } from '../components/ConnectionStatus';
import { WebSocketTest } from '../components/WebSocketTest';
import { useAuth } from '../context/AuthContext';
import { useWebSocketContext } from '../context/WebSocketContext';
import { useNotifications } from '../context/NotificationContext';
import {
  Conversation,
  conversationService,
} from '../services/conversationService';
import { coffeeMlService } from '../services/coffeeMlService';

const HomeScreen = () => {
  const router = useRouter();
  const tabBarHeight = useBottomTabBarHeight();
  const { logout, hasCompletedOnboarding } = useAuth();
  const { isConnected, on, off } = useWebSocketContext();
  const { unreadCounts } = useNotifications();
  
  console.log('🔔 [HOME] Unread counts:', unreadCounts);

  const [activeTab, setActiveTab] = useState('All');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [showWebSocketTest, setShowWebSocketTest] = useState(false);

  const loadConversations = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('🔄 [CONVERSATIONS] Loading active chats...');
      const activeChatsResponse = await coffeeMlService.getActiveChats();
      console.log('📋 [CONVERSATIONS] Active chats response:', activeChatsResponse);
      
      // Transform Coffee-ML matches to Conversation format
      const conversations: Conversation[] = activeChatsResponse.matches.map(match => {
        const profileData = match.profile_data || {};
        // Extract proper user name using pattern matching
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
                         `User ${match.user_id.substring(0, 6)}`;
        
        return {
          id: match.user_id,
          userId: match.user_id,
          userName,
          userAvatar: undefined,
          lastMessage: profileData.social_intent || 'Start a conversation',
          lastMessageTime: match.last_active || new Date().toISOString(),
          unreadCount: 1, // Default to 1 unread for testing
          isOnline: false,
        };
      });
      
      // Update conversations with unread counts from notification context
      const conversationsWithUnread = conversations.map(conv => ({
        ...conv,
        unreadCount: unreadCounts[conv.userId] || 0
      }));
      
      // Sort conversations by most recent message time
      const sortedConversations = conversationsWithUnread.sort((a, b) => 
        new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
      );
      
      console.log('✅ [CONVERSATIONS] Transformed conversations:', sortedConversations.length);
      setConversations(sortedConversations);
    } catch (error) {
      console.error('Error loading conversations:', error);
      // Fallback to old service if Coffee-ML fails
      const data = await conversationService.getConversations();
      setConversations(data);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
    
    // Listen for new messages to update conversation list
    const handleNewMessage = (data: any) => {
      if (data.type === 'chat_message') {
        const senderId = data.senderId || data.sender_id;
        const messageText = data.content || data.text;
        const timestamp = data.createdAt || data.timestamp || new Date().toISOString();
        
        setConversations(prev => {
          // Update the conversation with new message and move to top
          const updatedConversations = prev.map(conv => {
            if (conv.userId === senderId) {
              return {
                ...conv,
                lastMessage: messageText,
                lastMessageTime: timestamp,
                unreadCount: (unreadCounts[senderId] || 0)
              };
            }
            return conv;
          });
          
          // Sort by lastMessageTime (most recent first)
          return updatedConversations.sort((a, b) => 
            new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
          );
        });
      }
    };
    
    // Listen for user online/offline status
    const handleUserStatus = (data: any) => {
      if (data.type === 'user_online' || data.type === 'user_offline') {
        const isOnline = data.type === 'user_online';
        setConversations(prev =>
          prev.map(conv =>
            conv.id === data.user_id ? { ...conv, isOnline } : conv
          )
        );
      }
    };
    
    // Listen for connection status
    const handleConnectionChange = (data: any) => {
      if (data.type === 'connected') {
        console.log('[Home] WebSocket connected - refreshing conversations');
        loadConversations();
      }
    };
    
    on('chat_message', handleNewMessage);
    on('user_online', handleUserStatus);
    on('user_offline', handleUserStatus);
    on('connected', handleConnectionChange);
    
    // Fallback polling for when WebSocket is not available
    const pollInterval = setInterval(() => {
      if (!isConnected) {
        console.log('🔄 [CONVERSATIONS] WebSocket not connected - polling for updates');
        loadConversations();
      }
    }, 30000);
    
    return () => {
      off('chat_message', handleNewMessage);
      off('user_online', handleUserStatus);
      off('user_offline', handleUserStatus);
      off('connected', handleConnectionChange);
      clearInterval(pollInterval);
    };
  }, [unreadCounts]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadConversations();
  }, [loadConversations]);

  const formatTime = (timestamp: string): string => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;

      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return timestamp;
    }
  };

  const renderConversationItem = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      style={styles.conversationItem}
      onPress={() => router.push({
        pathname: `/(chat)/${item.id}`,
        params: { userName: item.userName }
      })}
    >
      <View style={styles.avatarContainer}>
        <Avatar size={50} />
        {item.isOnline && <View style={styles.onlineIndicator} />}
      </View>

      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={styles.name}>{item.userName}</Text>
          <Text style={styles.time}>
            {formatTime(item.lastMessageTime)}
          </Text>
        </View>

        <View style={styles.messageContainer}>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessage}
          </Text>

          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>
                {item.unreadCount > 99 ? '99+' : item.unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Messages</Text>
          <ConnectionStatus showText={false} size="small" />
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.notificationIcon}>
            <Ionicons
              name="notifications-outline"
              size={24}
              color="black"
            />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationCount}>3</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setMenuVisible(true)}>
            <Ionicons
              name="ellipsis-vertical"
              size={20}
              color="black"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {['All', 'Unread 99+', 'Favourites'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              activeTab === tab && styles.activeTab,
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* WebSocket Test (only in development) */}
      {__DEV__ && showWebSocketTest && <WebSocketTest />}

      {/* Conversations */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7C4DFF" />
        </View>
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderConversationItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.conversationList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No conversations yet
              </Text>
              <Text style={styles.emptySubtext}>
                Start a conversation to see it here
              </Text>
            </View>
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={[
          styles.fab,
          { bottom: tabBarHeight + 16 },
        ]}
        onPress={() => router.push('/new-chat' as any)}
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>

      {/* Menu */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setMenuVisible(false)}
      >
        <View style={styles.menuOverlay}>
          <TouchableOpacity
            style={styles.menuOverlayTouchable}
            onPress={() => setMenuVisible(false)}
          />
          <View style={styles.menuContainer}>
            <Text style={styles.menuTitle}>Menu</Text>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                setShowWebSocketTest(!showWebSocketTest);
              }}
            >
              <Ionicons
                name="wifi-outline"
                size={22}
                color="#333"
              />
              <Text style={styles.menuItemText}>
                {showWebSocketTest ? 'Hide' : 'Show'} Socket.IO Test
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                router.push('/profile-setup' as any);
              }}
            >
              <Ionicons
                name="person-circle-outline"
                size={22}
                color="#333"
              />
              <Text style={styles.menuItemText}>
                Edit Profile
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={async () => {
                setMenuVisible(false);
                Alert.alert(
                  'Logout',
                  'Are you sure you want to logout?',
                  [
                    {
                      text: 'Cancel',
                      style: 'cancel',
                    },
                    {
                      text: 'Logout',
                      style: 'destructive',
                      onPress: async () => {
                        try {
                          await logout();
                          router.replace('/(auth)');
                        } catch (error) {
                          Alert.alert('Error', 'Failed to logout. Please try again.');
                        }
                      },
                    },
                  ]
                );
              }}
            >
              <Ionicons
                name="log-out-outline"
                size={22}
                color="#E53935"
              />
              <Text
                style={[
                  styles.menuItemText,
                  { color: '#E53935' },
                ]}
              >
                Logout
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCF6F3',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#FCF6F3',
    shadowColor: '#171a1f',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },

  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },

  notificationIcon: {
    marginRight: 20,
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

  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FCF6F3',
    gap: 8,
  },

  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 9999,
    backgroundColor: '#F3F4F6',
  },

  activeTab: {
    backgroundColor: '#4CAF50',
  },

  tabText: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '500',
    color: '#565D6D',
  },

  activeTabText: {
    color: '#FFFFFF',
  },

  conversationList: {
    padding: 10,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },

  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
  },

  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },

  conversationItem: {
    flexDirection: 'row',
    padding: 16,
    marginHorizontal: 10,
    marginVertical: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    alignItems: 'center',
  },

  avatarContainer: {
    marginRight: 15,
  },

  conversationContent: {
    flex: 1,
  },

  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },

  name: {
    fontSize: 16,
    fontWeight: '600',
  },

  messageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  lastMessage: {
    color: 'gray',
    flex: 1,
    marginRight: 10,
  },

  unreadBadge: {
    backgroundColor: 'red',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },

  unreadCount: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },

  fab: {
    position: 'absolute',
    right: 20,
    backgroundColor: '#8B4513',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },

  menuOverlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },

  menuOverlayTouchable: {
    flex: 1,
  },

  menuContainer: {
    width: 240,
    backgroundColor: '#fff',
    paddingTop: 40,
    paddingHorizontal: 16,
  },

  menuTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },

  menuItemText: {
    fontSize: 16,
    marginLeft: 12,
    color: '#333',
  },
});

export default HomeScreen;
