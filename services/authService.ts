import * as SecureStore from 'expo-secure-store';
import { apiRequest, AUTH_API_BASE_URL } from '../utils/api';
import { mockAuthService } from './mockAuthService';

// Use mock service in development (set to false to use real API)
const useMockService = false;

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

// Real implementation based on API documentation
const realAuthService = {
  /**
   * Initialize signup - sends OTP to mobile number
   * POST /auth/signup/init
   */
  async signupInit(mobileNumber: string) {
    try {
      const formattedNumber = withCountryCode(mobileNumber);
      console.log('[AUTH] Signup init for:', formattedNumber);
      
      const response = await apiRequest(
        '/auth/signup/init', 
        'POST', 
        { mobileNumber: formattedNumber },
        null,
        AUTH_API_BASE_URL
      );
      
      console.log('Signup init response:', response);
      return response;
    } catch (error: any) {
      console.error('Error in signupInit:', error);
      
      // Handle specific error cases
      if (error.message?.includes('already exists') || error.message?.includes('USER_ALREADY_EXISTS')) {
        throw new Error('USER_ALREADY_EXISTS');
      } else if (error.message?.includes('rate limit') || error.message?.includes('too many')) {
        throw new Error('Too many attempts. Please try again in a few minutes.');
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        throw new Error('Network error. Please check your connection and try again.');
      }
      
      throw new Error(error.message || 'Failed to send OTP. Please try again.');
    }
  },

  /**
   * Verify signup OTP and complete registration
   * POST /auth/signup/verify
   */
  async signupVerify(mobileNumber: string, otp: string, password?: string) {
    try {
      const formattedNumber = withCountryCode(mobileNumber);
      console.log('[AUTH] Signup verify for:', formattedNumber);
      
      const response = await apiRequest(
        '/auth/signup/verify', 
        'POST', 
        { 
          mobileNumber: formattedNumber,
          otp,
          password: password || '', // Optional password
        },
        null,
        AUTH_API_BASE_URL
      );
      
      console.log('Signup verify response:', response);
      
      // Store token if provided
      if (response.token || response.access_token) {
        const token = response.token || response.access_token;
        await SecureStore.setItemAsync('authToken', token);
      }
      
      return response;
    } catch (error: any) {
      console.error('Error in signupVerify:', error);
      
      if (error.message?.includes('invalid') || error.message?.includes('expired')) {
        throw new Error('Invalid or expired OTP. Please request a new one.');
      } else if (error.message?.includes('network')) {
        throw new Error('Network error. Please check your connection and try again.');
      }
      
      throw new Error(error.message || 'Verification failed. Please try again.');
    }
  },

  /**
   * Initialize login - sends OTP to mobile number
   * POST /auth/login/init
   */
  async loginInit(mobileNumber: string) {
    try {
      const formattedNumber = withCountryCode(mobileNumber);
      console.log('[AUTH] Login init for:', formattedNumber);
      
      const response = await apiRequest(
        '/auth/login/init', 
        'POST', 
        { mobileNumber: formattedNumber },
        null,
        AUTH_API_BASE_URL
      );
      
      console.log('Login init response:', response);
      return response;
    } catch (error: any) {
      console.error('Error in loginInit:', error);
      
      if (error.message?.includes('not found') || error.message?.includes('does not exist')) {
        throw new Error('User not found. Please sign up first.');
      } else if (error.message?.includes('rate limit') || error.message?.includes('too many')) {
        throw new Error('Too many attempts. Please try again in a few minutes.');
      } else if (error.message?.includes('network')) {
        throw new Error('Network error. Please check your connection and try again.');
      }
      
      throw new Error(error.message || 'Failed to send OTP. Please try again.');
    }
  },

  /**
   * Verify login OTP
   * POST /auth/login/verify
   */
  async loginVerify(mobileNumber: string, otp: string, password?: string) {
    try {
      const formattedNumber = withCountryCode(mobileNumber);
      console.log('[AUTH] Login verify for:', formattedNumber);
      
      const response = await apiRequest(
        '/auth/login/verify', 
        'POST', 
        {
          mobileNumber: formattedNumber,
          otp,
          password: password || '', // Optional password
        },
        null,
        AUTH_API_BASE_URL
      );
      
      console.log('Login verify response:', response);
      
      // Store token if provided
      if (response.token || response.access_token) {
        const token = response.token || response.access_token;
        await SecureStore.setItemAsync('authToken', token);
      }
      
      return response;
    } catch (error: any) {
      console.error('Error in loginVerify:', error);
      
      if (error.message?.includes('invalid') || error.message?.includes('expired')) {
        throw new Error('Invalid or expired OTP. Please request a new one.');
      } else if (error.message?.includes('unauthorized') || error.message?.includes('credentials')) {
        throw new Error('Invalid credentials. Please try again.');
      } else if (error.message?.includes('network')) {
        throw new Error('Network error. Please check your connection and try again.');
      }
      
      throw new Error(error.message || 'Verification failed. Please try again.');
    }
  },

  /**
   * Get user profile
   * GET /auth/profile
   */
  async getProfile(token?: string) {
    try {
      const authToken = token || await getAuthToken();
      if (!authToken) {
        throw new Error('No authentication token available');
      }
      
      const response = await apiRequest(
        '/auth/profile', 
        'GET', 
        null, 
        authToken,
        AUTH_API_BASE_URL
      );
      
      return response;
    } catch (error: any) {
      console.error('Error in getProfile:', error);
      throw error;
    }
  },

  /**
   * Refresh authentication token
   * POST /auth/refresh
   */
  async refreshToken(refreshToken: string) {
    try {
      const response = await apiRequest(
        '/auth/refresh',
        'POST',
        { refreshToken },
        null,
        AUTH_API_BASE_URL
      );
      
      if (response.token || response.access_token) {
        const token = response.token || response.access_token;
        await SecureStore.setItemAsync('authToken', token);
      }
      
      return response;
    } catch (error: any) {
      console.error('Error in refreshToken:', error);
      throw error;
    }
  },

  /**
   * Logout - invalidate token
   * POST /auth/logout
   */
  async logout(token?: string) {
    try {
      const authToken = token || await getAuthToken();
      if (authToken) {
        await apiRequest(
          '/auth/logout',
          'POST',
          null,
          authToken,
          AUTH_API_BASE_URL
        );
      }
      
      // Clear local token regardless of API call success
      await SecureStore.deleteItemAsync('authToken');
      await SecureStore.deleteItemAsync('refreshToken');
    } catch (error: any) {
      console.error('Error in logout:', error);
      // Still clear local token even if API call fails
      await SecureStore.deleteItemAsync('authToken');
      await SecureStore.deleteItemAsync('refreshToken');
    }
  },
};

/**
 * Get stored authentication token
 */
export const getAuthToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync('authToken');
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

// Export the appropriate service based on environment
export const authService = useMockService 
  ? { 
      ...mockAuthService,
      getAuthToken,
      // Add any additional methods from realAuthService that aren't in mockAuthService
      ...Object.keys(realAuthService).reduce((acc: any, key) => {
        if (!(key in mockAuthService)) {
          acc[key] = (realAuthService as any)[key];
        }
        return acc;
      }, {})
    }
  : { ...realAuthService, getAuthToken };

// Log which service is being used
console.log(`Using ${useMockService ? 'MOCK' : 'REAL'} authentication service`);

// For TypeScript type checking
export type AuthService = typeof authService;
