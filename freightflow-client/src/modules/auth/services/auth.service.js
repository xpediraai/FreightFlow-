import axiosInstance from '../../../core/api/axios/instance';

export const authService = {
  /**
   * Login user with email and password
   * @param {string} email 
   * @param {string} password 
   * @returns {Promise} Resolves with user and tokens
   */
  login: async (email, password) => {
    const response = await axiosInstance.post('/auth/login', { email, password });
    // The backend wraps responses in a { code, message, data } envelope.
    // We return response.data so the components get the actual user/tokens payload.
    return response.data || response;
  },

  /**
   * Optional: Validate current token with backend
   */
  me: async () => {
    return await axiosInstance.get('/auth/me');
  }
};
