/**
 * Admin Service
 *
 * Handles admin API calls.
 */

import api from './api';

export const adminService = {
  /**
   * Get system statistics
   */
  async getSystemStats() {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  /**
   * Get all users
   */
  async getUsers(page = 1, pageSize = 20) {
    const response = await api.get('/admin/users', {
      params: { page, pageSize },
    });
    return response.data;
  },

  /**
   * Get user details
   */
  async getUser(userId) {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data;
  },

  /**
   * Deactivate user
   */
  async deactivateUser(userId) {
    const response = await api.post(`/admin/users/${userId}/deactivate`);
    return response.data;
  },

  /**
   * Activate user
   */
  async activateUser(userId) {
    const response = await api.post(`/admin/users/${userId}/activate`);
    return response.data;
  },

  /**
   * Get activity logs
   */
  async getActivityLogs(page = 1, pageSize = 50) {
    const response = await api.get('/admin/activity-logs', {
      params: { page, pageSize },
    });
    return response.data;
  },

  /**
   * Get user activity logs
   */
  async getUserActivityLogs(userId, page = 1, pageSize = 50) {
    const response = await api.get(`/admin/activity-logs/${userId}`, {
      params: { page, pageSize },
    });
    return response.data;
  },
};
