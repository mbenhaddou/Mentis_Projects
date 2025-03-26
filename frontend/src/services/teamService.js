import api from './api';

/**
 * Service for handling team-related API calls
 */
const teamService = {
  /**
   * Get all team members
   * @param {Object} params Optional parameters (search, role, skip, limit)
   * @returns {Promise} Promise with team members data
   */
  async getTeamMembers(params = {}) {
    try {
      const response = await api.get('/team', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching team members:', error);
      throw error;
    }
  },

  /**
   * Get a specific team member by ID
   * @param {string} userId User ID
   * @returns {Promise} Promise with team member data
   */
  async getTeamMember(userId) {
    try {
      const response = await api.get(`/team/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching team member ${userId}:`, error);
      throw error;
    }
  },

  /**
   * Get statistics for a team member
   * @param {string} userId User ID
   * @returns {Promise} Promise with team member statistics
   */
  async getTeamMemberStats(userId) {
    try {
      const response = await api.get(`/team/${userId}/stats`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching statistics for team member ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get statistics for a team member
   * @param {string} userId - User ID
   * @returns {Promise} Promise with team member stats
   */
  async getTeamMemberStats(userId) {
    try {
      const response = await api.get(`/team/${userId}/stats`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching stats for team member ${userId}:`, error);
      throw error;
    }
  },

  /**
   * Get team member projects
   * @param {string} userId - User ID
   * @returns {Promise} Promise with team member projects
   */
  async getTeamMemberProjects(userId) {
    try {
      const response = await api.get(`/users/${userId}/projects`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching projects for team member ${userId}:`, error);
      throw error;
    }
  },

  /**
   * Search team members
   * @param {string} query - Search query
   * @returns {Promise} Promise with search results
   */
  async searchTeamMembers(query) {
    try {
      const response = await api.get('/team', {
        params: { search: query }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching team members:', error);
      throw error;
    }
  }
};

export default teamService;