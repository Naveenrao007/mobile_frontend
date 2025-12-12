// API Configuration
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGIN_WITH_TENANT: '/api/auth/login-with-tenant',
    REFRESH_TOKEN: '/api/auth/refresh-token',
    LOGOUT: '/api/auth/logout',
  },
  HEALTH: {
    BASE: '/health',
    DB: '/health/db',
    FULL: '/health/db/full',
  },
};
