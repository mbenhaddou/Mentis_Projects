import axios from 'axios';

// Get the API URL from environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

/**
 * Create axios instance with base URL and default headers
 */
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Add request interceptor to add authorization header
 */
api.interceptors.request.use(
  (config) => {
      console.log('Request:', config.method.toUpperCase(), config.url, config.data);

    // Get token from local storage
    const token = localStorage.getItem('mentis_token');

    // Add token to request header if available
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Add response interceptor to handle token expiration
 */
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 (Unauthorized) and not a retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        const refreshResponse = await axios.post(`${API_URL}/auth/refresh`, {}, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('mentis_token')}`
          }
        });

        // If refresh successful, update token and retry
        if (refreshResponse.data.access_token) {
          localStorage.setItem('mentis_token', refreshResponse.data.access_token);
          api.defaults.headers.common['Authorization'] = `Bearer ${refreshResponse.data.access_token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, logout user (clear storage)
        localStorage.removeItem('mentis_token');
        localStorage.removeItem('mentis_user');

        // Redirect to login page
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;