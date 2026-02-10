// services/userService.ts
import { apiRequest } from '../utils/api';

export interface BasicUser {
  userId: string;
  mobile_number: string;
  name?: string;
  email?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const userService = {
  /**
   * Get basic user info (/me endpoint)
   * This should return basic user details without ML profile data
   */
  async getMe(): Promise<BasicUser> {
    try {
      return await apiRequest('/me', 'GET');
    } catch (error: any) {
      // If /me endpoint doesn't exist, fallback to user data from token
      if (error.status === 404) {
        console.warn('⚠️ /me endpoint not available, using fallback');
        // Return basic user info from auth context or token
        throw new Error('User profile endpoint not available');
      }
      throw error;
    }
  },

  /**
   * Update basic user info
   */
  async updateMe(updates: Partial<BasicUser>): Promise<BasicUser> {
    try {
      return await apiRequest('/me', 'PUT', updates);
    } catch (error: any) {
      if (error.status === 404) {
        throw new Error('User update endpoint not available');
      }
      throw error;
    }
  },
};