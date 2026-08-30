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

  uploadVerificationDocument: async (verificationId: string | number, formData: FormData): Promise<any> => {
    const response = await api.post(`/verifications/${verificationId}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getVerificationDocuments: async (verificationId: string | number): Promise<any[]> => {
    const response = await api.get(`/verifications/${verificationId}/documents`);
    return response.data;
  },
};

export default verificationService;
