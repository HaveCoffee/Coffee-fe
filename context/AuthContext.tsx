// context/AuthContext.tsx
import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY } from '../constants/auth';

interface AuthContextType {
  user: any | null;
  token: string | null;
  isLoading: boolean;
  login: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAuthState = async () => {
      try {
        const [userJson, storedToken] = await Promise.all([
          SecureStore.getItemAsync('user'),
          SecureStore.getItemAsync(AUTH_TOKEN_KEY),
        ]);

        if (userJson) {
          setUser(JSON.parse(userJson));
        }

        if (storedToken) {
          setToken(storedToken);
        }
      } catch (error) {
        console.error('Failed to load user data', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAuthState();
  }, []);

  const login = async (userData: any) => {
    try {
      await SecureStore.setItemAsync('user', JSON.stringify(userData));
      setUser(userData);

      // Also load the latest auth token from secure storage
      try {
        const storedToken = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
        if (storedToken) {
          setToken(storedToken);
        }
      } catch (error) {
        console.error('Failed to load auth token after login', error);
      }
    } catch (error) {
      console.error('Failed to save user data', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync('user');
      await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      setUser(null);
      setToken(null);
    } catch (error) {
      console.error('Failed to clear user data', error);
      throw error;
    }
  };

  const updateUser = (updates: any) => {
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    SecureStore.setItemAsync('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};