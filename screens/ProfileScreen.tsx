// screens/ProfileScreen.tsx
import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AuthContext } from '../context/AuthContext';

export default function ProfileScreen() {
  const { user, signOut } = useContext(AuthContext);

  return (
    <View style={styles.container}>
      <View style={styles.profileHeader}>
        <Text style={styles.welcome}>Welcome, {user?.name || 'User'}</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  welcome: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    padding: 10,
    borderRadius: 8,
  },
  logoutText: {
    color: 'white',
    fontWeight: '600',
  },
});