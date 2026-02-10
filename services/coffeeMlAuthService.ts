// services/coffeeMlAuthService.ts
import * as SecureStore from 'expo-secure-store';
import { AUTH_TOKEN_KEY } from '../constants/auth';

export async function getCoffeeMlToken(): Promise<string | null> {
  try {
    console.log('🔍 [DEBUG] getCoffeeMlToken - Checking SecureStore...');
    const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
    console.log('🔍 [DEBUG] getCoffeeMlToken result:', {
      hasToken: !!token,
      tokenLength: token?.length || 0,
      tokenPreview: token ? token.substring(0, 20) + '...' : 'null',
      authTokenKey: AUTH_TOKEN_KEY
    });
    return token;
  } catch (error) {
    console.error('❌ [DEBUG] Error getting auth token:', error);
    return null;
  }
}

export async function clearCoffeeMlToken(): Promise<void> {
  try {
    console.log('🗑️ Clearing Coffee-ML auth token...');
    await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
    console.log('✅ Coffee-ML auth token cleared successfully');
  } catch (error) {
    console.error('❌ Error clearing Coffee-ML auth token:', error);
    throw error;
  }
}