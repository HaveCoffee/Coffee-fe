import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
    const name: string = profile.name || item.user_id;
    const availability: string = profile.availability || 'Available this week';
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

    const handleSayHello = () => {
  router.push({
    pathname: '/(chat)/new',
    params: { 
      userId: item.user_id,
      name: name,
      avatar: profile.avatar
    }
  });
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
        <Text style={styles.subtitle}>Matches curated by Coffee-ml</Text>
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
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'gray',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
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
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  matchAvailability: {
    fontSize: 14,
    color: '#666',
  },
  matchScoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F5FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  matchScoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7C4DFF',
    marginLeft: 4,
  },
  vibe: {
    fontSize: 14,
    color: '#333',
    marginBottom: 12,
    lineHeight: 20,
  },
  section: {
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  interestsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  interestPill: {
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 6,
  },
  interestText: {
    fontSize: 12,
    color: '#333',
  },
  conversationStarter: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    backgroundColor: '#F8F5FF',
    padding: 12,
    borderRadius: 8,
  },
  sayHelloButton: {
    backgroundColor: '#7C4DFF',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  sayHelloText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});