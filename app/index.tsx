import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/(auth)'); // Redirect to auth screen after logout
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  // Add header right button for logout
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="#7C4DFF" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        <Text style={styles.welcomeText}>
          Welcome {user?.name || 'User'}!
        </Text>
        <Text style={styles.subtitle}>This is your home screen</Text>
      </View>
      <TouchableOpacity style={styles.fab}>
        <Ionicons name="chatbubble-ellipses-outline" size={24} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2F2F2F',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  logoutButton: {
    marginRight: 15,
    padding: 5,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#7C4DFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
});