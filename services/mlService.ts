// services/mlService.ts
// Integration with Coffee-ML backend (FastAPI) – production endpoints only
// The ML backend verifies JWTs issued by the Auth service and requires 32-char
// hex `user_id` values. We include the user_id in the payload for additional verification.

import * as SecureStore from 'expo-secure-store';
import { AUTH_TOKEN_KEY } from '../constants/auth';
import { coffeeMlApiRequest } from '../utils/api';

// Helper to get current user ID from auth context
async function getCurrentUserId(): Promise<string> {
  try {
    const userJson = await SecureStore.getItemAsync('user');
    if (!userJson) {
      throw new Error('User not found in auth context');
    }
    const user = JSON.parse(userJson);
    if (!user?.user_id) {
      throw new Error('User ID not found in auth context');
    }
    return user.user_id;
  } catch (error) {
    console.error('Failed to get user ID from auth context:', error);
    throw new Error('Failed to authenticate. Please login again.');
  }
}

/**
 * Fetch JWT saved after /auth/login/verify (or signup flows that return token).
 * Throws if missing so that callers can trigger a logout.
 */
async function getJwt(): Promise<string> {
  const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
  if (!token) {
    throw new Error('Missing authentication token. Please login again.');
  }
  return token;
}

/**
 * POST /chat – conversational onboarding with Ella.
 * Returns assistant response and persistent thread_id (create or reuse).
 */
export async function sendChatMessage(message: string, threadId?: string) {
  const [token, userId] = await Promise.all([
    getJwt(),
    getCurrentUserId()
  ]);
  
  return coffeeMlApiRequest(
    '/chat',
    'POST',
    { 
      message, 
      thread_id: threadId,
      user_id: userId 
    },
    token,
  ) as Promise<{ response: string; thread_id: string; is_complete?: boolean }>;
}

/** GET /api/profile – current user’s profile */
export async function getOwnProfile() {
  const token = await getJwt();
  return coffeeMlApiRequest('/api/profile', 'GET', null, token);
}

/** GET /api/users/{user_id} – public profile */
export async function getPublicProfile(userId: string) {
  const token = await getJwt();
  return coffeeMlApiRequest(`/api/users/${userId}`, 'GET', null, token);
}

/** GET /api/matches/suggested – top 10 suggested matches */
export async function getSuggestedMatches() {
  const [token, userId] = await Promise.all([
    getJwt(),
    getCurrentUserId()
  ]);
  return coffeeMlApiRequest(
    `/api/matches/suggested?user_id=${encodeURIComponent(userId)}`, 
    'GET', 
    null, 
    token
  );
}

/** GET /api/matches/active – active chat matches */
export async function getActiveMatches() {
  const [token, userId] = await Promise.all([
    getJwt(),
    getCurrentUserId()
  ]);
  return coffeeMlApiRequest(
    `/api/matches/active?user_id=${encodeURIComponent(userId)}`, 
    'GET', 
    null, 
    token
  );
}

/** POST /api/matches/start-chat – promote match to active */
export async function startChat(matchId: string) {
  const [token, userId] = await Promise.all([
    getJwt(),
    getCurrentUserId()
  ]);
  return coffeeMlApiRequest(
    '/api/matches/start-chat', 
    'POST', 
    { 
      match_id: matchId,
      user_id: userId 
    }, 
    token
  );
}

/** POST /api/matches/pass – permanently remove from suggestions */
export async function passUser(matchId: string) {
  const [token, userId] = await Promise.all([
    getJwt(),
    getCurrentUserId()
  ]);
  return coffeeMlApiRequest(
    '/api/matches/pass', 
    'POST', 
    { 
      match_id: matchId,
      user_id: userId 
    }, 
    token
  );
}

/** POST /api/matches/block – block a user entirely */
export async function blockUser(matchId: string) {
  const [token, userId] = await Promise.all([
    getJwt(),
    getCurrentUserId()
  ]);
  return coffeeMlApiRequest(
    '/api/matches/block', 
    'POST', 
    { 
      match_id: matchId,
      user_id: userId 
    }, 
    token
  );
}

export const mlService = {
  sendChatMessage,
  getOwnProfile,
  getPublicProfile,
  getSuggestedMatches,
  getActiveMatches,
  startChat,
  passUser,
  blockUser,
};
