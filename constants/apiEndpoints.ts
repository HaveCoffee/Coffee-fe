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
  
  // Profile endpoints
  PROFILE: {
    GET_PROFILE: '/api/profile',
    UPDATE_PROFILE: '/api/profile',
  },

  // Matches endpoints
  MATCHES: {
    GET_MATCHES: '/api/matches',
  },

  // Users endpoints
  USERS: {
    GET_USER: (userId: string) => `/api/users/${userId}`,
  },

  // Chat endpoints
  CHAT: {
    SEND_MESSAGE: '/chat',
  }
};

export default API_ENDPOINTS;