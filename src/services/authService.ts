/**
 * CamTrust Authentication Service
 * Communicates with backend authentication endpoints via Axios.
 */

import api, { USER_KEY, getAuthToken, setAuthToken, clearAuthSession } from './api';
import { User, LoginCredentials, RegisterData, AuthResponse } from '../types';

export const authService = {
  /**
   * Log in user with email & password
   */
  login: async ({ email, password, rememberMe = true }: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/users/login', { email, password });
    const data = response.data;

    if (data.token) {
      setAuthToken(data.token, rememberMe);
    }

    if (data.user) {
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem(USER_KEY, JSON.stringify(data.user));
    }

    return data;
  },

  /**
   * Register a new user account
   */
  register: async ({ fullName, email, password, confirmPassword, role }: RegisterData): Promise<AuthResponse> => {
    const payload = {
      fullName,
      email,
      password,
      confirmPassword: confirmPassword || password,
      role,
    };

    const response = await api.post<AuthResponse>('/users/signup', payload);
    const data = response.data;

    if (data.token) {
      setAuthToken(data.token, true);
    }

    if (data.user) {
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    }

    return data;
  },

  /**
   * Log out the current user and clear local session state
   */
  logout: (): void => {
    clearAuthSession();
  },

  /**
   * Retrieve currently saved user object from storage
   */
  getStoredUser: (): User | null => {
    try {
      const userStr = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
      return userStr ? (JSON.parse(userStr) as User) : null;
    } catch {
      return null;
    }
  },

  /**
   * Check if a valid auth token is currently present
   */
  isAuthenticated: (): boolean => {
    return Boolean(getAuthToken());
  },

  /**
   * Get raw token string
   */
  getToken: (): string | null => {
    return getAuthToken();
  },
};

export default authService;
