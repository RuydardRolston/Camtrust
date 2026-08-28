import api from './api';

export const evidenceService = {
  uploadEvidence: async (formData: FormData): Promise<any> => {
    const response = await api.post('/evidence', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getEvidence: async (milestoneId: string | number): Promise<any[]> => {
    const response = await api.get('/evidence', {
      params: { milestoneId },
    });
    return response.data;
  },
};

export default evidenceService;
