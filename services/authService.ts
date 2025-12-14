import { apiRequest } from '../utils/api';
import { mockAuthService } from './mockAuthService';

// Use mock service in development
const useMockService = __DEV__;

const withCountryCode = (mobileNumber: string) => {
  // Remove all non-numeric characters except leading +
  const cleaned = `${mobileNumber}`.replace(/[^0-9+]/g, '');
  
  // If already in E.164 format with country code, return as is
  if (cleaned.startsWith('+')) return cleaned;
  
  // If it starts with 91, add + prefix
  if (cleaned.startsWith('91') && cleaned.length > 10) {
    return `+${cleaned}`;
  }
  
  // Default: add +91 prefix and ensure no spaces
  return `+91${cleaned.replace(/^0+/, '')}`; // Remove any leading zeros
};

// Real implementation
const realAuthService = {
  async signupInit(mobileNumber: string) {
    try {
      const formattedNumber = withCountryCode(mobileNumber);
      console.log('[REAL] Attempting to send OTP to:', formattedNumber);
      
      const response = await apiRequest(
        '/auth/signup/init', 
        'POST', 
        { mobileNumber: formattedNumber }
      );
      
      console.log('OTP sent successfully to:', formattedNumber);
      return response;
    } catch (error: any) {
      console.error('Error in signupInit:', {
        error: error.message,
        status: error.status,
        response: error.response?.data,
        stack: error.stack
      });
      
      if (error.status === 500) {
        throw new Error('Failed to send OTP. Please try again later.');
      } else if (error.message.includes('unverified')) {
        throw new Error('This phone number is not verified in Twilio. Using mock service instead.');
      } else if (error.message.includes('rate limit')) {
        throw new Error('Too many attempts. Please try again in a few minutes.');
      }
      
      throw error;
    }
  },

  async signupVerify(mobileNumber: string, otp: string, password: string) {
    return apiRequest('/auth/signup/verify', 'POST', {
      mobileNumber: withCountryCode(mobileNumber),
      otp,
      password,
    });
  },

  async loginInit(mobileNumber: string) {
    return apiRequest('/auth/login/init', 'POST', { 
      mobileNumber: withCountryCode(mobileNumber) 
    });
  },

  async loginVerify(mobileNumber: string, otp: string, password: string) {
    return apiRequest('/auth/login/verify', 'POST', {
      mobileNumber: withCountryCode(mobileNumber),
      otp,
      password,
    });
  },

  async getProfile(token: string) {
    return apiRequest('/profile', 'GET', null, token);
  },
};

// Export the appropriate service based on environment
export const authService = useMockService 
  ? { 
      ...mockAuthService,
      // Add any additional methods from realAuthService that aren't in mockAuthService
      ...Object.keys(realAuthService).reduce((acc, key) => {
        if (!(key in mockAuthService)) {
          acc[key] = realAuthService[key];
        }
        return acc;
      }, {})
    }
  : realAuthService;

// Log which service is being used
console.log(`Using ${useMockService ? 'MOCK' : 'REAL'} authentication service`);

// For TypeScript type checking
export type AuthService = typeof authService;