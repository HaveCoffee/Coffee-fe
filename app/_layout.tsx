import { useColorScheme } from '@/hooks/use-color-scheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { router, Stack, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { WebSocketProvider } from '../context/WebSocketContext';
import { NotificationProvider } from '../context/NotificationContext';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <WebSocketProvider>
        <NotificationProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
            <AppContent />
          </ThemeProvider>
        </NotificationProvider>
      </WebSocketProvider>
    </AuthProvider>
  );
}

function AppContent() {
  const { token, isLoading, hasCompletedOnboarding, checkOnboarding } = useAuth();
  const segments = useSegments();
  const hasNavigatedRef = useRef(false);

  // Check onboarding status and route accordingly when app loads with valid token
  useEffect(() => {
    if (!isLoading && token && !hasNavigatedRef.current) {
      const timer = setTimeout(async () => {
        try {
          console.log('🔍 [LAYOUT] Routing check:', { hasCompletedOnboarding, token: !!token });
          
          // Check if user has completed onboarding
          if (hasCompletedOnboarding === null) {
            // First time checking, trigger the check
            console.log('🔍 [LAYOUT] Triggering onboarding check...');
            await checkOnboarding();
            return; // Let the next effect handle routing
          }
          
          const currentRoute = segments[0];
          console.log('🔍 [LAYOUT] Current route:', currentRoute);
          
          if (hasCompletedOnboarding) {
            // Returning user with profile - go to main app
            console.log('✅ [LAYOUT] User has profile, routing to main app');
            if (currentRoute !== '(tabs)') {
              router.replace('/(tabs)');
            }
          } else {
            // New user without profile - show onboarding modal first
            console.log('⚠️ [LAYOUT] User needs onboarding, routing to onboarding modal');
            if (currentRoute !== 'modal') {
              router.replace('/modal?type=onboarding');
            }
          }
          
          hasNavigatedRef.current = true;
        } catch (error) {
          console.warn('Navigation routing failed:', error);
          // Fallback to main app on error
          router.replace('/(tabs)');
          hasNavigatedRef.current = true;
        }
      }, 150);
      
      return () => clearTimeout(timer);
    }
  }, [token, isLoading, hasCompletedOnboarding, segments, checkOnboarding]);

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
      headerShown: false,
    }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(chat)" />
      <Stack.Screen name="ella-chat" />
      <Stack.Screen 
        name="modal" 
        options={{ 
          presentation: 'modal',
        }} 
      />
      <Stack.Screen name="coffee-match" />
      <Stack.Screen name="profile-setup" />
      <Stack.Screen name="report-abuse" />
      <Stack.Screen name="new-chat" />
      <Stack.Screen name="index" />
    </Stack>
  );
}