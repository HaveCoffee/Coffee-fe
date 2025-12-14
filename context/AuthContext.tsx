import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext, useEffect, useState } from 'react';

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
          // You might want to fetch user data here
          // const userData = await authService.getProfile(storedToken);
          // setUser(userData);
          setToken(storedToken);
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
      // Clear the authentication token from secure storage
      await SecureStore.deleteItemAsync('authToken');
      
      // Reset all auth-related state
      setToken(null);
      setUser(null);
      
      // Clear any other auth-related data if needed
      // For example, if you have any other secure items:
      // await SecureStore.deleteItemAsync('refreshToken');
      
      // Navigate to the auth screen
      // Using replace to prevent going back to authenticated screens
      router.replace('/(auth)');
      
      // Clear any cached data or subscriptions if needed
      // For example:
      // queryClient.clear(); // If you're using React Query
      
      console.log('Successfully logged out');
    } catch (error) {
      console.error('Failed to log out:', error);
      // You might want to handle this error in the UI
      throw error; // Re-throw to allow components to handle the error if needed
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