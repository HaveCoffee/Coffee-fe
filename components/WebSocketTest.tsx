// components/WebSocketTest.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useWebSocketContext } from '../context/WebSocketContext';

export const WebSocketTest: React.FC = () => {
  const { isConnected, connectionState, connect, disconnect, sendMessage, joinChat, on, off } = useWebSocketContext();
  const [messages, setMessages] = useState<string[]>([]);
  const [testResults, setTestResults] = useState<string[]>([]);

  useEffect(() => {
    const handleMessage = (data: any) => {
      const msg = `Received: ${JSON.stringify(data)}`;
      setMessages(prev => [...prev.slice(-4), msg]);
    };

    const handleConnected = () => {
      addTestResult('✅ WebSocket connected successfully');
    };

    const handleDisconnected = () => {
      addTestResult('❌ WebSocket disconnected');
    };

    const handleError = (data: any) => {
      addTestResult(`❌ WebSocket error: ${data.error || 'Unknown error'}`);
    };

    on('message', handleMessage);
    on('connected', handleConnected);
    on('disconnected', handleDisconnected);
    on('error', handleError);

    return () => {
      off('message', handleMessage);
      off('connected', handleConnected);
      off('disconnected', handleDisconnected);
      off('error', handleError);
    };
  }, [on, off]);

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev.slice(-4), `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testConnection = () => {
    addTestResult('🔄 Testing Socket.IO connection...');
    connect();
  };

  const testSendMessage = () => {
    if (!isConnected) {
      Alert.alert('Error', 'Socket.IO not connected');
      return;
    }
    
    const success = sendMessage('test-user', 'Hello from Socket.IO test!');
    addTestResult(success ? '✅ Test message sent via Socket.IO' : '❌ Failed to send test message');
  };

  const clearLogs = () => {
    setMessages([]);
    setTestResults([]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Socket.IO Test</Text>
      
      <View style={styles.statusContainer}>
        <Text style={styles.statusLabel}>Status:</Text>
        <Text style={[styles.status, { color: isConnected ? '#4CAF50' : '#F44336' }]}>
          {connectionState} {isConnected ? '🟢' : '🔴'}
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={testConnection}>
          <Text style={styles.buttonText}>Test Connect</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={testSendMessage}>
          <Text style={styles.buttonText}>Send Test Message</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={() => {
          const success = joinChat('test-chat-123');
          addTestResult(success ? '✅ Joined test chat' : '❌ Failed to join chat');
        }}>
          <Text style={styles.buttonText}>Join Test Chat</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={() => {
          const success1 = sendMessage('9589074989', 'Hello from app test!');
          const success2 = sendMessage('7007313725', 'Hi there from app!');
          addTestResult(success1 && success2 ? '✅ Messages sent to both users' : '❌ Failed to send messages');
        }}>
          <Text style={styles.buttonText}>Test User Chat</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={disconnect}>
          <Text style={styles.buttonText}>Disconnect</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, styles.clearButton]} onPress={clearLogs}>
          <Text style={styles.buttonText}>Clear Logs</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.logsContainer}>
        <Text style={styles.logsTitle}>Test Results:</Text>
        {testResults.map((result, index) => (
          <Text key={index} style={styles.logText}>{result}</Text>
        ))}
      </View>

      <View style={styles.logsContainer}>
        <Text style={styles.logsTitle}>Messages:</Text>
        {messages.map((message, index) => (
          <Text key={index} style={styles.logText}>{message}</Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    margin: 16,
    borderRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  status: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 80,
  },
  clearButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  logsContainer: {
    marginBottom: 16,
  },
  logsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  logText: {
    fontSize: 12,
    fontFamily: 'monospace',
    backgroundColor: '#fff',
    padding: 4,
    marginBottom: 2,
    borderRadius: 4,
  },
});