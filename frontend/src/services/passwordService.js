import api from './api';

/**
 * Password reset service
 */
const passwordService = {
  /**
   * Request a password reset email
   * @param {string} email User email
   * @returns {Promise} Promise with response
   */
  async requestReset(email) {
    const response = await api.post('/password/request-reset', { email });
    return response.data;
  },

  /**
   * Reset password using token
   * @param {string} token Reset token
   * @param {string} newPassword New password
   * @returns {Promise} Promise with response
   */
  async resetPassword(token, newPassword) {
    const response = await api.post('/password/reset', {
      token,
      new_password: newPassword
    });
    return response.data;
  }
};

export default passwordService;