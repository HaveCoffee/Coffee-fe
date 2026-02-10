import { Ionicons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';

export default function LoginScreen() {
  const [mobileNumber, setMobileNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

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
      
      if (!response || !response.verificationId) {
        throw new Error('Invalid response from OTP service');
      }
      
      router.push({
        pathname: '/otp-verification',
        params: { 
          mobileNumber,
          flow: 'login',
          verificationId: response.verificationId,
        }
      });
    } catch (error: any) {
      console.error('OTP Request Error:', error);
      const errorMessage = error?.message || 'Failed to send OTP';
      const lower = errorMessage.toLowerCase();

      if (lower.includes('user not registered') || lower.includes('user not found')) {
        Alert.alert(
          'Account Not Found',
          'No account found with this number. Would you like to sign up?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Sign Up',
              onPress: () => router.push('/signup'),
            },
          ],
        );
      } else if (lower.includes('verification service is temporarily unavailable')) {
        Alert.alert(
          'Service unavailable',
          'Our verification service is temporarily unavailable. Please try again in a few minutes.',
        );
      } else if (lower.includes('invalid request')) {
        Alert.alert(
          'Invalid request',
          'The OTP request was invalid. Please check your mobile number and try again.',
        );
      } else if (lower.includes('network request failed') || lower.includes('network error')) {
        Alert.alert(
          'Connection Error',
          'Unable to connect to the server. Please check your internet connection and try again.',
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
      <View style={styles.header}>
        <Text style={styles.title}>Hello there!</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Ionicons name="cafe" size={48} color="#FFFFFF" />
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.phoneInput}>
            <Text style={styles.countryCode}>+91</Text>
            <TextInput
              style={styles.input}
              placeholder="Mobile Number"
              keyboardType="phone-pad"
              placeholderTextColor="#9CA3AF"
              value={mobileNumber}
              onChangeText={(text) => setMobileNumber(text.replace(/[^0-9]/g, ''))}
              maxLength={10}
              editable={!isLoading}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, (!mobileNumber || mobileNumber.length !== 10) && styles.buttonDisabled]}
          onPress={handleGetOTP}
          disabled={isLoading || !mobileNumber || mobileNumber.length !== 10}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Get OTP</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Don't have an account?</Text>
        <Link href="/signup" style={styles.link}>Sign Up</Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#9D85FF',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 72,
  },
  inputContainer: {
    marginBottom: 16,
  },
  phoneInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    paddingHorizontal: 12,
    height: 56,
    borderWidth: 2,
    borderColor: 'rgba(86, 93, 109, 0.2)',
  },
  countryCode: {
    fontSize: 18,
    fontWeight: '400',
    color: '#565D6D',
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 18,
    fontWeight: '400',
    color: '#565D6D',
  },
  button: {
    backgroundColor: '#9D85FF',
    borderRadius: 16,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#171a1f',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 28,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
  },
  footerText: {
    color: '#6B7280',
    fontSize: 16,
  },
  link: {
    color: '#9D85FF',
    fontSize: 16,
    fontWeight: '600',
  },
});