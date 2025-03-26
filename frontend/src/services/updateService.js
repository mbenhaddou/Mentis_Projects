import api from './api';

/**
 * Update service for managing weekly updates
 */
const updateService = {
  /**
   * Get a specific update by ID
   * @param {string} updateId - Update ID
   * @returns {Promise} Promise with update data
   */
  async getUpdate(updateId) {
    try {
      const response = await api.get(`/projects/updates/${updateId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching update ${updateId}:`, error);
      throw error;
    }
  },

  /**
   * Get all updates for a project
   * @param {string} projectId - Project ID
   * @param {Object} params - Optional parameters
   * @returns {Promise} Promise with updates data
   */
  async getProjectUpdates(projectId, params = {}) {
    try {
      const response = await api.get(`/projects/${projectId}/updates`, { params });
      return response.data;
    } catch (error) {
      console.error(`Error fetching updates for project ${projectId}:`, error);
      throw error;
    }
  },

  /**
   * Create a new update for a project
   * @param {string} projectId - Project ID
   * @param {Object} updateData - Update data
   * @param {boolean} generateAiSummary - Whether to generate AI summary
   * @returns {Promise} Promise with created update
   */
  async createProjectUpdate(projectId, updateData, generateAiSummary = true) {
    try {
      const response = await api.post(`/projects/${projectId}/updates`, updateData, {
        params: { generate_ai_summary: generateAiSummary }
      });
      return response.data;
    } catch (error) {
      console.error(`Error creating update for project ${projectId}:`, error);
      throw error;
    }
  },

  /**
   * Update an existing update
   * @param {string} updateId - Update ID
   * @param {Object} updateData - Updated data
   * @param {boolean} regenerateAiSummary - Whether to regenerate AI summary
   * @returns {Promise} Promise with updated update
   */
async updateUpdate(updateId, updateData, regenerateAiSummary = false) {
  try {
    // Create clean payload
    const cleanPayload = {};

    // Handle date conversion explicitly
    if (updateData.date) {
      cleanPayload.date = updateData.date; // Keep as is, ensure it's YYYY-MM-DD format
    }

    if (updateData.status) {
      cleanPayload.status = updateData.status;
    }

    if (updateData.notes) {
      cleanPayload.notes = updateData.notes;
    }

    // Don't include ai_summary unless explicitly needed

    console.log('Final update payload:', cleanPayload);

    const response = await api.put(`/projects/updates/${updateId}`, cleanPayload, {
      params: { regenerate_ai_summary: regenerateAiSummary }
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating update ${updateId}:`, error);
    throw error;
  }
},

  /**
   * Update an existing update (project-specific endpoint)
   * @param {string} projectId - Project ID
   * @param {string} updateId - Update ID
   * @param {Object} updateData - Updated data
   * @returns {Promise} Promise with updated update
   */
  async updateProjectUpdate(projectId, updateId, updateData) {
    try {
      const response = await api.put(`/projects/${projectId}/updates/${updateId}`, updateData);
      return response.data;
    } catch (error) {
      console.error(`Error updating update ${updateId} in project ${projectId}:`, error);
      throw error;
    }
  },

  /**
   * Delete an update
   * @param {string} updateId - Update ID
   * @returns {Promise} Promise with deletion status
   */
  async deleteUpdate(updateId) {
    try {
      await api.delete(`/projects/updates/${updateId}`);
      return { success: true };
    } catch (error) {
      console.error(`Error deleting update ${updateId}:`, error);
      throw error;
    }
  },

  /**
   * Delete an update (project-specific endpoint)
   * @param {string} projectId - Project ID
   * @param {string} updateId - Update ID
   * @returns {Promise} Promise with deletion status
   */
  async deleteProjectUpdate(projectId, updateId) {
    try {
      await api.delete(`/projects/${projectId}/updates/${updateId}`);
      return { success: true };
    } catch (error) {
      console.error(`Error deleting update ${updateId} from project ${projectId}:`, error);
      throw error;
    }
  },

  /**
   * Generate AI summary for an update
   * @param {string} updateId - Update ID
   * @returns {Promise} Promise with updated data including AI summary
   */
  async generateAiSummary(updateId) {
    try {
      const response = await api.post(`/projects/updates/${updateId}/generate-summary`);
      return response.data;
    } catch (error) {
      console.error(`Error generating AI summary for update ${updateId}:`, error);
      throw error;
    }
  }
};

export default updateService;