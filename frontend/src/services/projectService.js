import api from './api';

/**
 * Project service for handling project-related API calls
 */
const projectService = {
  /**
   * Get all projects
   * @param {object} filters Optional filters (status, skip, limit)
   * @returns {Promise} Promise with projects data
   */
  async getProjects(filters = {}) {
    const params = new URLSearchParams();

    // Add filters to params if provided
    if (filters.status) params.append('status', filters.status);
    if (filters.skip) params.append('skip', filters.skip);
    if (filters.limit) params.append('limit', filters.limit);

    const response = await api.get('/projects/', { params });
    return response.data;
  },

  /**
   * Get projects where current user is a member
   * @param {object} filters Optional filters (skip, limit)
   * @returns {Promise} Promise with projects data
   */
  async getMyProjects(filters = {}) {
    const params = new URLSearchParams();

    // Set my_projects flag
    params.append('my_projects', true);

    // Add optional filters
    if (filters.skip) params.append('skip', filters.skip);
    if (filters.limit) params.append('limit', filters.limit);

    const response = await api.get('/projects/', { params });
    return response.data;
  },

  /**
   * Get a specific project by ID
   * @param {string} id Project ID
   * @returns {Promise} Promise with project data
   */
  async getProject(id) {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },

  /**
   * Create a new project
   * @param {object} projectData Project data
   * @returns {Promise} Promise with created project data
   */
async createProject(projectData) {
  try {
    console.log('Sending project data:', projectData);
    const response = await api.post('/projects/', projectData);
    console.log('Project created successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Project creation failed:', error.response?.data || error.message);
    throw error;
  }
},
  /**
   * Update a project
   * @param {string} id Project ID
   * @param {object} projectData Project data to update
   * @returns {Promise} Promise with updated project data
   */
  async updateProject(id, projectData) {
    const response = await api.put(`/projects/${id}`, projectData);
    return response.data;
  },

  /**
   * Delete a project
   * @param {string} id Project ID
   * @returns {Promise} Promise with response
   */
  async deleteProject(id) {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
  },

  /**
   * Get tasks for a project
   * @param {string} projectId Project ID
   * @returns {Promise} Promise with tasks data
   */
  async getProjectTasks(projectId) {
    const response = await api.get(`/projects/${projectId}/tasks`);
    return response.data;
  },

  /**
   * Get weekly updates for a project
   * @param {string} projectId Project ID
   * @returns {Promise} Promise with updates data
   */
  async getProjectUpdates(projectId) {
    const response = await api.get(`/projects/${projectId}/updates`);
    return response.data;
  },

  /**
   * Add team member to project
   * @param {string} projectId Project ID
   * @param {string} userId User ID
   * @param {string} role Member role
   * @returns {Promise} Promise with response
   */
  async addTeamMember(projectId, userId, role = 'Team Member') {
    const response = await api.post(`/projects/${projectId}/members/${userId}?role=${role}`);
    return response.data;
  },

  /**
   * Remove team member from project
   * @param {string} projectId Project ID
   * @param {string} userId User ID
   * @returns {Promise} Promise with response
   */
  async removeTeamMember(projectId, userId) {
    const response = await api.delete(`/projects/${projectId}/members/${userId}`);
    return response.data;
  }
};

export default projectService;