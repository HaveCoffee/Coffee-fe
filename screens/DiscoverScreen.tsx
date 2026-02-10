import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Avatar from '../components/Avatar';
import { coffeeMlService, Match } from '../services/coffeeMlService';

export default function DiscoverScreen() {
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMatches = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await coffeeMlService.getMatches();
        setMatches(result.matches || []);
      } catch (err: any) {
        console.error('Error loading Coffee-ml matches:', err);
        setError(err.message || 'Failed to load matches');
      } finally {
        setLoading(false);
      }
    };

    loadMatches();
  }, []);

  const renderMatch = ({ item }: { item: Match }) => {
    const profile = item.profile_data || {};
    // Extract name using the helper function from coffeeMlService
    const name: string = profile.name || 
                        profile.display_name || 
                        profile.username ||
                        // Extract from vibe_summary if available
                        (profile.vibe_summary ? 
                          (() => {
                            const vibeText = profile.vibe_summary;
                            const iAmMatch = vibeText.match(/I am ([A-Z][a-z]+)/i);
                            if (iAmMatch) return iAmMatch[1];
                            const nameMatch = vibeText.match(/(?:my name is|i'm|i am) ([A-Z][a-z]+)/i);
                            if (nameMatch) return nameMatch[1];
                            const firstWordMatch = vibeText.match(/^([A-Z][a-z]+)(?:\s|,|\.|!)/);
                            if (firstWordMatch && firstWordMatch[1].length > 2) return firstWordMatch[1];
                            return null;
                          })()
                        : null) ||
                        `User ${item.user_id.substring(0, 6)}`;
    const availability: string = typeof profile.availability === 'string' 
      ? profile.availability 
      : profile.availability?.days?.join(', ') || 'Available this week';
    const matchPercentage = Math.round(item.score * 100);
    const sharedInterests: string[] = Array.isArray(profile.interests)
      ? profile.interests.slice(0, 3)
      : [];
    const conversationStarter: string | undefined =
      typeof profile.conversation_starter === 'string'
        ? profile.conversation_starter
        : profile.vibe_summary;
    const initial = name.charAt(0).toUpperCase();

const handlePress = () => {
  router.push({
    pathname: '/profile/' + item.user_id
  });
};

const handleSayHello = async () => {
  try {
    // Call start-chat API
    await coffeeMlService.startChat(item.user_id);
    // Navigate to chat with user name
    router.push({
      pathname: `/(chat)/${item.user_id}`,
      params: { userName: name }
    });
  } catch (error: any) {
    console.error('Error starting chat:', error);
  }
};

    return (
      <TouchableOpacity style={styles.matchCard} onPress={handlePress}>
        <View style={styles.matchHeaderRow}>
          <View style={styles.matchUserInfo}>
            <View style={styles.avatarCircle}>
              <Avatar size={32} />
            </View>
            <View>
              <Text style={styles.matchName} numberOfLines={1}>
                {name}
              </Text>
              <Text style={styles.matchAvailability} numberOfLines={1}>
                {availability}
              </Text>
            </View>
          </View>

          <View style={styles.matchScoreBadge}>
            <Ionicons name="star" size={14} color="#FFB800" />
            <Text style={styles.matchScoreText}>{matchPercentage}%</Text>
          </View>
        </View>

        {profile.vibe_summary ? (
          <Text style={styles.vibe} numberOfLines={3}>
            {profile.vibe_summary}
          </Text>
        ) : null}

        {sharedInterests.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Shared Interests</Text>
            <View style={styles.interestsRow}>
              {sharedInterests.map((interest: string, idx: number) => (
                <View key={idx} style={styles.interestPill}>
                  <Text style={styles.interestText}>{interest}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {conversationStarter && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Conversation Starter</Text>
            <Text style={styles.conversationStarter} numberOfLines={3}>
              {conversationStarter}
            </Text>
          </View>
        )}

        <TouchableOpacity 
          style={styles.sayHelloButton} 
          onPress={(e) => {
            e.stopPropagation();
            handleSayHello();
          }}
        >
          <Text style={styles.sayHelloText}>Say Hello</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Discover</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#7C4DFF" />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={matches}
          keyExtractor={(item) => item.user_id}
          renderItem={renderMatch}
          contentContainerStyle={matches.length === 0 ? styles.emptyList : styles.list}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>No matches yet.</Text>
              <Text style={styles.emptySubtext}>Chat with Ella to build your profile and get matches.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  list: {
    padding: 16,
  },
  emptyList: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  errorText: {
    color: '#FF3B30',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  matchCard: {
    backgroundColor: 'rgba(157, 133, 255, 0.07)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    marginHorizontal: 16,
  },
  matchHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  matchUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  matchName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    color: '#1F2937',
  },
  matchAvailability: {
    fontSize: 14,
    color: '#6B7280',
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: '#DEE1E6',
    alignSelf: 'flex-start',
  },
  matchScoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(157, 133, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
  },
  matchScoreText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9D85FF',
    marginLeft: 4,
  },
  vibe: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 12,
    lineHeight: 20,
  },
  section: {
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  interestsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestPill: {
    backgroundColor: '#D1FAE5',
    borderRadius: 9999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  interestText: {
    fontSize: 13,
    color: '#1F2937',
  },
  conversationStarter: {
    fontSize: 14,
    color: '#1F2937',
    lineHeight: 20,
  },
  sayHelloButton: {
    backgroundColor: 'rgba(157, 133, 255, 0.26)',
    borderRadius: 9999,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  sayHelloText: {
    color: '#171A1F',
    fontSize: 14,
    fontWeight: '500',
  },
});