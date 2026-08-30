/**
 * CamTrust Axios API Client
 * Configured with base URL, authentication headers, and error interceptors.
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
const BASE_URL =
  (typeof import.meta !== 'undefined' &&
    import.meta.env?.MODE === 'production' &&
    import.meta.env?.VITE_API_URL) ||
  '/api';

export interface ApiError {
  message: string;
  status?: number;
  errors?: Record<string, string> | string[];
}

export const TOKEN_KEY = 'camtrust_token';
export const USER_KEY = 'camtrust_user';

export const getAuthToken = (): string | null => {
  return (
    localStorage.getItem(TOKEN_KEY) ||
    sessionStorage.getItem(TOKEN_KEY) ||
    localStorage.getItem('token') ||
    sessionStorage.getItem('token')
  );
};

export const setAuthToken = (token: string, remember: boolean = true): void => {
  if (remember) {
    localStorage.setItem(TOKEN_KEY, token);
    sessionStorage.removeItem(TOKEN_KEY);
  } else {
    sessionStorage.setItem(TOKEN_KEY, token);
    localStorage.removeItem(TOKEN_KEY);
  }
};

export const clearAuthSession = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem('token');
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
  sessionStorage.removeItem('token');
};

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor: Attach JWT token if present
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAuthToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Extract errors and handle auth failures
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; error?: string; errors?: Record<string, string> }>) => {
    const status = error.response?.status;
    const responseData = error.response?.data;
    const isAuthEndpoint =
      error.config?.url?.includes('/login') ||
      error.config?.url?.includes('/signup');

    // If unauthorized and not on login/signup, purge tokens and redirect
    if (status === 401 && !isAuthEndpoint) {
      clearAuthSession();
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    const message =
      responseData?.message ||
      responseData?.error ||
      error.message ||
      'An unexpected error occurred. Please try again.';

    const formattedError: ApiError = {
      message,
      status: status || 0,
      errors: responseData?.errors,
    };

    return Promise.reject(formattedError);
  }
);

export default api;