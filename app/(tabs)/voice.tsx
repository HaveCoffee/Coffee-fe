import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { View } from 'react-native';

export default function VoiceTab() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to Ella chat when voice tab is accessed
    router.replace('/ella-chat');
  }, []);

  return <View />;
}
