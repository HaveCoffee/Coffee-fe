import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/authService';

interface User {
  id: string;
  name: string;
  email: string;
  mobileNumber: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, userData: any) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAuthState = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync('authToken');
        if (storedToken) {
          setToken(storedToken);
          // Try to fetch user profile
          try {
            const userData = await authService.getProfile(storedToken);
            setUser({
              id: userData.user_id || userData.id || '',
              name: userData.name || userData.full_name || 'User',
              email: userData.email || '',
              mobileNumber: userData.mobile_number || userData.mobileNumber || '',
            });
          } catch (error) {
            console.error('Failed to fetch user profile:', error);
            // Token might be invalid, clear it
            await SecureStore.deleteItemAsync('authToken');
            setToken(null);
          }
        }
      } catch (error) {
        console.error('Failed to load auth state', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAuthState();
  }, []);

  const login = async (newToken: string, userData: any) => {
    try {
      await SecureStore.setItemAsync('authToken', newToken);
      setToken(newToken);
      setUser({
        id: userData.user_id,
        name: userData.name || 'User',
        email: userData.email || '',
        mobileNumber: userData.mobile_number || '',
      });
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Failed to save auth token', error);
    }
  };

  const logout = async () => {
    try {
      // Call API logout if token exists
      if (token) {
        try {
          await authService.logout(token);
        } catch (error) {
          console.error('API logout failed, clearing local data anyway:', error);
        }
      }
      
      // Clear the authentication token from secure storage
      await SecureStore.deleteItemAsync('authToken');
      await SecureStore.deleteItemAsync('refreshToken');
      
      // Reset all auth-related state
      setToken(null);
      setUser(null);
      
      // Navigate to the auth screen
      // Using replace to prevent going back to authenticated screens
      router.replace('/(auth)');
      
      console.log('Successfully logged out');
    } catch (error) {
      console.error('Failed to log out:', error);
      // Still clear local state even if API call fails
      setToken(null);
      setUser(null);
      await SecureStore.deleteItemAsync('authToken');
      router.replace('/(auth)');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};