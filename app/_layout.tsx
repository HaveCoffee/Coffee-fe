import { useColorScheme } from '@/hooks/use-color-scheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { router, Stack, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';
import { AuthProvider, useAuth } from '../context/AuthContext';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
}

function AppContent() {
  const { token, isLoading } = useAuth();
  const segments = useSegments();
  const hasNavigatedRef = useRef(false);

  // Reset navigation to home tab when app loads with valid token
  useEffect(() => {
    if (!isLoading && token && !hasNavigatedRef.current) {
      // Small delay to ensure navigation is ready
      const timer = setTimeout(() => {
        try {
          // Check current route
          const currentRoute = segments[0];
          
          // If we're not on the tabs route, navigate to home tab
          // This ensures we always start at home on app reload
          if (currentRoute !== '(tabs)') {
            router.replace('/(tabs)');
          }
          hasNavigatedRef.current = true;
        } catch (error) {
          console.warn('Navigation reset failed:', error);
        }
      }, 150);
      
      return () => clearTimeout(timer);
    }
  }, [token, isLoading, segments]);

  // Reset the ref when token changes (logout/login)
  useEffect(() => {
    if (!token) {
      hasNavigatedRef.current = false;
    }
  }, [token]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#7C4DFF" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{
      headerStyle: {
        backgroundColor: '#fff',
      },
      headerTintColor: '#000',
      headerTitleStyle: {
        fontWeight: '600',
      },
      headerShadowVisible: false,
    }}>
      {!token ? (
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      ) : (
        <>
          <Stack.Screen 
            name="(tabs)" 
            options={{ 
              headerShown: false,
            }} 
          />
          <Stack.Screen 
            name="(chat)" 
            options={{ 
              headerShown: false,
            }} 
          />
          <Stack.Screen 
            name="modal" 
            options={{ 
              presentation: 'modal',
              headerShown: false,
            }} 
          />
        </>
      )}
    </Stack>
  );
}