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
      
      // Navigate to OTP screen with form data and verificationId
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Create Account</Text>

        <View style={styles.heroIcon}>
          <View style={styles.iconCircle}>
            <Ionicons name="person-add" size={42} color="#fff" />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={formData.fullName}
            onChangeText={(text) => handleInputChange('fullName', text)}
            placeholderTextColor="#9A9A9A"
            editable={!isLoading}
          />

          <Text style={[styles.label, styles.labelSpacing]}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Email"
            keyboardType="email-address"
            value={formData.email}
            onChangeText={(text) => handleInputChange('email', text)}
            placeholderTextColor="#9A9A9A"
            editable={!isLoading}
            autoCapitalize="none"
          />

          <Text style={[styles.label, styles.labelSpacing]}>Mobile Number</Text>
          <View style={styles.phoneInput}>
            <Text style={styles.countryCode}>+91</Text>
            <TextInput
              style={styles.phoneInputField}
              placeholder="Mobile Number"
              keyboardType="phone-pad"
              value={formData.mobileNumber}
              onChangeText={(text) => handleInputChange('mobileNumber', text.replace(/[^0-9]/g, ''))}
              maxLength={10}
              placeholderTextColor="#9A9A9A"
              editable={!isLoading}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleSignUp}
            disabled={isLoading}
            activeOpacity={0.9}
          >
            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign Up</Text>}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <Link href="/login" style={styles.link}>
            {' '}
            Sign In
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
  labelSpacing: {
    marginTop: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E6EA',
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    color: '#1E1E1E',
    height: 52,
    backgroundColor: '#F5F5F8',
  },
  phoneInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E6EA',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
    backgroundColor: '#F5F5F8',
  },
  countryCode: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E1E1E',
    marginRight: 10,
  },
  phoneInputField: {
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