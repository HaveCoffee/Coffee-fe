import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import OnboardingModal from '../components/OnboardingModal';

export default function ModalScreen() {
  const { type } = useLocalSearchParams();

  if (type === 'onboarding') {
    return (
      <OnboardingModal
        visible={true}
        onClose={() => router.replace('/(tabs)')}
        onStartOnboarding={() => {
          router.replace('/ella-chat?onboarding=true');
        }}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Modal</Text>
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.link}>Go back</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
    color: '#007AFF',
  },
});
