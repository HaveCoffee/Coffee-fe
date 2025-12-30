// services/authService.ts
// Authentication service integrated with MessageCentral VerifyNow

import * as SecureStore from 'expo-secure-store';
import API_ENDPOINTS from '../constants/apiEndpoints';
import { AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY } from '../constants/auth';
import { apiRequest, AUTH_API_BASE_URL } from '../utils/api';
// import { mockAuthService } from './mockAuthService';

// Toggle mock service disabled – always use real service

// Map VerifyNow backend error codes to user-friendly messages
const mapVerifyNowErrorMessage = (error: any, fallback: string): string => {
  const code = String(
    error?.response?.errorCode ??
    error?.response?.code ??
    error?.code ??
    '',
  );

  switch (code) {
    case '702':
      return 'Invalid or incorrect OTP. Please try again.';
    case '705':
      return 'OTP has expired. Please request a new one.';
    case '703':
      return 'User not registered. Please sign up first.';
    case '700':
      return 'Invalid request. Please check the details and try again.';
    case '800':
      return 'Verification service is temporarily unavailable. Please try again later.';
    default:
      return error?.message || fallback;
  }
};

// -----------------------------------------------------------------------------
// REAL AUTH SERVICE (VerifyNow flow)
// -----------------------------------------------------------------------------
const realAuthService = {
  /**
   * Signup: send OTP via AWS auth service (/auth/signup/init)
   */
  async signupInit(mobileNumber: string) {
    // Ensure no stale token carried over (e.g. dev-mock-token)
    await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);

    try {
      const cleanedNumber = `${mobileNumber}`.replace(/[^0-9]/g, '');

      const response = await apiRequest(
        API_ENDPOINTS.AUTH.SIGNUP_INIT,
        'POST',
        { mobileNumber: cleanedNumber },
        null,
        AUTH_API_BASE_URL,
      );

      if (!response?.verificationId) {
        throw new Error('Failed to initiate signup. Please try again.');
      }

      const token = response?.token ?? null;
      if (token) {
        await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
      }

      return {
        message: response.message || 'OTP sent successfully',
        verificationId: response.verificationId,
        token,
      };
    } catch (error: any) {
      throw new Error(mapVerifyNowErrorMessage(error, 'Failed to send OTP. Please try again.'));
    }
  },

  /**
   * Signup: verify OTP via AWS auth service (/auth/signup/verify)
   */
  async signupVerify(mobileNumber: string, verificationId: string, otp: string) {
    try {
      const cleanedNumber = `${mobileNumber}`.replace(/[^0-9]/g, '');

      const response = await apiRequest(
        API_ENDPOINTS.AUTH.SIGNUP_VERIFY,
        'POST',
        {
          mobileNumber: cleanedNumber,
          otp,
          verificationId,
        },
      );

      const token = response?.token ?? null;
      if (token) {
        await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
      }
      return {
        message: response?.message || 'User verified successfully',
        token,
        user: response?.user,
        verificationStatus: response?.verificationStatus,
      };
    } catch (error: any) {
      throw new Error(mapVerifyNowErrorMessage(error, 'Verification failed. Please try again.'));
    }
  },

  /**
   * Login: send OTP via AWS auth service (/auth/login/init)
   */
  async loginInit(mobileNumber: string) {
    // Ensure no stale token is sent
    await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);

    try {
      const cleanedNumber = `${mobileNumber}`.replace(/[^0-9]/g, '');

      const response = await apiRequest(
        API_ENDPOINTS.AUTH.LOGIN_INIT,
        'POST',
        { mobileNumber: cleanedNumber },
        null,
        AUTH_API_BASE_URL,
      );

      if (!response?.verificationId) {
        throw new Error('Failed to initiate login. Please try again.');
      }

      const token = response?.token ?? null;
      if (token) {
        await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
      }

      return {
        message: response.message || 'OTP sent successfully',
        verificationId: response.verificationId,
        token,
      };
    } catch (error: any) {
      throw new Error(mapVerifyNowErrorMessage(error, 'Failed to send OTP. Please try again.'));
    }
  },

  /**
   * Login: verify OTP via AWS auth service (/auth/login/verify)
   */
  async loginVerify(mobileNumber: string, verificationId: string, otp: string) {
    try {
      const cleanedNumber = `${mobileNumber}`.replace(/[^0-9]/g, '');

      const response = await apiRequest(
        API_ENDPOINTS.AUTH.LOGIN_VERIFY,
        'POST',
        {
          mobileNumber: cleanedNumber,
          otp,
          verificationId,
        },
      );

      const token = response?.token ?? null;
      if (token) {
        await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
      }

      return {
        message: response?.message || 'Login successful',
        token,
        verificationStatus: response?.verificationStatus,
        ...response,
      };
    } catch (error: any) {
      throw new Error(mapVerifyNowErrorMessage(error, 'Verification failed. Please try again.'));
    }
  },

  // ---------------------------------------------------------------------------
  // The following helpers (profile, refreshToken, logout) still rely on the
  // legacy API server and therefore keep the original apiRequest-based logic.
  // ---------------------------------------------------------------------------

  async getProfile(token?: string) {
    try {
      const authToken = token || await getAuthToken();
      if (!authToken) throw new Error('No authentication token available');

      const possibleEndpoints = [
        '/auth/profile',
        '/profile',
        '/user/profile',
        '/user',
        '/auth/user',
      ];

      let response;
      let lastError;
      for (const endpoint of possibleEndpoints) {
        try {
          response = await apiRequest(endpoint, 'GET', null, authToken, AUTH_API_BASE_URL);
          if (response) break;
        } catch (err: any) {
          lastError = err;
          if (err.message?.includes('404')) continue;
          throw err;
        }
      }
      if (!response) throw lastError || new Error('Failed to fetch profile');
      return response;
    } catch (error: any) {
      if (error.message?.includes('401') || error.message?.includes('expired')) {
        await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
        throw new Error('Session expired. Please login again.');
      }
      throw error;
    }
  },

  async updateProfile(profileData: any, token?: string) {
    const authToken = token || (await getAuthToken());
    if (!authToken) throw new Error('No authentication token available');

    const possibleEndpoints = [
      '/auth/profile',
      '/profile',
      '/user/profile',
      '/user',
      '/auth/user',
    ];

    let response;
    let lastError;
    for (const endpoint of possibleEndpoints) {
      try {
        response = await apiRequest(endpoint, 'PUT', profileData, authToken, AUTH_API_BASE_URL);
        if (response) break;
      } catch (err: any) {
        lastError = err;
        if (err.message?.includes('404')) continue;
        throw err;
      }
    }
    if (!response) throw lastError || new Error('Failed to update profile');
    return response;
  },

  async refreshToken(refreshToken?: string) {
    const storedRefreshToken = refreshToken || await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    if (!storedRefreshToken) throw new Error('No refresh token available');

    const response = await apiRequest(
      '/auth/refresh',
      'POST',
      { refreshToken: storedRefreshToken },
      AUTH_API_BASE_URL,
    );

    const token = response.token || response.access_token || response.accessToken;
    if (!token) throw new Error('No token received from refresh endpoint');

    await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
    if (response.refresh_token || response.refreshToken) {
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, response.refresh_token || response.refreshToken);
    }
    return { token, refresh_token: response.refresh_token || response.refreshToken || storedRefreshToken };
  },

  async logout(token?: string) {
    try {
      const authToken = token || await getAuthToken();
      if (authToken) {
        try {
          await apiRequest('/auth/logout', 'POST', null, authToken, AUTH_API_BASE_URL);
        } catch {
          // Ignore API logout failure – proceed to local cleanup
        }
      }
    } finally {
      await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    }
  },
};

// -----------------------------------------------------------------------------
// Token helpers (shared across mock & real services)
// -----------------------------------------------------------------------------
export const getAuthToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
};

export const getRefreshToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
};

export const authService = { ...realAuthService, getAuthToken, getRefreshToken };

console.log('Using REAL authentication service');

export type AuthService = typeof authService;
