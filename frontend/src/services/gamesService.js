/**
 * Games Service
 * 
 * Handles games API calls.
 */

import api from './api';

export const gamesService = {
  /**
   * Get user's games
   */
  async getGames(page = 1, pageSize = 20) {
    const response = await api.get('/games', {
      params: { page, pageSize },
    });
    return response.data;
  },

  /**
   * Get single game
   */
  async getGame(id) {
    const response = await api.get(`/games/${id}`);
    return response.data;
  },

  /**
   * Add new game
   */
  async addGame(gameData) {
    const response = await api.post('/games', gameData);
    return response.data;
  },

  /**
   * Delete game
   */
  async deleteGame(id) {
    const response = await api.delete(`/games/${id}`);
    return response.data;
  },

  /**
   * Get games statistics
   */
  async getStats() {
    const response = await api.get('/games/stats/summary');
    return response.data;
  },
};
