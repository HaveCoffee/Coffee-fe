// components/ConnectionStatus.tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useWebSocketContext } from '../context/WebSocketContext';

interface ConnectionStatusProps {
  showText?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ 
  showText = false, 
  size = 'small' 
}) => {
  const { isConnected, connectionState } = useWebSocketContext();

  const getStatusColor = () => {
    if (isConnected) return '#4CAF50'; // Green
    if (connectionState === 'connecting') return '#FF9800'; // Orange
    return '#F44336'; // Red
  };

  const getStatusText = () => {
    if (isConnected) return 'Connected';
    if (connectionState === 'connecting') return 'Connecting...';
    return 'Offline';
  };

  const getIconSize = () => {
    switch (size) {
      case 'small': return 12;
      case 'medium': return 16;
      case 'large': return 20;
      default: return 12;
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'small': return 10;
      case 'medium': return 12;
      case 'large': return 14;
      default: return 10;
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.indicator, { backgroundColor: getStatusColor() }]}>
        <Ionicons 
          name={isConnected ? 'wifi' : 'wifi-outline'} 
          size={getIconSize()} 
          color="white" 
        />
      </View>
      {showText && (
        <Text style={[styles.statusText, { fontSize: getTextSize(), color: getStatusColor() }]}>
          {getStatusText()}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  indicator: {
    borderRadius: 10,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    marginLeft: 6,
    fontWeight: '500',
  },
});