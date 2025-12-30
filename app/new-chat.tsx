import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Avatar from '../screens/../components/Avatar';
import { Match, coffeeMlService } from '../services/coffeeMlService';
import { conversationService } from '../services/conversationService';

export default function NewChatScreen() {
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [creatingFor, setCreatingFor] = useState<string | null>(null);

  const loadMatches = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await coffeeMlService.getMatches();
      setMatches(response.matches || []);
    } catch (error: any) {
      console.error('Error loading matches:', error);
      Alert.alert('Error', error.message || 'Failed to load people to chat with.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  const handleStartChat = async (match: Match) => {
    if (!match.user_id || creatingFor) return;

    try {
      setCreatingFor(match.user_id);
      const conversation = await conversationService.createConversation(match.user_id);
      router.push(`/(chat)/${conversation.id}` as any);
    } catch (error: any) {
      console.error('Error starting conversation:', error);
      Alert.alert('Error', error.message || 'Failed to start conversation.');
    } finally {
      setCreatingFor(null);
    }
  };

  const renderMatch = ({ item }: { item: Match }) => {
    const title = item.profile_data?.vibe_summary || 'Coffee match';
    const subtitle = item.profile_data?.social_intent || 'Tap to start a chat';

    return (
      <TouchableOpacity
        style={styles.matchItem}
        onPress={() => handleStartChat(item)}
        disabled={!!creatingFor}
      >
        <View style={styles.avatarContainer}>
          <Avatar size={48} />
        </View>
        <View style={styles.matchContent}>
          <View style={styles.matchHeader}>
            <Text style={styles.matchTitle} numberOfLines={1}>
              {title}
            </Text>
            {typeof item.score === 'number' && (
              <Text style={styles.matchScore}>{item.score}%</Text>
            )}
          </View>
          <Text style={styles.matchSubtitle} numberOfLines={2}>
            {subtitle}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Chat</Text>
        <View style={{ width: 24 }} />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7C4DFF" />
          <Text style={styles.loadingText}>Finding people you can chat with...</Text>
        </View>
      ) : matches.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No matches yet</Text>
          <Text style={styles.emptySubtitle}>
            Complete your profile and check back later to find new people to chat with.
          </Text>
        </View>
      ) : (
        <FlatList
          data={matches}
          renderItem={renderMatch}
          keyExtractor={(item) => item.user_id}
          contentContainerStyle={styles.listContent}
        />
      )}
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
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#444',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  matchItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 12,
  },
  matchContent: {
    flex: 1,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  matchTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  matchScore: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4CAF50',
  },
  matchSubtitle: {
    fontSize: 13,
    color: '#666',
  },
});
