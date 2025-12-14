import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useRoute } from '@react-navigation/native';
import React from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { RootStackParamList } from '../navigation/types';

type CoffeeMatchScreenRouteProp = RouteProp<RootStackParamList, 'CoffeeMatch'>;

export default function CoffeeMatchScreen() {
  const route = useRoute<CoffeeMatchScreenRouteProp>();
  const { matchId } = route.params;

  // Mock data - in a real app, this would come from your state management
  const matchData = {
    name: 'Elara',
    matchPercentage: 85,
    sharedInterests: [
      'Small-town to big city transition',
      'Balancing parenting and career',
      'New to the city',
    ],
    recentContext: {
      text: "Meeting up with friends for coffee at 'The Daily Grind' this afternoon. Anyone else joining?",
      time: '15 minutes ago',
    },
    conversationTopics: [
      'Andaz Apna Apna',
      'Atlas Shrugged',
      'The Louvre in Paris',
      'AI for Education',
    ],
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Coffee with {matchData.name}?</Text>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.reportButton}>
              <Ionicons name="flag-outline" size={20} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Match Percentage */}
        <View style={styles.matchContainer}>
          <Text style={styles.matchPercentage}>{matchData.matchPercentage}%</Text>
          <Text style={styles.matchText}>chance of a great conversation</Text>
        </View>

        {/* Shared Interests */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>You both share</Text>
          <View style={styles.tagsContainer}>
            {matchData.sharedInterests.map((interest, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{interest}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Recent Context */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Context</Text>
            <TouchableOpacity>
              <Ionicons name="pencil" size={18} color="#007AFF" />
            </TouchableOpacity>
          </View>
          <View style={styles.contextCard}>
            <Text style={styles.contextText}>{matchData.recentContext.text}</Text>
            <Text style={styles.contextTime}>{matchData.recentContext.time}</Text>
          </View>
        </View>

        {/* Conversation Topics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Feel Free to Bring Up</Text>
          <View style={styles.tagsContainer}>
            {matchData.conversationTopics.map((topic, index) => (
              <View key={index} style={[styles.tag, styles.topicTag]}>
                <Text style={styles.topicTagText}>{topic}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.declineButton}>
          <Text style={styles.declineButtonText}>Decline</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.chatButton}>
          <Text style={styles.chatButtonText}>Chat Now</Text>
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
  scrollContent: {
    paddingBottom: 100, // Space for the action buttons
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
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
    marginHorizontal: 10,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reportButton: {
    padding: 5,
  },
  matchContainer: {
    alignItems: 'center',
    paddingVertical: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  matchPercentage: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 5,
  },
  matchText: {
    fontSize: 16,
    color: 'gray',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  tag: {
    backgroundColor: '#f0f0f0',
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 14,
    color: '#333',
  },
  topicTag: {
    backgroundColor: '#E3F2FD',
  },
  topicTagText: {
    color: '#1976D2',
  },
  contextCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 15,
  },
  contextText: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 8,
  },
  contextTime: {
    fontSize: 12,
    color: 'gray',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  declineButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 25,
    padding: 15,
    marginRight: 10,
    alignItems: 'center',
  },
  declineButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  chatButton: {
    flex: 2,
    backgroundColor: '#4CAF50',
    borderRadius: 25,
    padding: 15,
    alignItems: 'center',
  },
  chatButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
