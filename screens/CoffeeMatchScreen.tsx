import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function CoffeeMatchScreen() {
  const router = useRouter();
  const { matchId } = useLocalSearchParams<{ matchId?: string }>();

  // Mock data - in a real app, this would come from your state management
  const matchData = {
    name: 'Elara',
    matchPercentage: 85,
    matchReasons: [
      'You are both small towners having moved to bigger cities to study and crave the comfortable life.',
      "You're both navigating parenting and career",
      "and Elara has recently started writing a new blog on parenting where she'd love to hear your point of view",
    ],
    recentContext: {
      text: "Meeting up with friends for coffee at 'The Daily Grind' this afternoon. Anyone else joining?",
      time: '15 mins ago',
    },
    conversationTopics: [
      { text: 'Andaz Apna Apna', color: '#C8E6C9' },
      { text: 'Atlas Shrugged', color: '#BBDEFB' },
      { text: 'The Louvre in Paris', color: '#FFF9C4' },
      { text: 'AI for Education', color: '#E1BEE7' },
    ],
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Coffee with {matchData.name}?</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
        </View>

        {/* Match Card */}
        <View style={styles.matchCard}>
          <View style={styles.matchHeader}>
            <Text style={styles.matchCardTitle}>Chance you'll have a Good Conversation</Text>
            <View style={styles.matchPercentageBadge}>
              <Ionicons name="flash" size={16} color="#FF9500" />
              <Text style={styles.matchPercentageText}>{matchData.matchPercentage}%</Text>
            </View>
          </View>
          <View style={styles.matchReasonsContainer}>
            {matchData.matchReasons.map((reason, index) => (
              <Text key={index} style={styles.matchReason}>
                {reason}
              </Text>
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
          <Text style={styles.sectionTitle}>Feel Free to Bring uUp</Text>
          <View style={styles.tagsContainer}>
            {matchData.conversationTopics.map((topic, index) => (
              <View key={index} style={[styles.topicTag, { backgroundColor: topic.color }]}>
                <Text style={styles.topicTagText}>{topic.text}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Action Button */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.chatButton}
          onPress={() => router.push(`/(chat)/${matchId || '1'}`)}
        >
          <Ionicons name="paper-plane" size={20} color="white" style={styles.chatButtonIcon} />
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  backButton: {
    padding: 5,
  },
  matchCard: {
    backgroundColor: '#F3E5F5',
    margin: 20,
    padding: 20,
    borderRadius: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  matchCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 10,
  },
  matchPercentageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  matchPercentageText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF9500',
  },
  matchReasonsContainer: {
    gap: 10,
  },
  matchReason: {
    fontSize: 14,
    lineHeight: 20,
    color: '#2F2F2F',
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
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 10,
    marginBottom: 10,
  },
  topicTagText: {
    fontSize: 14,
    color: '#2F2F2F',
    fontWeight: '500',
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
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  chatButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 25,
    padding: 15,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  chatButtonIcon: {
    marginRight: 0,
  },
  chatButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
