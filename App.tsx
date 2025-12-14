// App.tsx
import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ChatProvider } from './context/ChatProvider';
import { AuthProvider } from './context/AuthContext';
import AppNavigator from './navigation/AppNavigator';

export default function App() {
  return (
    <NavigationContainer>
      <SafeAreaProvider>
        <AuthProvider>
          <ChatProvider>
            <AppNavigator />
          </ChatProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </NavigationContainer>
  );
}