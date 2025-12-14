import React from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

export default function DiscoverScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Discover</Text>
        <Text style={styles.subtitle}>Find interesting people nearby</Text>
        {/* Discovery content will go here */}
      </View>
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
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: 'gray',
    marginBottom: 20,
  },
});
