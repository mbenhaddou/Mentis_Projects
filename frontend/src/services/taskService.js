// frontend/src/services/taskService.js
import api from './api';

const taskService = {
  /**
   * Get tasks for a project
   * @param {string} projectId - Project ID
   * @param {Object} params - Optional parameters (skip, limit, status)
   * @returns {Promise} Promise with tasks data
   */
  async getProjectTasks(projectId, params = {}) {
    if (!projectId) {
        console.error("getProjectTasks called with invalid projectId:", projectId);
        return [];
      }

      try {
        console.log(`Fetching tasks for project ID: ${projectId}`);
        const response = await api.get(`/projects/${projectId}/tasks`);
        console.log("Project tasks API response:", response);
        return response.data;
      } catch (error) {
        console.error(`Error fetching tasks for project ${projectId}:`, error);
        throw error;
      }
  },



/**
 * Get a task by ID
 * @param {string} taskId - Task ID
 * @returns {Promise} Promise with task data
 */
async getTask(taskId) {
  try {
    const response = await api.get(`/tasks/${taskId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching task ${taskId}:`, error);
    throw error;
  }
},


  /**
   * Get tasks assigned to current user
   * @param {Object} params - Optional parameters (skip, limit, status)
   * @returns {Promise} Promise with tasks data
   */
  async getMyTasks(params = {}) {
    const response = await api.get('/tasks', {
      params: {
        ...params,
        assigned_to_me: true
      }
    });
    return response.data;
  },

  /**
   * Create a new task
   * @param {Object} taskData - Task data
   * @returns {Promise} Promise with created task
   */
  async createTask(taskData) {
    try {
    const response = await api.post('/tasks/', taskData);
    return response.data;
  } catch (error) {
    console.error('Task creation error:', error.response?.data || error);
    throw error;
  }
  },

  /**
   * Update a task
   * @param {string} taskId - Task ID
   * @param {Object} taskData - Updated task data
   * @returns {Promise} Promise with updated task
   */
  async updateTask(taskId, taskData) {
    const response = await api.put(`/tasks/${taskId}`, taskData);
    return response.data;
  },



/**
   * Update task status
   * @param {string} taskId - Task ID
   * @param {string} status - New status
   * @returns {Promise} Promise with updated task
   */
  async updateTaskStatus(taskId, status) {
    try {
      const response = await api.patch(`/tasks/${taskId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating task status:', error);
      throw error;
    }
  },

  /**
   * Delete a task
   * @param {string} taskId - Task ID
   * @returns {Promise} Promise with deleted status
   */
  async deleteTask(taskId) {
    const response = await api.delete(`/tasks/${taskId}`);
    return response.data;
  },

  /**
   * Assign a task to a user
   * @param {string} taskId - Task ID
   * @param {string} userId - User ID (optional, if null assigns to current user)
   * @returns {Promise} Promise with updated task
   */
  async assignTask(taskId, userId = null) {
    const response = await api.post(`/tasks/${taskId}/assign`, { user_id: userId });
    return response.data;
  }
};

/**
 * Enhanced getTask function with better error handling and debugging
 * @param {string|number} taskId - The task ID
 * @returns {Promise} - The task object or null if not found
 */
const getTask = async (taskId) => {
  // Normalize ID to string
  const normalizedId = String(taskId);

  console.log(`taskService.getTask called with ID: ${normalizedId} (original type: ${typeof taskId})`);

  try {
    // Log the actual URL being called
    const url = `/tasks/${normalizedId}`;
    console.log(`Making API call to: ${url}`);

    const response = await api.get(url);
    console.log(`Task API response for ID ${normalizedId}:`, response.data);
    return response.data;
  } catch (error) {
    // Enhanced error logging with response data if available
    console.error(`Error fetching task ${normalizedId}:`,
      error.response ? {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      } : error.message || error
    );

    // Return null instead of throwing to allow for batch operations
    return null;
  }
};

// Add these debug helpers to investigate task ID issues
const debugTaskService = {
  // Test different ID formats to see which works
  testTaskIdFormats: async (baseId) => {
    console.log("Testing different task ID formats:");

    const formats = [
      { type: "original", id: baseId },
      { type: "string", id: String(baseId) },
      { type: "number", id: Number(baseId) },
      { type: "trimmed", id: String(baseId).trim() }
    ];

    for (const format of formats) {
      try {
        console.log(`Trying ${format.type} format: ${format.id}`);
        const result = await getTask(format.id);
        console.log(`Result with ${format.type} format:`, result ? "SUCCESS" : "NULL");
      } catch (err) {
        console.error(`Error with ${format.type} format:`, err.message);
      }
    }
  }
};

// Export the debug helper along with regular functions
export { debugTaskService };

export default taskService;