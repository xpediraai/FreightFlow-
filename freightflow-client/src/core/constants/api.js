export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://13.62.128.158/api';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me',
    LOGOUT: '/auth/logout',
  },
};
