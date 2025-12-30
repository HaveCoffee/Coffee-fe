// services/verifyNowService.ts
// Lightweight wrapper around Message Central "VerifyNow" OTP APIs
// Docs excerpt provided by backend team (2025-12-29)
// Base URL: https://cpaas.messagecentral.com
// -----------------------------------------------------------------------------
// NOTE: The customerId and key **MUST** be provisioned in environment variables
// VerifyNow works in three steps:
//   1. Generate auth token               –  GET /auth/v1/authentication/token
//   2. Send OTP (get verificationId)      – POST /verification/v3/send
//   3. Validate OTP                       – POST /verification/v3/validateOtp
// -----------------------------------------------------------------------------
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// These keys will be persisted so we can re-use the token until it expires.
const VERIFYNOW_AUTH_TOKEN_KEY = 'verifynowAuthToken';
const VERIFYNOW_TOKEN_FETCH_TS_KEY = 'verifynowAuthTokenFetchedAt';

// 30-minute default validity if backend does not supply exp claim
const DEFAULT_TOKEN_TTL_MS = 30 * 60 * 1000;

// Helper to read env (expo-constants) or fall back to .env-style global
const env = (key: string): string | undefined => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const Constants = require('expo-constants').default;
  return Constants?.manifest?.extra?.[key] || process.env[key];
};

const MESSAGE_CENTRAL_BASE_URL = 'https://cpaas.messagecentral.com';
const CUSTOMER_ID = env('MESSAGE_CENTRAL_CUSTOMER_ID') || '<REPLACE_ME>'; // REQUIRED
const CUSTOMER_KEY = env('MESSAGE_CENTRAL_KEY') || '<REPLACE_ME>'; // REQUIRED (base64-encoded password)
const DEFAULT_COUNTRY_CODE = env('MESSAGE_CENTRAL_COUNTRY') || '91';

// ----------------------------------------------------------------------------
// Internal helpers
// ----------------------------------------------------------------------------
const buildUrl = (path: string, params?: Record<string, string | number | undefined>) => {
  const url = new URL(`${MESSAGE_CENTRAL_BASE_URL}${path}`);
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null) url.searchParams.append(k, String(v));
  });
  return url.toString();
};

const request = async (
  url: string,
  method: 'GET' | 'POST',
  headers: Record<string, string> = {},
) => {
  const cfg: RequestInit = { method, headers };
  const res = await fetch(url, cfg);
  const text = await res.text();
  let data: any;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    const message = data?.message || data?.errorMessage || res.statusText;
    const err: any = new Error(message);
    err.status = res.status;
    err.response = data;
    throw err;
  }
  return data;
};

// ----------------------------------------------------------------------------
// Public API
// ----------------------------------------------------------------------------
export const verifyNowService = {
  /**
   * Ensure we have a valid authToken, generating one if missing/expired.
   */
  async getAuthToken(forceRefresh = false): Promise<string> {
    if (!forceRefresh) {
      const token = await SecureStore.getItemAsync(VERIFYNOW_AUTH_TOKEN_KEY);
      const fetchedAtStr = await SecureStore.getItemAsync(VERIFYNOW_TOKEN_FETCH_TS_KEY);
      if (token && fetchedAtStr) {
        const fetchedAt = parseInt(fetchedAtStr, 10);
        if (Date.now() - fetchedAt < DEFAULT_TOKEN_TTL_MS) {
          return token;
        }
      }
    }

    // Generate a fresh token
    const params = {
      customerId: CUSTOMER_ID,
      key: CUSTOMER_KEY,
      scope: 'NEW',
      country: DEFAULT_COUNTRY_CODE,
      email: Platform.OS === 'web' ? undefined : undefined, // optional
    } as Record<string, string | number | undefined>;

    const url = buildUrl('/auth/v1/authentication/token', params);
    const result = await request(url, 'GET');

    const authToken = result?.data?.authToken || result?.authToken;
    if (!authToken) {
      throw new Error('verifyNowService: Token generation failed – no authToken in response');
    }

    await SecureStore.setItemAsync(VERIFYNOW_AUTH_TOKEN_KEY, authToken);
    await SecureStore.setItemAsync(VERIFYNOW_TOKEN_FETCH_TS_KEY, Date.now().toString());

    return authToken;
  },

  /**
   * Send OTP to a mobile number. Returns { verificationId, timeout, transactionId } etc.
   */
  async sendOtp(mobileNumber: string): Promise<{ verificationId: string; timeout: string; transactionId: string; }> {
    const authToken = await this.getAuthToken();

    const params = {
      customerId: CUSTOMER_ID,
      countryCode: DEFAULT_COUNTRY_CODE,
      flowType: 'SMS',
      mobileNumber,
    } as Record<string, string | number | undefined>;

    const url = buildUrl('/verification/v3/send', params);
    const data = await request(url, 'POST', { authToken });

    const vId = data?.data?.verificationId || data?.data?.veriicationId || data?.data?.veriÕcationId || data?.data?.veriÍcationId || data?.verificationId;
    if (!vId) {
      throw new Error('verifyNowService: sendOtp failed – verificationId missing');
    }

    return {
      verificationId: vId,
      timeout: data?.data?.timeout || '60',
      transactionId: data?.data?.transactionId,
    };
  },

  /**
   * Validate the OTP code. Returns status info.
   */
  async validateOtp(verificationId: string, code: string) {
    const authToken = await this.getAuthToken();

    const params = {
      verificationId,
      code,
    } as Record<string, string | number | undefined>;

    const url = buildUrl('/verification/v3/validateOtp', params);
    const data = await request(url, 'POST', { authToken });

    return data?.data || data;
  },
};

export type VerifyNowService = typeof verifyNowService;
