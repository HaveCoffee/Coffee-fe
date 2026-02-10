// components/APITestButton.tsx
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { apiTester } from '../utils/apiTester';

export default function APITestButton() {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const runTests = async () => {
    try {
      setTesting(true);
      console.log('🧪 Starting API tests...');
      
      const testResults = await apiTester.testAllEndpoints();
      setResults(testResults);
      
      const failed = testResults.filter(r => r.status !== 'PASS');
      const passed = testResults.filter(r => r.status === 'PASS');
      
      Alert.alert(
        'API Test Results',
        `✅ Passed: ${passed.length}\n❌ Failed: ${failed.length}\n\nCheck console for detailed results.`,
        [{ text: 'OK' }]
      );
      
    } catch (error: any) {
      console.error('❌ API testing failed:', error);
      Alert.alert('Test Error', error.message);
    } finally {
      setTesting(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[styles.button, testing && styles.buttonDisabled]} 
        onPress={runTests}
        disabled={testing}
      >
        <Text style={styles.buttonText}>
          {testing ? '🧪 Testing APIs...' : '🧪 Test All APIs'}
        </Text>
      </TouchableOpacity>
      
      {results.length > 0 && (
        <View style={styles.results}>
          <Text style={styles.resultsTitle}>Last Test Results:</Text>
          {results.map((result, index) => (
            <Text key={index} style={[
              styles.resultItem,
              result.status === 'PASS' ? styles.pass : styles.fail
            ]}>
              {result.status === 'PASS' ? '✅' : '❌'} {result.method} {result.endpoint}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  button: {
    backgroundColor: '#7C4DFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  results: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  resultItem: {
    fontSize: 12,
    marginBottom: 4,
  },
  pass: {
    color: '#4CAF50',
  },
  fail: {
    color: '#F44336',
  },
});