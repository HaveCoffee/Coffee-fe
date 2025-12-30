// services/coffeeMlAuthService.ts
import * as SecureStore from 'expo-secure-store';
import { AUTH_TOKEN_KEY } from '../constants/auth';

export async function getCoffeeMlToken(): Promise<string | null> {
  try {
    // Get the auth token from secure storage
    return await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
}

export async function clearCoffeeMlToken(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error('Error clearing auth token:', error);
  }
}