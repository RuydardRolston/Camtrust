/**
 * CamTrust Authentication & User Types
 */

export type UserRole = 'property_owner' | 'professional' | 'administrator';

export interface User {
  id?: string;
  fullName?: string;
  email: string;
  role: UserRole | string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  fullName: string;
  email: string;
  password: string;
  role: UserRole | string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<User>;
  register: (userData: RegisterData) => Promise<User>;
  logout: () => void;
}

export interface ValidationResult {
  isValid: boolean;
  error: string | null;
}

export interface PasswordStrength {
  score: number;
  label: string;
  color: string;
  text: string;
  percent?: string;
}
