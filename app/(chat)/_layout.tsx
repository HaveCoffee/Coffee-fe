import { Stack } from 'expo-router';

export default function ChatLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'Messages',
          headerShown: false
        }} 
      />
      <Stack.Screen 
        name="[id]" 
        options={{ 
          title: 'Chat',
          headerBackTitle: 'Back'
        }} 
      />
    </Stack>
  );
}
