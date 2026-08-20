/**
 * CamTrust API Client
 */

const API_BASE_URL = (import.meta as unknown as { env: Record<string, string> }).env?.VITE_API_URL || 'http://localhost:5000/api';

export interface ApiError extends Error {
  status?: number;
}

export const request = async <T = unknown>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem('camtrust_token') || sessionStorage.getItem('camtrust_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string>),
  };

  try {
    const response = await fetch(url, { ...options, headers });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message = data.message || (response.status === 401 ? 'Invalid email or password.' : 'An error occurred.');
      const error: ApiError = new Error(message);
      error.status = response.status;
      throw error;
    }
    return data as T;
  } catch (error: unknown) {
    if ((error as ApiError).status !== undefined) throw error;
    const netErr: ApiError = new Error('Unable to connect to the server. Please try again.');
    netErr.status = 0;
    throw netErr;
  }
};

export const api = {
  post: <T = unknown>(endpoint: string, body: unknown): Promise<T> =>
    request<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  get: <T = unknown>(endpoint: string): Promise<T> =>
    request<T>(endpoint, { method: 'GET' }),
};

export default api;
