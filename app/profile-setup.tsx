import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';

export default function ProfileSetupScreen() {
  const { user, updateUser } = useAuth();

  const [fullName, setFullName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [about, setAbout] = useState(user?.about ?? '');
  const [pronouns, setPronouns] = useState(user?.pronouns ?? '');
  const [website, setWebsite] = useState(user?.website ?? '');
  const [username, setUsername] = useState(user?.username ?? user?.email ?? '');
  const [isOpenToMeet, setIsOpenToMeet] = useState<boolean>(user?.isOpenToMeet ?? true);

  const [demographics, setDemographics] = useState<string[]>(user?.demographics ?? []);
  const [traits, setTraits] = useState<string[]>(user?.traits ?? []);
  const [conversationTopics, setConversationTopics] = useState<string[]>(user?.conversationTopics ?? []);
  const [coffeePreferences, setCoffeePreferences] = useState<string[]>(user?.coffeePreferences ?? []);

  const [demographicsInput, setDemographicsInput] = useState('');
  const [traitsInput, setTraitsInput] = useState('');
  const [conversationTopicsInput, setConversationTopicsInput] = useState('');
  const [coffeePreferencesInput, setCoffeePreferencesInput] = useState('');

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert('Missing info', 'Please add your name to continue.');
      return;
    }

    try {
      setIsSaving(true);

      const payload = {
        name: fullName.trim(),
        email: email.trim(),
        about: about.trim(),
        pronouns: pronouns.trim(),
        website: website.trim(),
        isOpenToMeet,
        demographics,
        traits,
        conversationTopics,
        coffeePreferences,
        username: username.trim(),
      };

      const updated = await authService.updateProfile(payload);
      updateUser({ ...payload, ...updated });
      router.replace('/(tabs)');
    } catch (error: any) {
      updateUser({
        name: fullName.trim(),
        email: email.trim(),
        about: about.trim(),
        pronouns: pronouns.trim(),
        website: website.trim(),
        isOpenToMeet,
        demographics,
        traits,
        conversationTopics,
        coffeePreferences,
        username: username.trim(),
      });

      Alert.alert(
        'Saved locally',
        (error?.message || 'Could not sync with server.') +
          '\nYour profile is saved on this device.'
      );
      router.replace('/(tabs)');
    } finally {
      setIsSaving(false);
    }
  };

  const renderTagInput = (
    value: string,
    setValue: (v: string) => void,
    items: string[],
    setItems: (v: string[]) => void,
    placeholder: string
  ) => (
    <>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.inputFlex}
          placeholder={placeholder}
          value={value}
          onChangeText={setValue}
        />
        <TouchableOpacity
          style={styles.inlineAddBtn}
          onPress={() => {
            const trimmed = value.trim();
            if (!trimmed || items.includes(trimmed)) return;
            setItems([...items, trimmed]);
            setValue('');
          }}
        >
          <Ionicons name="checkmark" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      {items.length > 0 && (
        <View style={styles.tagsRow}>
          {items.map((item, idx) => (
            <View key={`${item}-${idx}`} style={styles.tag}>
              <Text style={styles.tagText}>{item}</Text>
            </View>
          ))}
        </View>
      )}
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Set up your profile</Text>
        </View>

        <View style={styles.profileSection}>
          <Avatar size={92} />
          <Text style={styles.greeting}>
            Welcome{user?.name ? `, ${user.name}` : ''}!
          </Text>
          <Text style={styles.subtitle}>
            A few details help us personalise your conversations.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Basic Info</Text>

          <Text style={styles.label}>Full Name</Text>
          <TextInput style={styles.input} value={fullName} onChangeText={setFullName} />

          <Text style={[styles.label, styles.mt]}>Email</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Here's what we know about you</Text>
          {renderTagInput(
            demographicsInput,
            setDemographicsInput,
            demographics,
            setDemographics,
            'Add detail'
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>About You</Text>
          <TextInput
            style={[styles.input, styles.multiline]}
            value={about}
            onChangeText={setAbout}
            multiline
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Your Traits</Text>
          {renderTagInput(traitsInput, setTraitsInput, traits, setTraits, 'Add trait')}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Conversation Topics</Text>
          {renderTagInput(
            conversationTopicsInput,
            setConversationTopicsInput,
            conversationTopics,
            setConversationTopics,
            'Add topic'
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Coffee Preferences</Text>
          {renderTagInput(
            coffeePreferencesInput,
            setCoffeePreferencesInput,
            coffeePreferences,
            setCoffeePreferences,
            'Add preference'
          )}
        </View>

        <View style={styles.cardRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>Open to Meet</Text>
            <Text style={styles.subText}>
              Let others know if you're open to meeting.
            </Text>
          </View>
          <Switch value={isOpenToMeet} onValueChange={setIsOpenToMeet} />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Website</Text>
          <TextInput style={styles.input} value={website} onChangeText={setWebsite} />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Pronouns</Text>
          <TextInput style={styles.input} value={pronouns} onChangeText={setPronouns} />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Username</Text>
          <TextInput style={styles.input} value={username} onChangeText={setUsername} />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.primaryButton, isSaving && styles.disabled]}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryButtonText}>Save & Continue</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.replace('/(tabs)')} disabled={isSaving}>
          <Text style={styles.secondaryText}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  scrollContent: { padding: 16, paddingBottom: 140 },

  header: { alignItems: 'center', marginBottom: 12 },
  headerTitle: { fontSize: 20, fontWeight: '700' },

  profileSection: { alignItems: 'center', marginBottom: 20 },
  greeting: { marginTop: 12, fontSize: 18, fontWeight: '600' },
  subtitle: { marginTop: 6, fontSize: 13, color: '#666', textAlign: 'center' },

  card: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
  },

  sectionTitle: { fontSize: 15, fontWeight: '600', marginBottom: 8 },
  subText: { fontSize: 13, color: '#777' },

  label: { fontSize: 13, color: '#555', marginBottom: 4 },
  mt: { marginTop: 10 },

  input: {
    borderWidth: 1,
    borderColor: '#E5E6EA',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#F8F8FA',
  },
  inputFlex: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E6EA',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#F8F8FA',
  },
  multiline: {
    minHeight: 72,
    textAlignVertical: 'top',
  },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  inlineAddBtn: {
    backgroundColor: '#7C4DFF',
    borderRadius: 10,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
  },
  tag: {
    backgroundColor: '#F2F2F2',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 6,
    marginBottom: 6,
  },
  tagText: { fontSize: 13 },

  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  primaryButton: {
    backgroundColor: '#7C4DFF',
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  secondaryText: {
    marginTop: 10,
    textAlign: 'center',
    color: '#7C4DFF',
    fontSize: 14,
    fontWeight: '600',
  },
  disabled: { opacity: 0.7 },
});
