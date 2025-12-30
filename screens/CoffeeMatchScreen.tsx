// screens/CoffeeMatchScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  Dimensions,
  Image,
  ImageBackground,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator
} from 'react-native';
import { conversationService } from '../services/conversationService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function CoffeeMatchScreen() {
  const router = useRouter();
  const { matchId, view } = useLocalSearchParams<{ 
    matchId?: string, 
    view?: 'profile' | 'chat' 
  }>();
  const [isStartingChat, setIsStartingChat] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data - in a real app, this would come from your API
  const [matchData, setMatchData] = useState({
    name: 'Alex',
    age: 29,
    location: 'New York, NY',
    bio: 'Coffee enthusiast and digital nomad. Love hiking, photography, and meeting new people over a good cup of coffee.',
    interests: ['Photography', 'Hiking', 'Travel', 'Coffee', 'Reading'],
    matchPercentage: 92,
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    coverPhoto: 'https://images.unsplash.com/photo-1506905925346-21bda4d315df?w=800&q=80',
    conversationStarters: [
      'What\'s your favorite coffee shop in the city?',
      'Do you have any travel plans coming up?',
      'What got you into photography?'
    ]
  });

  // Navigate to chat if view is 'chat' and we have a matchId
  useEffect(() => {
    if (view === 'chat' && matchId) {
      handleChatNow();
    }
  }, [view, matchId]);

  const handleChatNow = async () => {
    if (isStartingChat) return;
    setIsStartingChat(true);
    
    try {
      // In a real app, you would create a conversation with the match
      // and then navigate to the conversation screen
      const conversation = await conversationService.createConversation(
        matchId || '',
        `Hi ${matchData.name}! I found you on Coffee Dimension and would love to chat.`
      );
      
      // Navigate to the conversation
      router.push(`/(chat)/${conversation.id}`);
    } catch (error) {
      console.error('Error starting chat:', error);
      // Handle error (show error message to user)
    } finally {
      setIsStartingChat(false);
    }
  };

  const handleViewProfile = () => {
    // Navigate to the user's profile
    router.push(`/profile/${matchId}`);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7C4DFF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>It's a Match!</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Match Banner */}
        <View style={styles.matchBanner}>
          <Text style={styles.matchTitle}>You and {matchData.name} matched!</Text>
          <Text style={styles.matchSubtitle}>Start a conversation and get to know each other</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <ImageBackground
            source={{ uri: matchData.coverPhoto }}
            style={styles.coverPhoto}
            imageStyle={styles.coverPhotoImage}
          >
            <LinearGradient
              colors={['rgba(0,0,0,0.7)', 'transparent']}
              style={styles.coverPhotoOverlay}
            />
            <View style={styles.profileHeader}>
              <Image
                source={{ uri: matchData.avatar }}
                style={styles.avatar}
              />
              <View style={styles.profileInfo}>
                <Text style={styles.name}>{matchData.name}, {matchData.age}</Text>
                <View style={styles.locationContainer}>
                  <Ionicons name="location" size={14} color="#666" />
                  <Text style={styles.location}>{matchData.location}</Text>
                </View>
                <View style={styles.matchPercentageContainer}>
                  <Ionicons name="flame" size={16} color="#FF3B30" />
                  <Text style={styles.matchPercentage}>{matchData.matchPercentage}% Match</Text>
                </View>
              </View>
            </View>
          </ImageBackground>

          {/* Bio Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.bioText}>{matchData.bio}</Text>
          </View>

          {/* Interests */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Interests</Text>
            <View style={styles.interestsContainer}>
              {matchData.interests.map((interest, index) => (
                <View key={index} style={styles.interestTag}>
                  <Text style={styles.interestText}>{interest}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Conversation Starters */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Conversation Starters</Text>
            <View style={styles.conversationStartersContainer}>
              {matchData.conversationStarters.map((starter, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={styles.starterCard}
                  onPress={() => {
                    // In a real app, you would send this as a message
                    console.log('Sending message:', starter);
                  }}
                >
                  <Text style={styles.starterText}>{starter}</Text>
                  <Ionicons name="arrow-forward" size={16} color="#7C4DFF" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, styles.viewProfileButton]}
          onPress={handleViewProfile}
        >
          <Text style={[styles.buttonText, styles.viewProfileButtonText]}>View Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.chatButton]}
          onPress={handleChatNow}
          disabled={isStartingChat}
        >
          {isStartingChat ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={[styles.buttonText, styles.chatButtonText]}>Say Hello</Text>
          )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#7C4DFF',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 100,
  },
  matchBanner: {
    backgroundColor: '#7C4DFF',
    padding: 24,
    alignItems: 'center',
    paddingBottom: 40,
  },
  matchTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  matchSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
    textAlign: 'center',
    maxWidth: '80%',
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginTop: -20,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
    overflow: 'hidden',
  },
  coverPhoto: {
    height: 200,
    width: '100%',
  },
  coverPhotoImage: {
    resizeMode: 'cover',
  },
  coverPhotoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  profileHeader: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#fff',
    marginRight: 12,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  location: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  matchPercentageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  matchPercentage: {
    color: '#333',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  bioText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  interestTag: {
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    margin: 4,
  },
  interestText: {
    fontSize: 12,
    color: '#333',
  },
  conversationStartersContainer: {
    marginTop: 8,
  },
  starterCard: {
    backgroundColor: '#f8f5ff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  starterText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    marginRight: 8,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  button: {
    flex: 1,
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  viewProfileButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#7C4DFF',
  },
  chatButton: {
    backgroundColor: '#7C4DFF',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  viewProfileButtonText: {
    color: '#7C4DFF',
  },
  chatButtonText: {
    color: '#fff',
  },
});