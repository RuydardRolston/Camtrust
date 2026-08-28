import api from './api';

export const verificationService = {
  requestVerification: async (): Promise<any> => {
    const response = await api.post('/verifications/request');
    return response.data;
  },

  getPendingVerifications: async (): Promise<any[]> => {
    const response = await api.get('/verifications/pending');
    return response.data;
  },

  approveVerification: async (id: string | number): Promise<any> => {
    const response = await api.put(`/verifications/${id}/approve`);
    return response.data;
  },

  rejectVerification: async (id: string | number): Promise<any> => {
    const response = await api.put(`/verifications/${id}/reject`);
    return response.data;
  },
};

export default verificationService;
