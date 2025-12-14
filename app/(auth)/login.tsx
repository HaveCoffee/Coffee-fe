import { Ionicons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authService } from '../../services/authService';

export default function LoginScreen() {
  const [mobileNumber, setMobileNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGetOTP = async () => {
    if (!mobileNumber) {
      Alert.alert('Error', 'Please enter your mobile number');
      return;
    }

    if (mobileNumber.length !== 10) {
      Alert.alert('Error', 'Please enter a valid 10-digit mobile number');
      return;
    }

    try {
      setIsLoading(true);
      console.log('Sending OTP to:', mobileNumber);
      
      const response = await authService.loginInit(mobileNumber);
      console.log('OTP API Response:', response);
      
      if (!response || !response.user_id) {
        throw new Error('Invalid response from server');
      }
      
      // Navigate to OTP screen with mobile number
      router.push({
        pathname: '/otp-verification',
        params: { 
          mobileNumber,
          flow: 'login',
          userId: response.user_id 
        }
      });
    } catch (error: any) {
      console.error('OTP Request Error:', error);
      const errorMessage = error?.message || 'Failed to send OTP';
      
      if (errorMessage.toLowerCase().includes('user not found')) {
        Alert.alert(
          'Account Not Found',
          'No account found with this number. Would you like to sign up?',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Sign Up', 
              onPress: () => router.push('/signup') 
            }
          ]
        );
      } else if (errorMessage.toLowerCase().includes('network request failed')) {
        Alert.alert(
          'Connection Error',
          'Unable to connect to the server. Please check your internet connection and try again.'
        );
      } else {
        Alert.alert('Error', `Could not send OTP: ${errorMessage}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Hello there!</Text>

        <View style={styles.heroIcon}>
          <View style={styles.iconCircle}>
            <Ionicons name="cafe" size={42} color="#fff" />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Mobile Number</Text>
          <View style={styles.phoneInput}>
            <Text style={styles.countryCode}>+91</Text>
            <TextInput
              style={styles.input}
              placeholder="Mobile Number"
              keyboardType="phone-pad"
              placeholderTextColor="#9A9A9A"
              value={mobileNumber}
              onChangeText={(text) => setMobileNumber(text.replace(/[^0-9]/g, ''))}
              maxLength={10}
              editable={!isLoading}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleGetOTP}
            disabled={isLoading}
            activeOpacity={0.9}
          >
            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Get OTP</Text>}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account?</Text>
          <Link href="/signup" style={styles.link}>
            {' '}
            Sign Up
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 22,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 32,
    color: '#1E1E1E',
  },
  heroIcon: {
    alignItems: 'center',
    marginBottom: 28,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#7C4DFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7C4DFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
    color: '#2E2E2E',
  },
  phoneInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F8',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 56,
    borderWidth: 1,
    borderColor: '#E5E6EA',
  },
  countryCode: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E1E1E',
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#1E1E1E',
  },
  button: {
    marginTop: 18,
    backgroundColor: '#7C4DFF',
    borderRadius: 14,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7C4DFF',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: '#B8A5FF',
    shadowOpacity: 0.1,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    color: '#6C6C6C',
    fontSize: 15,
  },
  link: {
    color: '#7C4DFF',
    fontSize: 15,
    fontWeight: '700',
  },
});