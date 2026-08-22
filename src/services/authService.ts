/**
 * CamTrust Authentication Service
 */

import api, { ApiError } from './api';
import { User, LoginCredentials, RegisterData, AuthResponse } from '../types';

const TOKEN_KEY = 'camtrust_token';
const USER_KEY = 'camtrust_user';

export const authService = {
  login: async ({ email, password, rememberMe = false }: LoginCredentials): Promise<AuthResponse> => {
    try {
      const data = await api.post<AuthResponse>('/auth/login', { email, password });
      const storage = rememberMe ? localStorage : sessionStorage;
      if (data.token) storage.setItem(TOKEN_KEY, data.token);
      if (data.user) storage.setItem(USER_KEY, JSON.stringify(data.user));
      return data;
    } catch (err: unknown) {
      const error = err as ApiError;
      if (error.status === 0) {
        // Dev fallback simulation
        await new Promise((r) => setTimeout(r, 600));
        const user: User = { email, role: 'property_owner' };
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem(TOKEN_KEY, 'mock_token');
        storage.setItem(USER_KEY, JSON.stringify(user));
        return { user, token: 'mock_token' };
      }
      throw error;
    }
  },

  register: async ({ fullName, email, password, role }: RegisterData): Promise<AuthResponse> => {
    try {
      const data = await api.post<AuthResponse>('/auth/register', { fullName, email, password, role });
      if (data.token) localStorage.setItem(TOKEN_KEY, data.token);
      if (data.user) localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      return data;
    } catch (err: unknown) {
      const error = err as ApiError;
      if (error.status === 0) {
        await new Promise((r) => setTimeout(r, 600));
        const user: User = { fullName, email, role };
        localStorage.setItem(TOKEN_KEY, 'mock_token');
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        return { user, token: 'mock_token' };
      }
      throw error;
    }
  },

  logout: (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  },

  getStoredUser: (): User | null => {
    try {
      const user = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
      return user ? (JSON.parse(user) as User) : null;
    } catch {
      return null;
    }
  },
};

export default authService;
