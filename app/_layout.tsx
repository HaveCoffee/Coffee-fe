import { useColorScheme } from '@/hooks/use-color-scheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
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