// screens/OtpVerificationScreen.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Keyboard,
  Platform,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';

type OtpVerificationScreenRouteProp = RouteProp<RootStackParamList, 'OtpVerification'>;
type OtpVerificationScreenNavigationProp = StackNavigationProp<RootStackParamList, 'OtpVerification'>;

export default function OtpVerificationScreen() {
  const route = useRoute<OtpVerificationScreenRouteProp>();
  const navigation = useNavigation<OtpVerificationScreenNavigationProp>();
  const { phoneNumber } = route.params;
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendEnabled, setResendEnabled] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const otpInputs = useRef<Array<TextInput | null>>(Array(6).fill(null));

  useEffect(() => {
    // Start countdown timer
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setResendEnabled(true);
    }
  }, [countdown]);

  const handleOtpChange = (value: string, index: number) => {
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus to next input
    if (value && index < 5) {
      otpInputs.current[index + 1]?.focus();
    }

    // If all OTP digits are entered, verify
    if (newOtp.every(digit => digit !== '') && index === 5) {
      handleVerifyOtp();
    }
  };

  const handleVerifyOtp = () => {
    const otpCode = otp.join('');
    // In a real app, you would verify the OTP with your backend
    console.log('Verifying OTP:', otpCode);
    navigation.navigate('Main');
  };

  const handleResendOtp = () => {
    if (!resendEnabled) return;
    
    // Reset OTP fields
    setOtp(['', '', '', '', '', '']);
    setResendEnabled(false);
    setCountdown(30);
    
    // In a real app, you would request a new OTP
    console.log('Resending OTP to', phoneNumber);
  };

  const formatPhoneNumber = (phone: string) => {
    return `+91 ${phone.substring(0, 5)} ${phone.substring(5)}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.innerContainer}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Verify your number</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>Enter verification code</Text>
          <Text style={styles.subtitle}>
            We've sent a 6-digit code to {formatPhoneNumber(phoneNumber)}
          </Text>

          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={ref => (otpInputs.current[index] = ref)}
                style={[styles.otpInput, digit !== '' && styles.otpInputFilled]}
                keyboardType="number-pad"
                maxLength={1}
                value={digit}
                onChangeText={value => handleOtpChange(value, index)}
                onKeyPress={({ nativeEvent }) => {
                  if (nativeEvent.key === 'Backspace' && !digit && index > 0) {
                    otpInputs.current[index - 1]?.focus();
                  }
                }}
                selectionColor="#FF9500"
              />
            ))}
          </View>

          <TouchableOpacity 
            style={styles.resendButton}
            onPress={handleResendOtp}
            disabled={!resendEnabled}
          >
            <Text style={[styles.resendText, resendEnabled && styles.resendTextActive]}>
              {resendEnabled ? 'Resend code' : `Resend code in ${countdown}s`}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Having trouble receiving the code?</Text>
          <TouchableOpacity>
            <Text style={styles.helpLink}>Get help</Text>
          </TouchableOpacity>
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
  innerContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 32,
    color: '#FF9500',
    lineHeight: 36,
    marginTop: -4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  headerPlaceholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 48,
    textAlign: 'center',
    lineHeight: 24,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 32,
  },
  otpInput: {
    width: 48,
    height: 60,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 24,
    color: '#1A1A1A',
    backgroundColor: '#FAFAFA',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  otpInputFilled: {
    borderColor: '#FF9500',
    backgroundColor: '#FFF5E6',
  },
  resendButton: {
    marginTop: 16,
  },
  resendText: {
    color: '#999',
    fontSize: 14,
  },
  resendTextActive: {
    color: '#FF9500',
    fontWeight: '600',
  },
  footer: {
    padding: 24,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  footerText: {
    color: '#666',
    fontSize: 14,
    marginBottom: 8,
  },
  helpLink: {
    color: '#FF9500',
    fontSize: 14,
    fontWeight: '600',
  },
});