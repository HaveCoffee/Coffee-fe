import { Ionicons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authService } from '../../services/authService';

export default function SignUpScreen() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobileNumber: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSignUp = async () => {
    if (!formData.mobileNumber) {
      Alert.alert('Error', 'Please enter your mobile number');
      return;
    }

    try {
      setIsLoading(true);
      const response = await authService.signupInit(formData.mobileNumber);
      
      if (!response || !response.verificationId) {
        throw new Error('Failed to initiate OTP verification. Please try again.');
      }
      
      router.push({
        pathname: '/otp-verification',
        params: { 
          fullName: formData.fullName,
          email: formData.email,
          mobileNumber: formData.mobileNumber,
          flow: 'signup',
          verificationId: response.verificationId,
        }
      });
    } catch (error: any) {
      if (error.message.includes('USER_ALREADY_EXISTS')) {
        Alert.alert('Account Exists', 'User already exists. Please login.', [
          { text: 'OK', onPress: () => router.push('/login') }
        ]);
      } else {
        Alert.alert('Error', error.message || 'Failed to sign up');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = formData.mobileNumber.length === 10;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Create Account</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Ionicons name="person-add" size={48} color="#FFFFFF" />
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={formData.fullName}
              onChangeText={(text) => handleInputChange('fullName', text)}
              placeholderTextColor="#9CA3AF"
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              keyboardType="email-address"
              value={formData.email}
              onChangeText={(text) => handleInputChange('email', text)}
              placeholderTextColor="#9CA3AF"
              editable={!isLoading}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.phoneInput}>
            <Text style={styles.countryCode}>+91</Text>
            <TextInput
              style={styles.phoneInputField}
              placeholder="Mobile Number"
              keyboardType="phone-pad"
              value={formData.mobileNumber}
              onChangeText={(text) => handleInputChange('mobileNumber', text.replace(/[^0-9]/g, ''))}
              maxLength={10}
              placeholderTextColor="#9CA3AF"
              editable={!isLoading}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, !isFormValid && styles.buttonDisabled]}
          onPress={handleSignUp}
          disabled={isLoading || !isFormValid}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Sign Up</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account?</Text>
        <Link href="/login" style={styles.link}>Sign In</Link>
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
    marginBottom: 48,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputWrapper: {
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    paddingHorizontal: 12,
    height: 56,
    borderWidth: 2,
    borderColor: 'rgba(86, 93, 109, 0.2)',
    fontSize: 18,
    fontWeight: '400',
    color: '#565D6D',
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
  phoneInputField: {
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