// In otp-verification.tsx
import { Ionicons } from '@expo/vector-icons';
import { Link, router, useLocalSearchParams } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AUTH_TOKEN_KEY } from '../../constants/auth';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { coffeeMlService } from '../../services/coffeeMlService';

export default function OTPVerification() {
  const { mobileNumber, flow, verificationId: verificationIdParam, fullName, email } = useLocalSearchParams();
  const { login } = useAuth();

  const [otp, setOtp] = useState(['', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [verificationId, setVerificationId] = useState<string | null>(() => {
    if (!verificationIdParam) return null;
    return Array.isArray(verificationIdParam)
      ? verificationIdParam[0]
      : (verificationIdParam as string);
  });
  const inputRefs = useRef<Array<TextInput | null>>([]);

  // Countdown timer for resend OTP
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => {
      if (interval !== undefined) {
        clearInterval(interval);
      }
    };
  }, [timer]);

  // Check if user profile is complete
  const checkProfileComplete = async (): Promise<boolean> => {
    try {
      const profile = await coffeeMlService.getOwnProfile();
      // Profile is complete if it has profile_data with meaningful content
      if (!profile?.profile_data) {
        return false;
      }

      const hasVibeSummary = !!profile.profile_data.vibe_summary;
      const hasInterests = Array.isArray(profile.profile_data.interests) &&
        profile.profile_data.interests.length > 0;

      return hasVibeSummary || hasInterests;
    } catch (error: any) {
      // If profile doesn't exist or endpoint fails, assume incomplete
      console.log('Profile check failed, assuming incomplete:', error);
      return false;
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 4) {
      setErrorMessage('Please enter a valid 4-digit OTP');
      return;
    }

    setErrorMessage(null);

    try {
      setIsLoading(true);
      let response;

      if (!verificationId) {
        throw new Error('Your verification session has expired. Please request a new OTP.');
      }

      if (!mobileNumber) {
        throw new Error('Missing mobile number. Please go back and start again.');
      }

      if (flow === 'signup') {
        response = await authService.signupVerify(mobileNumber as string, verificationId, otpString);
      } else {
        response = await authService.loginVerify(mobileNumber as string, verificationId, otpString);
      }

      const token = response.token;

      if (token) {
        // Token is already stored by authService, but keep this for backward compatibility
        await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
      } else if (flow === 'signup') {
        // Signup verify may not return a token - user needs to login
        // But according to API flow, we should have token. Try to proceed anyway.
        console.warn('[AUTH] No token returned from signup verify - proceeding anyway');
      } else {
        // Login must return a token
        throw new Error('No token received from server');
      }

      // Update user context based on backend response and navigation params
      const userPayload = {
        user_id: (response.user_id || response.id || mobileNumber) as string,
        name: (response.name || response.full_name || fullName || '') as string,
        email: (response.email || email || '') as string,
        mobile_number: (response.mobile_number || mobileNumber) as string,
      };

      await login(userPayload);

      // Check if profile is complete (only if we have a token)
      if (token) {
        try {
          const isProfileComplete = await checkProfileComplete();

          // Navigate based on profile completion status
          if (isProfileComplete) {
            router.replace('/(tabs)');
          } else {
            // Navigate to onboarding chat for new users or users with incomplete profiles
            router.replace('/ella-chat?onboarding=true');
          }
        } catch (error) {
          // If profile check fails, assume incomplete and go to onboarding
          console.error('Profile check failed, proceeding to onboarding:', error);
          router.replace('/ella-chat?onboarding=true');
        }
      } else {
        // No token - go to onboarding (will handle auth errors there)
        router.replace('/ella-chat?onboarding=true');
      }
    } catch (error: any) {
      const errorMsg = error.message || 'Verification failed';
      setErrorMessage(errorMsg);

      const lower = errorMsg.toLowerCase();

      // Align with VerifyNow-mapped messages while keeping backwards compatibility
      if (
        lower.includes('invalid or incorrect otp') ||
        lower.includes('invalid or expired otp') ||
        lower.includes('otp has expired')
      ) {
        Alert.alert(
          'Invalid OTP',
          'The OTP you entered is incorrect or has expired. Please try again or request a new one.',
          [
            { text: 'OK' },
            {
              text: 'Resend OTP',
              onPress: handleResendOTP,
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
          'Something was wrong with the verification request. Please go back and try again.',
        );
      } else if (lower.includes('invalid password')) {
        // After an invalid password, backend expires the OTP; user must request a new one
        Alert.alert(
          'Invalid password',
          'The password you entered is incorrect. Please request a new OTP and try again.',
          [
            { text: 'OK' },
            {
              text: 'Resend OTP',
              onPress: handleResendOTP,
            },
          ],
        );
      } else if (lower.includes('login failed')) {
        // Legacy Twilio-style error when verification session is no longer valid
        Alert.alert(
          'Login session expired',
          'Your login session has expired. Please request a new OTP to continue.',
          [
            { text: 'OK' },
            {
              text: 'Resend OTP',
              onPress: handleResendOTP,
            },
          ],
        );
      } else {
        Alert.alert('Error', errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend && timer > 0) return;

    try {
      setIsLoading(true);
      setErrorMessage(null);
      if (!mobileNumber) {
        throw new Error('Missing mobile number. Please go back and start again.');
      }

      let response;
      if (flow === 'signup') {
        response = await authService.signupInit(mobileNumber as string);
      } else {
        response = await authService.loginInit(mobileNumber as string);
      }

      if (!response || !response.verificationId) {
        throw new Error('Failed to resend OTP. Please try again.');
      }

      setVerificationId(response.verificationId);
      setTimer(30);
      setCanResend(false);
setOtp(['', '', '', '']); // Clear OTP inputs
      inputRefs.current[0]?.focus(); // Focus first input
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

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoWrap}>
          <View style={styles.logoCircle}>
            <Ionicons name="cafe" size={36} color="#fff" />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Enter OTP</Text>
          <Text style={styles.subtitle}>We sent a 6-digit code to {mobileNumber}</Text>

          <View style={styles.otpContainer}>
            {[...Array(4)].map((_, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  inputRefs.current[index] = ref;
                }}
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

          {errorMessage && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.verifyButton, isLoading && styles.buttonDisabled]}
            onPress={handleVerify}
            disabled={isLoading}
            activeOpacity={0.9}
          >
            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.verifyButtonText}>Verify</Text>}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Didn't receive code?</Text>
            <TouchableOpacity onPress={handleResendOTP} disabled={!canResend && timer > 0}>
              <Text style={[styles.resendText, (!canResend && timer > 0) && styles.resendTextDisabled]}>
                {canResend || timer === 0 ? ' Resend' : ` Resend in ${timer}s`}
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
      </ScrollView>
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
  },
  scrollContent: {
    padding: 20,
    justifyContent: 'center',
    flexGrow: 1,
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
  errorContainer: {
    backgroundColor: '#fee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  errorText: {
    color: '#c33',
    fontSize: 14,
    textAlign: 'center',
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