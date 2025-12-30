// services/coffeeMlService.ts
// Service for Coffee-ml API endpoints (profile, matches, etc.)
// Based on README: https://github.com/your-repo/Coffee-ml
import { coffeeMlApiRequest } from '../utils/api';
import { getCoffeeMlToken } from './coffeeMlAuthService';

export interface ProfileData {
  vibe_summary?: string;
  interests?: string[];
  social_intent?: string;
  personality_type?: string;
  [key: string]: any;
}

export interface UserProfile {
  user_id: string;
  profile_data: ProfileData;
}

export interface Match {
  score: number;
  user_id: string;
  profile_data: ProfileData;
}

export interface MatchesResponse {
  matches: Match[];
}

const USE_COFFEE_ML_MOCK = __DEV__;

const MOCK_USER_ID = 'mock-user-123';

const mockUserProfile: UserProfile = {
  user_id: MOCK_USER_ID,
  profile_data: {
    vibe_summary:
      'You are a coffee-loving storyteller who enjoys deep conversations about life, careers, and side projects.',
    interests: ['Third-wave coffee', 'Product design', 'Weekend hikes', 'Stand-up comedy'],
    social_intent: 'Looking for thoughtful conversations over coffee',
    personality_type: 'INFJ',
  },
};

const mockMatchesResponse: MatchesResponse = {
  matches: [
    {
      score: 0.92,
      user_id: 'match-1',
      profile_data: {
        name: 'Anya',
        availability: 'Available This Sat',
        conversation_starter:
          'Curious about your favorite trail, Anya! Any recommendations for a beginner?',
        vibe_summary:
          'Moved from a small town to the city and misses slow mornings with good coffee and long chats.',
        interests: ['Sci-Fi Books', 'Hiking', 'AI Ethics'],
        social_intent: 'Meet other parents navigating careers',
        personality_type: 'ENFJ',
      },
    },
    {
      score: 0.87,
      user_id: 'match-2',
      profile_data: {
        name: 'Arjun',
        availability: 'Available Fri 3 PM',
        conversation_starter:
          'What is the most interesting startup idea you have heard this month?',
        vibe_summary:
          'Techie by day, amateur barista by night. Always up for debating ideas over a flat white.',
        interests: ['Startups', 'AI Ethics', 'Cycling', 'Jazz'],
        social_intent: 'Looking for interesting people to bounce ideas with',
        personality_type: 'INTP',
      },
    },
    {
      score: 0.81,
      user_id: 'match-3',
      profile_data: {
        name: 'Maya',
        availability: 'Available Sun Evening',
        conversation_starter:
          'Which art museum or gallery has inspired you the most recently?',
        vibe_summary:
          'Artist who sketches people in coffee shops and loves discovering hidden spots in the city.',
        interests: ['Illustration', 'Poetry', 'Long walks', 'Art museums'],
        social_intent: 'Hoping to meet new creative friends',
        personality_type: 'ISFP',
      },
    },
  ],
};

export const coffeeMlService = {
  /**
   * Get Own Profile
   * GET /api/profile
   * Returns the profile data for the currently authenticated user
   */
  async getOwnProfile(): Promise<UserProfile> {
    if (USE_COFFEE_ML_MOCK) {
      return mockUserProfile;
    }
    try {
      // Use Coffee-ml token (Coffee-ml uses its own JWT secret)
      const token = await getCoffeeMlToken();
      if (!token) {
        throw new Error('No Coffee-ml authentication token available. Please login again.');
      }

      console.log('[JWT] 📤 Coffee-ml JWT token sent in getOwnProfile request', {
        endpoint: '/api/profile',
        method: 'GET',
        tokenLength: token.length,
        tokenPreview: token.substring(0, 20) + '...',
        timestamp: new Date().toISOString(),
      });

      // According to README: GET /api/profile
      // Use specialized Coffee-ml API request that handles token refresh
      const response = await coffeeMlApiRequest(
        '/api/profile',
        'GET',
        null,
        token
      );

      return response as UserProfile;
    } catch (error: any) {
      console.error('Error fetching own profile:', error);
      
      if (error.message?.includes('401') || error.message?.includes('unauthorized')) {
        throw new Error('Session expired. Please login again.');
      }
      
      throw error;
    }
  },

  /**
   * Get Public Profile
   * GET /api/users/{user_id}
   * Retrieves the public-facing details of a specific user
   */
  async getPublicProfile(userId: string): Promise<UserProfile> {
    if (USE_COFFEE_ML_MOCK) {
      const fromMatch = mockMatchesResponse.matches.find(m => m.user_id === userId);
      if (fromMatch) {
        return {
          user_id: fromMatch.user_id,
          profile_data: fromMatch.profile_data,
        };
      }
      return mockUserProfile;
    }
    try {
      // Use Coffee-ml token (Coffee-ml uses its own JWT secret)
      const token = await getCoffeeMlToken();
      if (!token) {
        throw new Error('No Coffee-ml authentication token available. Please login again.');
      }

      console.log('[JWT] 📤 Coffee-ml JWT token sent in getPublicProfile request', {
        endpoint: `/api/users/${userId}`,
        method: 'GET',
        tokenLength: token.length,
        tokenPreview: token.substring(0, 20) + '...',
        timestamp: new Date().toISOString(),
      });

      // According to README: GET /api/users/{user_id}
      // Use specialized Coffee-ml API request that handles token refresh
      const response = await coffeeMlApiRequest(
        `/api/users/${userId}`,
        'GET',
        null,
        token
      );

      return response as UserProfile;
    } catch (error: any) {
      console.error('Error fetching public profile:', error);
      
      if (error.message?.includes('401') || error.message?.includes('unauthorized')) {
        throw new Error('Session expired. Please login again.');
      } else if (error.message?.includes('404') || error.message?.includes('not found')) {
        throw new Error('User profile not found');
      }
      
      throw error;
    }
  },

  /**
   * Get Matches
   * GET /api/matches
   * Calculates and returns a ranked list of users based on vector embedding similarity
   */
  async getMatches(): Promise<MatchesResponse> {
    if (USE_COFFEE_ML_MOCK) {
      return mockMatchesResponse;
    }
    try {
      // Use Coffee-ml token (Coffee-ml uses its own JWT secret)
      const token = await getCoffeeMlToken();
      if (!token) {
        throw new Error('No Coffee-ml authentication token available. Please login again.');
      }

      console.log('[JWT] 📤 Coffee-ml JWT token sent in getMatches request', {
        endpoint: '/api/matches',
        method: 'GET',
        tokenLength: token.length,
        tokenPreview: token.substring(0, 20) + '...',
        timestamp: new Date().toISOString(),
      });

      // According to README: GET /api/matches
      // Use specialized Coffee-ml API request that handles token refresh
      const response = await coffeeMlApiRequest(
        '/api/matches',
        'GET',
        null,
        token
      );

      // Ensure response has matches array
      if (response.matches && Array.isArray(response.matches)) {
        return response as MatchesResponse;
      } else if (Array.isArray(response)) {
        // If response is directly an array, wrap it
        return { matches: response as Match[] };
      } else {
        throw new Error('Invalid matches response format');
      }
    } catch (error: any) {
      console.error('Error fetching matches:', error);
      
      if (error.message?.includes('401') || error.message?.includes('unauthorized')) {
        throw new Error('Session expired. Please login again.');
      }
      
      throw error;
    }
  },
};
