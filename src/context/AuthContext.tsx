/**
 * CamTrust Authentication Context
 */

import { createContext, useState, useEffect, ReactNode } from 'react';
import authService from '../services/authService';
import { User, LoginCredentials, RegisterData, AuthContextType } from '../types';

export const AuthContext = createContext<AuthContextType | null>(null);

export interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const stored = authService.getStoredUser();
    if (stored) setUser(stored);
    setLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials): Promise<User> => {
    const res = await authService.login(credentials);
    setUser(res.user);
    return res.user;
  };

  const register = async (userData: RegisterData): Promise<User> => {
    const res = await authService.register(userData);
    setUser(res.user);
    return res.user;
  };

  const logout = (): void => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: Boolean(user), loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
