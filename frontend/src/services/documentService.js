import api from './api';

/**
 * Document service for managing document uploads
 */
const documentService = {
  /**
   * Get documents for a project
   * @param {string} projectId Project ID
   * @returns {Promise} Promise with documents array
   */
  async getProjectDocuments(projectId) {
    const response = await api.get(`/projects/${projectId}/documents`);
    return response.data;
  },

  /**
   * Get a specific document by ID
   * @param {string} id Document ID
   * @returns {Promise} Promise with document data
   */
  async getDocument(id) {
    const response = await api.get(`/documents/${id}`);
    return response.data;
  },

  /**
   * Upload a document for a project
   * @param {string} projectId Project ID
   * @param {File} file File to upload
   * @param {string} name Optional document name (defaults to filename)
   * @returns {Promise} Promise with created document
   */
  async uploadDocument(projectId, file, name = null) {
    // Create form data
    const formData = new FormData();
    formData.append('file', file);

    if (name) {
      formData.append('name', name);
    }

    const response = await api.post(`/projects/${projectId}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  /**
   * Update a document (name only)
   * @param {string} id Document ID
   * @param {string} name New document name
   * @returns {Promise} Promise with updated document
   */
  async updateDocument(id, name) {
    const response = await api.put(`/documents/${id}`, { name });
    return response.data;
  },

  /**
   * Delete a document
   * @param {string} id Document ID
   * @returns {Promise} Promise
   */
  async deleteDocument(id) {
    return await api.delete(`/documents/${id}`);
  }
};

export default documentService;