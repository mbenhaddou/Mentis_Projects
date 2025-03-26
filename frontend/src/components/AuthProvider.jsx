import React, { useState, useEffect } from 'react';
import AuthContext from '../contexts/authContext';
import authService from '../services/authService';

/**
 * Auth Provider component that wraps the application and provides auth state and functions
 */
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in (on app initialization)
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check if there's a token in localStorage
        const token = localStorage.getItem('mentis_token');
        if (token) {
          // Fetch user data using the existing token
          const userData = await authService.getCurrentUser();
          setUser(userData);
          setIsAuthenticated(true);
        }
      } catch (error) {
        // If error (e.g., token expired), clear local storage
        console.error('Authentication initialization error:', error);
        localStorage.removeItem('mentis_token');
        localStorage.removeItem('mentis_user');
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  /**
   * Login function
   * @param {string} email User email
   * @param {string} password User password
   * @returns {Promise} Promise resolving to user data
   */
  const login = async (email, password) => {
    try {
      const userData = await authService.login(email, password);
      console.log("Auth context: Login successful, user data:", userData);

      // Update state
      setUser(userData);
      setIsAuthenticated(true);

      return userData;
    } catch (error) {
      console.error('Login error in auth context:', error);
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    }
  };

  /**
   * Logout function
   */
  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  /**
   * Register function
   * @param {Object} userData User registration data
   * @returns {Promise} Promise resolving to the created user
   */
  const register = async (userData) => {
    try {
      const newUser = await authService.register(userData);
      return newUser;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  /**
   * Update user profile
   * @param {Object} userData Updated user data
   * @returns {Promise} Promise resolving to updated user
   */
  const updateProfile = async (userData) => {
    try {
      const updatedUser = await authService.updateProfile(userData);
      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  // Value to be provided to consumers
  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    register,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;