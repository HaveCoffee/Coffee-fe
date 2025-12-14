import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../navigation/types';

type Conversation = {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unreadCount: number;
  isOnline: boolean;
  image: any; // In a real app, this would be a URL or require()
};

const HomeScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [activeTab, setActiveTab] = useState('All');

  // Mock data - in a real app, this would come from your state management
  const conversations: Conversation[] = [
    {
      id: '1',
      name: 'Sarah',
      lastMessage: 'Monday Evening Works',
      time: '01/09/25',
      unreadCount: 3,
      isOnline: true,
      image: require('../assets/placeholder-avatar.png'),
    },
    {
      id: '2',
      name: 'Sameer Sheikh',
      lastMessage: 'Story of Yama and Yamuna Ac',
      time: '3:48 pm',
      unreadCount: 0,
      isOnline: false,
      image: require('../assets/placeholder-avatar.png'),
    },
    // Add more mock conversations as needed
  ];

  const renderConversationItem = ({ item }: { item: Conversation }) => (
    <TouchableOpacity 
      style={styles.conversationItem}
      onPress={() => navigation.navigate('Chat', { matchId: item.id })}
    >
      <View style={styles.avatarContainer}>
        <Image source={item.image} style={styles.avatar} />
        {item.isOnline && <View style={styles.onlineIndicator} />}
      </View>
      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.time}>{item.time}</Text>
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
        <Text style={styles.time}>9:41</Text>
        <Text style={styles.title}>Coffee</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.notificationIcon}>
            <Ionicons name="notifications-outline" size={24} color="black" />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationCount}>3</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.profileImageContainer}>
            <Image 
              source={require('../assets/placeholder-avatar.png')} 
              style={styles.profileImage} 
            />
            <View style={styles.onlineIndicator} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {['All', 'Unread 99+', 'Favourites'].map((tab) => (
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

      {/* Conversations List */}
      <FlatList
        data={conversations}
        renderItem={renderConversationItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.conversationList}
      />

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab}>
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="home" size={24} color="#FF9500" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="compass-outline" size={24} color="gray" />
          <Text style={styles.navText}>Discover</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navMicButton}>
          <Ionicons name="mic" size={30} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="calendar-outline" size={24} color="gray" />
          <Text style={styles.navText}>Plans</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="person-outline" size={24} color="gray" />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

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
  time: {
    fontSize: 16,
    fontWeight: '500',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
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
  profileImageContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
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
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingHorizontal: 15,
  },
  tab: {
    paddingVertical: 15,
    marginRight: 25,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#4CAF50',
  },
  tabText: {
    fontSize: 16,
    color: 'gray',
  },
  activeTabText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  conversationList: {
    padding: 10,
  },
  conversationItem: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 15,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
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
    right: 25,
    bottom: 90,
    backgroundColor: '#FF9500',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: 'white',
  },
  navItem: {
    alignItems: 'center',
    flex: 1,
  },
  navText: {
    fontSize: 12,
    color: 'gray',
    marginTop: 4,
  },
  navMicButton: {
    backgroundColor: '#FF9500',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default HomeScreen;
