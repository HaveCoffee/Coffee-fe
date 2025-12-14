// screens/MatchesScreen.tsx
import React, { useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useChat } from '../context/ChatContext';

export default function MatchesScreen() {
  const { matches, fetchMatches } = useChat();

  useEffect(() => {
    fetchMatches();
  }, []);

  const renderMatch = ({ item }) => (
    <View style={styles.matchCard}>
      <Image source={{ uri: item.profilePicture }} style={styles.avatar} />
      <View style={styles.matchInfo}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.availability}>{item.availability}</Text>
        <Text style={styles.compatibility}>{item.compatibility}% Match</Text>
        <Text style={styles.description}>{item.description}</Text>
        <View style={styles.interestsContainer}>
          {item.sharedInterests?.map((interest, index) => (
            <View key={index} style={styles.interestTag}>
              <Text style={styles.interestText}>{interest}</Text>
            </View>
          ))}
        </View>
        <TouchableOpacity style={styles.chatButton}>
          <Text style={styles.chatButtonText}>Say Hello</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={matches}
        renderItem={renderMatch}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  list: {
    padding: 10,
  },
  matchCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
  },
  matchInfo: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  availability: {
    color: '#4CAF50',
    marginBottom: 4,
  },
  compatibility: {
    color: '#FF9500',
    fontWeight: '600',
    marginBottom: 8,
  },
  description: {
    color: '#666',
    marginBottom: 8,
    fontSize: 14,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  interestTag: {
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 6,
  },
  interestText: {
    fontSize: 12,
    color: '#555',
  },
  chatButton: {
    backgroundColor: '#FF9500',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  chatButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});