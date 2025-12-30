// utils/api.ts
import * as SecureStore from 'expo-secure-store';
import * as jwt from 'jsonwebtoken';
import API_ENDPOINTS from '../constants/apiEndpoints';
import { AUTH_TOKEN_KEY, COFFEE_ML_JWT_SECRET } from '../constants/auth';
import { clearCoffeeMlToken } from '../services/coffeeMlAuthService';
// ==================
// Base URLs
// ==================
export const AUTH_API_BASE_URL = 'http://3.110.104.45/api';
export const COFFEE_ML_API_BASE_URL = 'http://3.110.104.45:8000';
export const CHAT_API_BASE_URL = 'http://3.110.104.45:3001/api/v1';

// ==================
// Token Getter
// ==================
const getAuthToken = async (): Promise<string | null> => {
  const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);

  if (token) {
    console.log('[JWT] 🔑 Auth token accessed in api.ts', {
      tokenLength: token.length,
      tokenPreview: token.substring(0, 20) + '...',
      timestamp: new Date().toISOString(),
    });
  } else {
    console.log('[JWT] 🔑 Auth token access attempted in api.ts but token is null/empty', {
      timestamp: new Date().toISOString(),
    });
  }

  return token;
};

// ==================
// API Request Helper
// ==================
export const apiRequest = async (
  endpoint: string,
  method: string = 'GET',
  data: any = null,
  baseUrlOrToken?: string | null,
  baseUrl?: string
): Promise<any> => {
  let token: string | null = null;
  let finalBaseUrl: string = AUTH_API_BASE_URL;

  if (baseUrl) {
    token = baseUrlOrToken as string | null;
    finalBaseUrl = baseUrl;
  } else if (baseUrlOrToken && baseUrlOrToken.startsWith('http')) {
    finalBaseUrl = baseUrlOrToken;
    token = await getAuthToken();
  } else {
    token = baseUrlOrToken as string | null || await getAuthToken();
  }

  const url = `${finalBaseUrl}${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
    console.log('[JWT] 📤 JWT token sent in API request', {
      method,
      endpoint,
      url,
      tokenLength: token.length,
      tokenPreview: token.substring(0, 20) + '...',
      hasAuthorizationHeader: true,
      timestamp: new Date().toISOString(),
    });
  } else {
    console.log('[JWT] 📤 API request sent WITHOUT JWT token', {
      method,
      endpoint,
      url,
      hasAuthorizationHeader: false,
      timestamp: new Date().toISOString(),
    });
  }

  const config: RequestInit = {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
  };

  try {
    console.log(`[API] 🌐 Sending ${method} request to: ${url}`, {
      headers,
      body: data ? JSON.stringify(data) : null,
      timestamp: new Date().toISOString()
    });

    const response = await fetch(url, config);
    const text = await response.text();

    let responseData: any;
    try {
      responseData = text ? JSON.parse(text) : null;
    } catch (e) {
      console.warn(`[API] ⚠️ Failed to parse JSON response:`, { text });
      responseData = text;
    }

    console.log(`[API] 📥 Response from ${method} ${url} (${response.status}):`, {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      body: responseData,
      timestamp: new Date().toISOString()
    });

    if (!response.ok) {
      let errorMessage = responseData?.detail || 
                         responseData?.message || 
                         responseData?.error || 
                         response.statusText ||
                         'API request failed';

      if (response.status === 401) {
        errorMessage = 'Session expired. Please login again.';
      } else if (response.status === 403) {
        errorMessage = 'Access forbidden. You do not have permission to perform this action.';
      }

      const error: any = new Error(errorMessage);
      error.status = response.status;
      error.response = responseData;
      if (response.status === 401) {
        error.code = 'UNAUTHORIZED';
      } else if (response.status === 403) {
        error.code = 'FORBIDDEN';
      }

      console.error(`[API] ❌ Request failed: ${method} ${url} (${response.status})`, {
        status: response.status,
        error: errorMessage,
        response: responseData,
        timestamp: new Date().toISOString()
      });

      throw error;
    }

    return responseData;
  } catch (error: any) {
    if (error.name === 'TypeError' && error.message.includes('Network request failed')) {
      console.error('[API] 🔌 Network error - Please check your internet connection');
      throw new Error('Network error. Please check your internet connection and try again.');
    }
    
    console.error(`[API] ❌ Unhandled error in ${method} ${url}:`, {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    // Re-throw with a more descriptive message if needed
    if (!error.message || error.message === 'API request failed') {
      throw new Error(`Request failed: ${error.message || 'Unknown error'}`);
    }
    
    throw error;
  }
};

// ==================
// Coffee-ML APIs (AI-driven onboarding via /chat)
// ==================
export const chatApi = {
  async sendMessage(
    message: string,
    threadId?: string,
    options: Record<string, any> = {}
  ): Promise<{
    response: string;
    thread_id: string;
    is_complete?: boolean;
  }> {
    const { getCoffeeMlToken } = await import('../services/coffeeMlAuthService');
    const token = await getCoffeeMlToken();

    if (!token) {
      throw new Error('No authentication token available. Please login again.');
    }

    return coffeeMlApiRequest(
      API_ENDPOINTS.CHAT.SEND_MESSAGE,
      'POST',
      {
        message,
        thread_id: threadId,
        ...options,
      },
      token
    );
  },

  async getProfile(): Promise<any> {
    const { getCoffeeMlToken } = await import('../services/coffeeMlAuthService');
    const token = await getCoffeeMlToken();

    if (!token) {
      throw new Error('No authentication token available. Please login again.');
    }

    return coffeeMlApiRequest(
      API_ENDPOINTS.PROFILE.GET_PROFILE,
      'GET',
      null,
      token
    );
  },

  async getMatches(): Promise<any> {
    const { getCoffeeMlToken } = await import('../services/coffeeMlAuthService');
    const token = await getCoffeeMlToken();

    if (!token) {
      throw new Error('No authentication token available. Please login again.');
    }

    return coffeeMlApiRequest(
      API_ENDPOINTS.MATCHES.GET_MATCHES,
      'GET',
      null,
      token
    );
  },
};

// ==================
// Coffee-ML API Request Helper
// ==================
// Helper function to sign JWT with Coffee-ML secret
const signCoffeeMlToken = (userId: string): string => {
  if (!COFFEE_ML_JWT_SECRET) {
    throw new Error('COFFEE_ML_JWT_SECRET is not configured');
  }
  
  // Create a JWT token that expires in 1 hour
  return jwt.sign(
    { 
      user_id: userId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour expiration
    },
    COFFEE_ML_JWT_SECRET,
    { algorithm: 'HS256' }
  );
};

export const coffeeMlApiRequest = async (
  endpoint: string,
  method: string = 'GET',
  data: any = null,
  authToken: string | null
): Promise<any> => {
  const url = `${COFFEE_ML_API_BASE_URL}${endpoint}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (authToken) {
    try {
      // Extract user ID from the auth token
      const decoded = jwt.decode(authToken);
      if (!decoded || typeof decoded === 'string' || !decoded.user_id) {
        throw new Error('Invalid auth token format');
      }
      
      // Sign a new JWT specifically for Coffee-ML
      const coffeeMlToken = signCoffeeMlToken(decoded.user_id);
      
      headers.Authorization = `Bearer ${coffeeMlToken}`;
      
      console.log('[JWT] 📤 Coffee-ml JWT token generated and sent', {
        method,
        endpoint,
        url,
        tokenLength: coffeeMlToken.length,
        tokenPreview: coffeeMlToken.substring(0, 20) + '...',
        hasAuthorizationHeader: true,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('[JWT] ❌ Failed to generate Coffee-ML token:', error);
      throw new Error('Failed to authenticate with Coffee-ML service');
    }
  } else {
    console.log('[JWT] 📤 Coffee-ml API request sent WITHOUT JWT token', {
      method,
      endpoint,
      url,
      hasAuthorizationHeader: false,
      timestamp: new Date().toISOString(),
    });
  }

  const config: RequestInit = {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
  };

  try {
    const response = await fetch(url, config);
    const text = await response.text();

    let responseData: any;
    try {
      responseData = text ? JSON.parse(text) : null;
    } catch {
      responseData = text;
    }

    if (!response.ok) {
      let errorMessage =
        responseData?.detail ||
        responseData?.message ||
        responseData ||
        'API request failed';

      if (response.status === 401) {
        errorMessage = 'Session expired. Please login again.';
        console.error('[JWT] ❌ Coffee-ML JWT validation failed with 401 Unauthorized', {
          endpoint,
          method,
          url,
          error: responseData?.detail || responseData?.message || 'Could not validate credentials',
          timestamp: new Date().toISOString(),
        });

        try {
          await clearCoffeeMlToken();
        } catch (tokenError) {
          console.error('[JWT] ❌ Failed to clear authentication token after 401', {
            endpoint,
            method,
            url,
            error:
              tokenError instanceof Error ? tokenError.message : String(tokenError),
            timestamp: new Date().toISOString(),
          });
        }
      } else if (response.status === 403) {
        errorMessage = 'Access forbidden. You do not have permission to perform this action.';
      }

      const error: any = new Error(errorMessage);
      error.status = response.status;
      error.response = responseData;
      if (response.status === 401) {
        error.code = 'UNAUTHORIZED';
      } else if (response.status === 403) {
        error.code = 'FORBIDDEN';
      }

      throw error;
    }

    return responseData;
  } catch (error: any) {
    if (error.name === 'TypeError' && error.message.includes('Network request failed')) {
      console.error('[API] 🔌 Network error calling Coffee-ML API');
      throw new Error('Network error. Please check your internet connection and try again.');
    }

    console.error(`Coffee-ml API request failed: ${method} ${url}`, error);
    throw error;
  }
};
