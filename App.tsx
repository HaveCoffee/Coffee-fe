// App.tsx
import { NavigationContainer } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import AppNavigator from './navigation/AppNavigator';

// Keep the native splash screen visible while we load resources
SplashScreen.preventAutoHideAsync().catch(() => {});

function SplashManager() {
  const { isLoading } = useAuth();

  useEffect(() => {
    // When auth loading finishes, hide the splash screen
    if (!isLoading) {
      const hide = async () => {
        try {
          await SplashScreen.hideAsync();
        } catch (e) {
          console.warn('Failed to hide splash screen', e);
        }
      };
      hide();
    }
  }, [isLoading]);

  return null;
}

export default function App() {
  return (
    <NavigationContainer>
      <SafeAreaProvider>
        <AuthProvider>
          <SplashManager />
          <ChatProvider>
            <AppNavigator />
          </ChatProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </NavigationContainer>
  );
}