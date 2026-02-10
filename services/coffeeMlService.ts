// services/coffeeMlService.ts
// Service for Coffee-ml API endpoints (profile, matches, etc.)
// Based on README: https://github.com/your-repo/Coffee-ml
import { coffeeMlApiRequest } from '../utils/api';
import { getCoffeeMlToken } from './coffeeMlAuthService';

// Helper function to extract a meaningful name from profile data
function extractUserName(profileData: ProfileData, userId: string): string {
  // Try direct name fields first
  if (profileData.name) return profileData.name;
  if (profileData.display_name) return profileData.display_name;
  if (profileData.username) return profileData.username;
  
  // Extract from vibe_summary - look for "I am [name]" or similar patterns
  if (profileData.vibe_summary) {
    const vibeText = profileData.vibe_summary;
    
    // Look for "I am [Name]" pattern
    const iAmMatch = vibeText.match(/I am ([A-Z][a-z]+)/i);
    if (iAmMatch) return iAmMatch[1];
    
    // Look for "My name is [Name]" pattern
    const nameMatch = vibeText.match(/(?:my name is|i'm|i am) ([A-Z][a-z]+)/i);
    if (nameMatch) return nameMatch[1];
    
    // Look for names at the beginning of sentences
    const firstWordMatch = vibeText.match(/^([A-Z][a-z]+)(?:\s|,|\.|!)/); 
    if (firstWordMatch && firstWordMatch[1].length > 2) return firstWordMatch[1];
  }
  
  // Extract from social_intent
  if (profileData.social_intent) {
    const intentText = profileData.social_intent;
    const nameMatch = intentText.match(/(?:I'm|I am|My name is) ([A-Z][a-z]+)/i);
    if (nameMatch) return nameMatch[1];
  }
  
  // Last resort: use a shortened user ID
  return `User ${userId.substring(0, 6)}`;
}

export interface ProfileData {
  vibe_summary?: string;
  interests?: string[] | null;
  social_intent?: string;
  personality_type?: string;
  availability?: {
    days?: string[];
    weekdays?: string[];
    weekends?: string[];
  };
  time_windows?: string[];
  meeting_style?: string;
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
  last_active?: string;
}

export interface MatchesResponse {
  matches: Match[];
}

const USE_COFFEE_ML_MOCK = false; // Set to true to use mock data

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
   */
  async getOwnProfile(): Promise<UserProfile> {
    if (USE_COFFEE_ML_MOCK) {
      return mockUserProfile;
    }
    try {
      const token = await getCoffeeMlToken();
      if (!token) {
        throw new Error('No Coffee-ml authentication token available. Please login again.');
      }

      const response = await coffeeMlApiRequest('/api/profile', 'GET', null, token);
      return response as UserProfile;
    } catch (error: any) {
      console.error('Error fetching own profile:', error);
      if (error.message?.includes('Profile not found')) {
        // User hasn't completed onboarding - this is expected
        console.log('ℹ️ User profile not found - onboarding not completed yet');
        throw error;
      }
      if (error.message?.includes('401') || error.message?.includes('unauthorized')) {
        throw new Error('Session expired. Please login again.');
      }
      throw error;
    }
  },

  /**
   * Get Public Profile
   * GET /api/users/{user_id}
   */
  async getPublicProfile(userId: string): Promise<UserProfile> {
    if (USE_COFFEE_ML_MOCK) {
      const fromMatch = mockMatchesResponse.matches.find(m => m.user_id === userId);
      if (fromMatch) {
        return { user_id: fromMatch.user_id, profile_data: fromMatch.profile_data };
      }
      return mockUserProfile;
    }
    try {
      const token = await getCoffeeMlToken();
      if (!token) {
        throw new Error('No Coffee-ml authentication token available. Please login again.');
      }

      const response = await coffeeMlApiRequest(`/api/users/${userId}`, 'GET', null, token);
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
   * Get Suggested Matches (NEW)
   * GET /api/matches/suggested
   */
  async getSuggestedMatches(): Promise<MatchesResponse> {
    if (USE_COFFEE_ML_MOCK) {
      return mockMatchesResponse;
    }
    try {
      console.log('🔍 [DEBUG] getSuggestedMatches - Starting...');
      const token = await getCoffeeMlToken();
      console.log('🔍 [DEBUG] Token retrieved:', {
        hasToken: !!token,
        tokenLength: token?.length || 0,
        tokenPreview: token ? token.substring(0, 20) + '...' : 'null'
      });
      
      if (!token) {
        console.error('❌ [DEBUG] No token found in SecureStore');
        throw new Error('No Coffee-ml authentication token available. Please login again.');
      }

      console.log('🔍 [DEBUG] Calling coffeeMlApiRequest...');
      const response = await coffeeMlApiRequest('/api/matches/suggested', 'GET', null, token);
      
      if (response.matches && Array.isArray(response.matches)) {
        return response as MatchesResponse;
      } else if (Array.isArray(response)) {
        return { matches: response as Match[] };
      } else {
        throw new Error('Invalid matches response format');
      }
    } catch (error: any) {
      console.error('❌ [DEBUG] getSuggestedMatches error:', {
        message: error.message,
        status: error.status,
        stack: error.stack
      });
      if (error.message?.includes('Profile not found') || error.message?.includes('User not found')) {
        // Return empty matches if user profile doesn't exist yet
        return { matches: [] };
      }
      if (error.message?.includes('401') || error.message?.includes('unauthorized')) {
        throw new Error('Session expired. Please login again.');
      }
      throw error;
    }
  },

  /**
   * Get Active Chats (NEW)
   * GET /api/matches/active
   */
  async getActiveChats(): Promise<MatchesResponse> {
    if (USE_COFFEE_ML_MOCK) {
      return mockMatchesResponse;
    }
    try {
      const token = await getCoffeeMlToken();
      if (!token) {
        throw new Error('No Coffee-ml authentication token available. Please login again.');
      }

      const response = await coffeeMlApiRequest('/api/matches/active', 'GET', null, token);
      
      if (response.matches && Array.isArray(response.matches)) {
        return response as MatchesResponse;
      } else if (Array.isArray(response)) {
        return { matches: response as Match[] };
      } else {
        throw new Error('Invalid active chats response format');
      }
    } catch (error: any) {
      console.error('Error fetching active chats:', error);
      if (error.message?.includes('Profile not found') || error.message?.includes('User not found')) {
        // Return empty matches if user profile doesn't exist yet
        return { matches: [] };
      }
      if (error.message?.includes('401') || error.message?.includes('unauthorized')) {
        throw new Error('Session expired. Please login again.');
      }
      throw error;
    }
  },

  /**
   * Start Chat (NEW)
   * POST /api/matches/start-chat
   */
  async startChat(matchId: string): Promise<{status: string, message: string}> {
    if (USE_COFFEE_ML_MOCK) {
      return {status: 'success', message: 'Moved to active chats'};
    }
    try {
      const token = await getCoffeeMlToken();
      if (!token) {
        throw new Error('No Coffee-ml authentication token available. Please login again.');
      }

      const response = await coffeeMlApiRequest('/api/matches/start-chat', 'POST', { match_id: matchId }, token);
      return response;
    } catch (error: any) {
      console.error('Error starting chat:', error);
      if (error.message?.includes('401') || error.message?.includes('unauthorized')) {
        throw new Error('Session expired. Please login again.');
      }
      throw error;
    }
  },

  /**
   * Pass User (NEW)
   * POST /api/matches/pass
   */
  async passUser(matchId: string): Promise<{status: string, message: string}> {
    if (USE_COFFEE_ML_MOCK) {
      return {status: 'success', message: 'User passed'};
    }
    try {
      const token = await getCoffeeMlToken();
      if (!token) {
        throw new Error('No Coffee-ml authentication token available. Please login again.');
      }

      const response = await coffeeMlApiRequest('/api/matches/pass', 'POST', { match_id: matchId }, token);
      return response;
    } catch (error: any) {
      console.error('Error passing user:', error);
      if (error.status === 500) {
        throw new Error('Pass user feature is temporarily unavailable. Please try again later.');
      }
      if (error.message?.includes('401') || error.message?.includes('unauthorized')) {
        throw new Error('Session expired. Please login again.');
      }
      throw error;
    }
  },

  /**
   * Block User (NEW)
   * POST /api/matches/block
   */
  async blockUser(matchId: string): Promise<{status: string, message: string}> {
    if (USE_COFFEE_ML_MOCK) {
      return {status: 'success', message: 'User blocked'};
    }
    try {
      const token = await getCoffeeMlToken();
      if (!token) {
        throw new Error('No Coffee-ml authentication token available. Please login again.');
      }

      const response = await coffeeMlApiRequest('/api/matches/block', 'POST', { match_id: matchId }, token);
      return response;
    } catch (error: any) {
      console.error('Error blocking user:', error);
      if (error.status === 500) {
        throw new Error('Block user feature is temporarily unavailable. Please try again later.');
      }
      if (error.message?.includes('401') || error.message?.includes('unauthorized')) {
        throw new Error('Session expired. Please login again.');
      }
      throw error;
    }
  },

  /**
   * Legacy function - use getSuggestedMatches() instead
   */
  async getMatches(): Promise<MatchesResponse> {
    return this.getSuggestedMatches();
  },
};
