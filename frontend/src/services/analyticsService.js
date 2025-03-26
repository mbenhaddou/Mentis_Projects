import api from './api';

/**
 * Service for handling analytics API calls to the backend
 */
const analyticsService = {
  /**
   * Get project analytics data
   * @returns {Promise} Promise with project analytics data
   */
  async getProjectsAnalytics() {
    try {
      const response = await api.get('/analytics/projects');
      return response.data;
    } catch (error) {
      console.error('Error fetching project analytics:', error);
      throw error; // Re-throw to allow the component to handle it
    }
  },

  /**
   * Get user analytics data
   * @returns {Promise} Promise with user analytics data
   */
  async getUsersAnalytics() {
    try {
      const response = await api.get('/analytics/users');
      return response.data;
    } catch (error) {
      console.error('Error fetching user analytics:', error);
      throw error;
    }
  },

  /**
   * Get complete analytics dashboard data
   * @returns {Promise} Promise with combined analytics data
   */
  async getDashboardAnalytics() {
    try {
      const response = await api.get('/analytics/dashboard');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard analytics:', error);
      throw error;
    }
  },

  /**
   * Get project-specific analytics
   * @param {string} projectId - Project ID
   * @returns {Promise} Promise with project-specific analytics
   */
  async getProjectAnalytics(projectId) {
    try {
      const response = await api.get(`/projects/${projectId}/analytics`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching analytics for project ${projectId}:`, error);
      throw error;
    }
  },

  /**
   * Get user-specific analytics
   * @param {string} userId - User ID
   * @returns {Promise} Promise with user-specific analytics
   */
  async getUserAnalytics(userId) {
    try {
      const response = await api.get(`/users/${userId}/analytics`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching analytics for user ${userId}:`, error);
      throw error;
    }
  },

  /**
   * Get analytics for a specific date range
   * @param {string} startDate - Start date (YYYY-MM-DD)
   * @param {string} endDate - End date (YYYY-MM-DD)
   * @returns {Promise} Promise with date-range analytics data
   */
  async getDateRangeAnalytics(startDate, endDate) {
    try {
      const response = await api.get('/analytics/date-range', {
        params: { start_date: startDate, end_date: endDate }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching date range analytics:', error);
      throw error;
    }
  }
};

export default analyticsService;