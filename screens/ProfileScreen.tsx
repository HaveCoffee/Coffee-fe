import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Avatar from '../components/Avatar';

export default function ProfileScreen() {
  const router = useRouter();
  const [isOpenToMeet, setIsOpenToMeet] = useState(true);
  const [website, setWebsite] = useState('');
  const [pronouns, setPronouns] = useState('');

  const demographics = ['Male', '18-24'];
  const aboutText = "Alex is a curious adventurer and loves everything about Mumbai - from its slums to its beaches. Always game for a long walk around the city.";
  const traits = ['Creative', 'Enthusiastic', 'Lifelong Learner', 'Community-Focused', 'Visionary', 'Optimistic', 'Collaborative'];
  const conversationTopics = ['Technology', 'Innovation', 'Sustainability', 'Mental Wellness', 'Future Trends', 'Art & Culture', 'Science', 'Philosophy'];
  const coffeePreferences = ['Female', '18-24'];
  const username = 'referodesign';

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.doneButton}>Done</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Picture Section */}
        <View style={styles.profileSection}>
          <Avatar size={100} />
          <Text style={styles.greeting}>Hello, Alex!</Text>
          <TouchableOpacity style={styles.editPhotoButton}>
            <Text style={styles.editPhotoText}>Edit Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Here's what we know about you */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Here's what we know about you</Text>
            <TouchableOpacity>
              <Ionicons name="pencil-outline" size={20} color="#666" />
            </TouchableOpacity>
          </View>
          <View style={styles.tagsContainer}>
            {demographics.map((item, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* About You */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>About You</Text>
            <TouchableOpacity>
              <Ionicons name="pencil-outline" size={20} color="#666" />
            </TouchableOpacity>
          </View>
          <Text style={styles.aboutText}>{aboutText}</Text>
          <TouchableOpacity style={styles.readMoreButton}>
            <Ionicons name="star-outline" size={16} color="#7C4DFF" />
            <Text style={styles.readMoreText}>Read More</Text>
          </TouchableOpacity>
        </View>

        {/* Your Traits */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Traits</Text>
            <TouchableOpacity>
              <Ionicons name="pencil-outline" size={20} color="#666" />
            </TouchableOpacity>
          </View>
          <View style={styles.tagsContainer}>
            {traits.map((trait, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{trait}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* A perfect conversation is about */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>A perfect conversation is about</Text>
            <TouchableOpacity>
              <Ionicons name="pencil-outline" size={20} color="#666" />
            </TouchableOpacity>
          </View>
          <View style={styles.tagsContainer}>
            {conversationTopics.map((topic, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{topic}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* A perfect coffee is with */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>A perfect coffee is with</Text>
            <TouchableOpacity>
              <Ionicons name="pencil-outline" size={20} color="#666" />
            </TouchableOpacity>
          </View>
          <View style={styles.tagsContainer}>
            {coffeePreferences.map((pref, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{pref}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Open to Meet */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>Open to Meet</Text>
              <Text style={styles.sectionDescription}>
                Let others know if you're open to meeting new people.
              </Text>
            </View>
            <Switch
              value={isOpenToMeet}
              onValueChange={setIsOpenToMeet}
              trackColor={{ false: '#E0E0E0', true: '#7C4DFF' }}
              thumbColor={isOpenToMeet ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Website */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Website</Text>
            <TouchableOpacity>
              <Ionicons name="pencil-outline" size={20} color="#666" />
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Add a link to drive traffic to your site"
            value={website}
            onChangeText={setWebsite}
            placeholderTextColor="#999"
          />
        </View>

        {/* Pronouns */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pronouns</Text>
            <TouchableOpacity>
              <Ionicons name="pencil-outline" size={20} color="#666" />
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Share how you like to be referred to"
            value={pronouns}
            onChangeText={setPronouns}
            placeholderTextColor="#999"
          />
        </View>

        {/* Username */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Username</Text>
            <TouchableOpacity>
              <Ionicons name="pencil-outline" size={20} color="#666" />
            </TouchableOpacity>
          </View>
          <Text style={styles.usernameText}>{username}</Text>
        </View>
      </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  doneButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7C4DFF',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2F2F2F',
  },
  editPhotoButton: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editPhotoText: {
    color: '#666',
    fontSize: 14,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  sectionTitleContainer: {
    flex: 1,
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2F2F2F',
    marginBottom: 5,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 14,
    color: '#2F2F2F',
  },
  aboutText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#2F2F2F',
    marginBottom: 10,
  },
  readMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  readMoreText: {
    fontSize: 14,
    color: '#7C4DFF',
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 15,
    color: '#2F2F2F',
  },
  usernameText: {
    fontSize: 15,
    color: '#2F2F2F',
  },
});
