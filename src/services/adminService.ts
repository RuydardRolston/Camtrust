import api from './api';

export const adminService = {
  getPlatformStats: async (): Promise<any> => {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  toggleUserStatus: async (
    userId: string | number,
    status: string
  ): Promise<any> => {
    const response = await api.patch(`/admin/users/${userId}/status`, {
      status,
    });
    return response.data;
  },
};

export default adminService;
