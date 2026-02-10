// constants/apiEndpoints.ts
const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    SIGNUP_INIT: '/auth/signup/init',
    SIGNUP_VERIFY: '/auth/signup/verify',
    LOGIN_INIT: '/auth/login/init',
    LOGIN_VERIFY: '/auth/login/verify',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
  },
  
  // User endpoints
  USER: {
    GET_ME: '/me',
    UPDATE_ME: '/me',
  },
  
  // Profile endpoints
  PROFILE: {
    GET_PROFILE: '/api/profile',
    UPDATE_PROFILE: '/api/profile',
  },

  // Matches endpoints
  MATCHES: {
    GET_SUGGESTED: '/api/matches/suggested',
    GET_ACTIVE: '/api/matches/active',
    START_CHAT: '/api/matches/start-chat',
    PASS: '/api/matches/pass',
    BLOCK: '/api/matches/block',
  },

  // Users endpoints
  USERS: {
    GET_USER: (userId: string) => `/api/users/${userId}`,
  },

  // Chat endpoints
  CHAT: {
    SEND_MESSAGE: '/chat',
  },

  // User-to-User Chat endpoints
  USER_CHAT: {
    GET_MESSAGES: (userId: string) => `/chat/${userId}`,
    SEND_MESSAGE: (userId: string) => `/chat/${userId}`,
    MARK_READ: (userId: string) => `/chat/${userId}/read`,
  }
};

export default API_ENDPOINTS;