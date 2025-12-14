// In otp-verification.tsx
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Link, useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect, useRef } from 'react';
import { authService } from '../../services/authService';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';

export default function OTPVerification() {
  const { mobileNumber, flow } = useLocalSearchParams();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  // Countdown timer for resend OTP
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleVerify = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }

    try {
      setIsLoading(true);
      let response;
      
      if (flow === 'signup') {
        // For signup, we'll use a default empty password since it's required by the API
        response = await authService.signupVerify(mobileNumber as string, otpString, '');
      } else {
        // For login, we can pass an empty password since we're not using it
        response = await authService.loginVerify(mobileNumber as string, otpString, '');
      }

      if (response.token) {
        await SecureStore.setItemAsync('authToken', response.token);
        // Navigate to home screen on successful verification
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;

    try {
      setIsLoading(true);
      if (flow === 'signup') {
        await authService.signupInit(mobileNumber as string);
      } else {
        await authService.loginInit(mobileNumber as string);
      }
      setTimer(30);
      setCanResend(false);
      Alert.alert('Success', 'OTP has been resent');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (text: string, index: number) => {
    const sanitized = text.replace(/[^0-9]/g, '');
    const newOtp = [...otp];
    newOtp[index] = sanitized;
    setOtp(newOtp);

    if (sanitized && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.decorTop} />
      <View style={styles.decorBottom} />

      <View style={styles.content}>
        <View style={styles.logoWrap}>
          <View style={styles.logoCircle}>
            <Ionicons name="cafe" size={36} color="#fff" />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Enter OTP</Text>
          <Text style={styles.subtitle}>We sent a 6-digit code to {mobileNumber}</Text>

          <View style={styles.otpContainer}>
            {[...Array(6)].map((_, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputRefs.current[index] = ref)}
                style={styles.otpInput}
                keyboardType="number-pad"
                maxLength={1}
                value={otp[index]}
                onChangeText={(text) => handleOtpChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                editable={!isLoading}
              />
            ))}
          </View>

          <TouchableOpacity
            style={[styles.verifyButton, isLoading && styles.buttonDisabled]}
            onPress={handleVerify}
            disabled={isLoading}
            activeOpacity={0.9}
          >
            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.verifyButtonText}>Verify OTP</Text>}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Didn't receive code?</Text>
            <TouchableOpacity onPress={handleResendOTP} disabled={!canResend}>
              <Text style={[styles.resendText, !canResend && styles.resendTextDisabled]}>
                {canResend ? ' Resend' : ` Resend in ${timer}s`}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.loginLink}>
            <Text style={styles.footerText}>
              {flow === 'signup' ? 'Already have an account?' : "Don't have an account?"}
            </Text>
            <Link href={flow === 'signup' ? '/login' : '/signup'} style={styles.linkText}>
              {' '}
              {flow === 'signup' ? 'Log In' : 'Sign Up'}
            </Link>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  decorTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    backgroundColor: '#6B46C1',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  decorBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
    backgroundColor: '#F0F4FF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  logoWrap: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#6B46C1',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  otpInput: {
    width: 45,
    height: 45,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    backgroundColor: '#f9f9f9',
  },
  verifyButton: {
    backgroundColor: '#6B46C1',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  footerText: {
    color: '#666',
  },
  resendText: {
    color: '#6B46C1',
    fontWeight: 'bold',
  },
  resendTextDisabled: {
    color: '#999',
  },
  loginLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  linkText: {
    color: '#6B46C1',
    fontWeight: 'bold',
    marginLeft: 5,
  },
});