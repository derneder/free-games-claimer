/**
 * Authentication Service
 *
 * Handles authentication API calls.
 */

import api from './api';

export const authService = {
  /**
   * Register new user
   */
  async register(email, username, password) {
    const response = await api.post('/auth/register', {
      email,
      username,
      password,
    });
    return response.data;
  },

  /**
   * Login user
   */
  async login(email, password) {
    const response = await api.post('/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  /**
   * Get user profile
   */
  async getProfile() {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  /**
   * Logout user
   */
  async logout() {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  /**
   * Setup 2FA
   */
  async setup2FA() {
    const response = await api.post('/auth/2fa/setup');
    return response.data;
  },

  /**
   * Verify 2FA token
   */
  async verify2FA(token) {
    const response = await api.post('/auth/2fa/verify', { token });
    return response.data;
  },
};
