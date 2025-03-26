import api from './api';

// Local storage keys
const TOKEN_KEY = 'mentis_token';
const USER_KEY = 'mentis_user';

/**
 * Authentication service
 */
const authService = {
  /**
   * Login user and store token in local storage
   * @param {string} email User email
   * @param {string} password User password
   * @returns {Promise} Promise with user data
   */
  async login(email, password) {
    // Convert to form data for FastAPI OAuth2 endpoint
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);

    const response = await api.post('/auth/login', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // Store token in local storage
    if (response.data.access_token) {
      localStorage.setItem(TOKEN_KEY, response.data.access_token);

      // Get user info
      const userResponse = await this.getCurrentUser();
      return userResponse;
    }

    return null;
  },

  /**
   * Register a new user
   * @param {Object} userData User data (email, password, name, role)
   * @returns {Promise} Promise with user data
   */
  async register(userData) {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  /**
   * Get current authenticated user
   * @returns {Promise} Promise with user data
   */
  async getCurrentUser() {
    const response = await api.get('/auth/me');
    const userData = response.data;

    // Store user in local storage
    localStorage.setItem(USER_KEY, JSON.stringify(userData));

    return userData;
  },

  /**
   * Refresh the JWT token
   * @returns {Promise} Promise with new token
   */
  async refreshToken() {
    const response = await api.post('/auth/refresh');

    if (response.data.access_token) {
      localStorage.setItem(TOKEN_KEY, response.data.access_token);
    }

    return response.data;
  },

  /**
   * Logout user and remove token from local storage
   */
  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  /**
   * Get current token from local storage
   * @returns {string|null} Token or null if not logged in
   */
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  /**
   * Get current user from local storage
   * @returns {Object|null} User data or null if not logged in
   */
  getUser() {
    const userStr = localStorage.getItem(USER_KEY);
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  },

  /**
   * Check if user is logged in
   * @returns {boolean} True if logged in
   */
  isLoggedIn() {
    return !!this.getToken();
  },

  /**
   * Check if user has specific role
   * @param {string} role Role to check
   * @returns {boolean} True if user has role
   */
  hasRole(role) {
    const user = this.getUser();
    return user && user.role === role;
  },
};

export default authService;