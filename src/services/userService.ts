/**
 * CamTrust User Service
 * Provides Axios API methods for managing user accounts.
 */

import api from './api';
import { User } from '../types';

export interface UsersResponse {
  message: string;
  users: User[];
}

export interface SingleUserResponse {
  message: string;
  user: User;
}

export interface UpdateUserData {
  fullName?: string;
  email?: string;
  role?: string;
  password?: string;
  phone?: string;
  address?: string;
  specialty?: string;
  status?: string;
  employeeId?: string;
  verified?: boolean;
}

export const userService = {
  /**
   * Fetch all registered users (admin / professional listing)
   */
  getAllUsers: async (): Promise<User[]> => {
    const response = await api.get<UsersResponse>('/users/get_All_Users');
    return response.data.users || [];
  },

  /**
   * Admin: create Owner, Professional, or Administrator accounts
   */
  createUser: async (data: {
    fullName: string;
    email: string;
    role: string;
    password?: string;
    phone?: string;
    specialty?: string;
    status?: string;
  }): Promise<any> => {
    const response = await api.post('/users/admin-create', data);
    return response.data;
  },

  /**
   * Fetch a single user by ID
   */
  getUserById: async (id: string | number): Promise<User> => {
    const response = await api.get<SingleUserResponse>(`/users/${id}`);
    return response.data.user;
  },

  /**
   * Update an existing user's information
   */
  updateUser: async (id: string | number, data: UpdateUserData): Promise<User> => {
    const response = await api.put<SingleUserResponse>(`/users/${id}`, data);
    return response.data.user;
  },

  /**
   * Toggle user verification status (Admin action)
   */
  toggleVerification: async (id: string | number, verified?: boolean): Promise<any> => {
    const response = await api.put<{ success: boolean; message: string; user: User }>(
      `/users/${id}/verification`,
      { verified }
    );
    return response.data;
  },

  /**
   * Delete a user account by ID
   */
  deleteUser: async (id: string | number): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/users/${id}`);
    return response.data;
  },

  /**
   * Fetch verified professionals for project assignment
   */
  getVerifiedProfessionals: async (): Promise<User[]> => {
    const response = await api.get<{ success: boolean; professionals: User[] }>('/users/professionals/verified');
    return response.data.professionals || [];
  },
};

export default userService;
