import api from './api';

export const notificationService = {
  getMyNotifications: async (): Promise<any[]> => {
    const response = await api.get('/notifications');
    return response.data;
  },

  markNotificationRead: async (id: string | number): Promise<any> => {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  },
};

export default notificationService;
