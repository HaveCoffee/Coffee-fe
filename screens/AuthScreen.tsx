// screens/AuthScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function AuthScreen() {
  const { signIn } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to ELLA</Text>
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => signIn('user@example.com', 'password')}
      >
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#FF9500',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});