import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Avatar from '../components/Avatar';
import { useAuth } from '../context/AuthContext';
import { coffeeMlService } from '../services/coffeeMlService';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, updateUser, logout } = useAuth();

  const [isOpenToMeet, setIsOpenToMeet] = useState<boolean>(true);
  const [website, setWebsite] = useState('');
  const [pronouns, setPronouns] = useState('');
  const [aboutText, setAboutText] = useState('');
  const [fullName, setFullName] = useState(user?.name ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [demographics, setDemographics] = useState<string[]>([]);
  const [traits, setTraits] = useState<string[]>([]);
  const [conversationTopics, setConversationTopics] = useState<string[]>([]);
  const [coffeePreferences, setCoffeePreferences] = useState<string[]>([]);

  const username = user?.mobile_number || 'you';

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const profile = await coffeeMlService.getOwnProfile();
      
      if (profile?.profile_data) {
        const data = profile.profile_data;
        
        // Map Coffee-ML data to UI fields
        setAboutText(data.vibe_summary || '');
        setConversationTopics(Array.isArray(data.interests) ? data.interests : []);
        setCoffeePreferences(data.social_intent ? [data.social_intent] : []);
        setTraits(data.personality_type ? [data.personality_type] : []);
        
        // Demographics from availability
        if (data.availability?.days) {
          setDemographics(data.availability.days);
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      // Note: Profile update functionality would need to be implemented
      // when the backend supports profile updates
      Alert.alert('Info', 'Profile update feature will be available soon.');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const renderTags = (items: string[]) => (
    items.length > 0 && (
      <View style={styles.tagsContainer}>
        {items.map((item, idx) => (
          <View key={`${item}-${idx}`} style={styles.tag}>
            <Text style={styles.tagText}>{item}</Text>
          </View>
        ))}
      </View>
    )
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#9D85FF" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSave} disabled={isSaving}>
          {isSaving ? (
            <ActivityIndicator size="small" color="#7C4DFF" />
          ) : (
            <Text style={styles.doneButton}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile */}
        <View style={styles.profileSection}>
          <Avatar size={80} />
          <Text style={styles.greeting}>Hello, {fullName || 'Alex'}!</Text>
          <TouchableOpacity>
            <Text style={styles.editPhotoText}>Edit Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Demographics */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Here's what we know about you</Text>
            <TouchableOpacity>
              <Ionicons name="create-outline" size={20} color="#9D85FF" />
            </TouchableOpacity>
          </View>
          {renderTags(demographics)}
        </View>

        {/* About You */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>About You</Text>
            <TouchableOpacity>
              <Ionicons name="create-outline" size={20} color="#9D85FF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.aboutText}>{aboutText || 'Tell us about yourself...'}</Text>
        </View>

        {/* Your Traits */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Traits</Text>
            <TouchableOpacity>
              <Ionicons name="create-outline" size={20} color="#9D85FF" />
            </TouchableOpacity>
          </View>
          {renderTags(traits)}
        </View>

        {/* Conversation Topics */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>A perfect conversation is about</Text>
            <TouchableOpacity>
              <Ionicons name="create-outline" size={20} color="#9D85FF" />
            </TouchableOpacity>
          </View>
          {renderTags(conversationTopics)}
        </View>

        {/* Coffee Preferences */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>A perfect coffee is with</Text>
            <TouchableOpacity>
              <Ionicons name="create-outline" size={20} color="#9D85FF" />
            </TouchableOpacity>
          </View>
          {renderTags(coffeePreferences)}
        </View>

        {/* Open to Meet */}
        <View style={styles.section}>
          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionTitle}>Open to Meet</Text>
              <Text style={styles.sectionDescription}>
                Let others know if you're open to meeting new people.
              </Text>
            </View>
            <Switch 
              value={isOpenToMeet} 
              onValueChange={setIsOpenToMeet}
              trackColor={{ false: '#E5E7EB', true: '#9D85FF' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Website */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Website</Text>
            <TouchableOpacity>
              <Ionicons name="create-outline" size={20} color="#9D85FF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.fieldDescription}>Add a link to drive traffic to your site</Text>
        </View>

        {/* Pronouns */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pronouns</Text>
            <TouchableOpacity>
              <Ionicons name="create-outline" size={20} color="#9D85FF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.fieldDescription}>Share how you like to be referred to</Text>
        </View>

        {/* Username */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Username</Text>
            <TouchableOpacity>
              <Ionicons name="create-outline" size={20} color="#9D85FF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.usernameText}>{username}</Text>
        </View>

        {/* Logout Button */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => {
              Alert.alert(
                'Logout',
                'Are you sure you want to logout?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                      try {
                        await logout();
                        router.replace('/(auth)');
                      } catch (error) {
                        Alert.alert('Error', 'Failed to logout');
                      }
                    },
                  },
                ]
              );
            }}
          >
            <Ionicons name="log-out-outline" size={20} color="#E53935" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  doneButton: {
    backgroundColor: '#9D85FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },

  scrollContent: {
    paddingBottom: 24,
  },

  profileSection: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },
  greeting: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
    color: '#1F2937',
  },
  editPhotoText: {
    marginTop: 8,
    fontSize: 14,
    color: '#9D85FF',
  },

  section: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  sectionDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },

  aboutText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },

  fieldDescription: {
    fontSize: 13,
    color: '#9CA3AF',
  },

  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagText: {
    fontSize: 13,
    color: '#1F2937',
  },

  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  usernameText: {
    fontSize: 14,
    color: '#4B5563',
  },

  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E53935',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E53935',
  },
});
