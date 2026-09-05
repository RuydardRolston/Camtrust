import api from './api';

export const verificationService = {
  requestVerification: async (data?: { notes?: string }): Promise<any> => {
    const response = await api.post('/verifications/request', data || {});
    return response.data;
  },

  getMyVerificationStatus: async (): Promise<any> => {
    const response = await api.get('/verifications/my-status');
    return response.data;
  },

  getPendingVerifications: async (): Promise<any> => {
    const response = await api.get('/verifications/pending');
    return response.data;
  },

  approveVerification: async (id: string | number, notes?: string): Promise<any> => {
    const response = await api.put(`/verifications/${id}/approve`, { notes });
    return response.data;
  },

  rejectVerification: async (id: string | number, reason?: string): Promise<any> => {
    const response = await api.put(`/verifications/${id}/reject`, { reason });
    return response.data;
  },

  requestNewDocuments: async (id: string | number, requestNotes?: string): Promise<any> => {
    const response = await api.put(`/verifications/${id}/request-docs`, { requestNotes });
    return response.data;
  },

  uploadVerificationDocument: async (verificationId: string | number | null, formData: FormData): Promise<any> => {
    if (verificationId) {
      formData.append('verificationId', String(verificationId));
    }
    const response = await api.post(`/verifications/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getVerificationDocuments: async (verificationId: string | number): Promise<any> => {
    const response = await api.get(`/verifications/${verificationId}/documents`);
    return response.data;
  },
};

export default verificationService;
