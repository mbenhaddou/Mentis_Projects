import api from './api';

/**
 * User service for handling user-related API calls
 */
const userService = {
  /**
   * Get all users
   * @param {object} filters Optional filters (role, skip, limit)
   * @returns {Promise} Promise with users data
   */
  async getUsers(filters = {}) {
    const params = new URLSearchParams();

    // Add filters to params if provided
    if (filters.role) params.append('role', filters.role);
    if (filters.skip) params.append('skip', filters.skip);
    if (filters.limit) params.append('limit', filters.limit);

    const response = await api.get('/users/', { params });
    return response.data;
  },

  /**
   * Get a specific user by ID
   * @param {string} id User ID
   * @returns {Promise} Promise with user data
   */
  async getUser(id) {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  /**
   * Create a new user
   * @param {object} userData User data (name, email, password, role)
   * @returns {Promise} Promise with created user data
   */
  async createUser(userData) {
    const response = await api.post('/users/', userData);
    return response.data;
  },

  /**
   * Update a user
   * @param {string} id User ID
   * @param {object} userData User data to update
   * @returns {Promise} Promise with updated user data
   */
  async updateUser(id, userData) {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  /**
   * Delete a user
   * @param {string} id User ID
   * @returns {Promise} Promise with response
   */
  async deleteUser(id) {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },


  /**
   * Activate or deactivate a user
   * @param {string} id User ID
   * @param {boolean} isActive Whether to activate (true) or deactivate (false)
   * @returns {Promise} Promise with updated user data
   */
  async setUserActive(id, isActive) {
    const userData = { is_active: isActive };
    return this.updateUser(id, userData);
  },  // <-- Added comma here

  /**
   * Add a user to a project
   * @param {string} projectId - Project ID
   * @param {string} userId - User ID
   * @param {string} role - Project role
   * @returns {Promise} Promise with response
   */
  async addUserToProject(projectId, userId, role = 'Team Member') {
    const response = await api.post(`/projects/${projectId}/members`, {
      user_id: userId,
      role: role
    });
    return response.data;
  },

  /**
   * Remove a user from a project
   * @param {string} projectId - Project ID
   * @param {string} userId - User ID
   * @returns {Promise} Promise with response
   */
  async removeUserFromProject(projectId, userId) {
    const response = await api.delete(`/projects/${projectId}/members/${userId}`);
    return response.data;
  },
/**
   * Change user's system role
   * @param {string} id User ID
   * @param {string} role New role (Admin, Manager, Contributor)
   * @returns {Promise} Promise with updated user data
   */
  async changeUserSystemRole(id, role) {
    const userData = { role };
    return this.updateUser(id, userData);
  },


  /**
   * Change a user's role within a project context
   * @param {string} projectId - Project ID
   * @param {string} userId - User ID
   * @param {string} newRole - New project role
   * @returns {Promise} Promise with updated project member data
   */
  async changeProjectMemberRole(projectId, userId, newRole) {
    const response = await api.put(`/projects/${projectId}/members/${userId}/role`, {
      role: newRole
    });
    return response.data;
  },

  /**
   * Get all project members
   * @param {string} projectId - Project ID
   * @returns {Promise} Promise with project members
   */
  async getProjectMembers(projectId) {
    const response = await api.get(`/projects/${projectId}/members`);
    return response.data;
  }
};

export default userService;

