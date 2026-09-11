import api from './api';

export const evidenceService = {
  uploadEvidence: async (formData: FormData): Promise<any> => {
    const response = await api.post('/evidence/upload', formData, {
      headers: {
        'Content-Type': undefined,
      },
    });
    return response.data;
  },

  getEvidence: async (milestoneId: string | number): Promise<any> => {
    const response = await api.get('/evidence', {
      params: { milestoneId },
    });
    return response.data;
  },

  getProjectEvidence: async (projectId: string | number): Promise<any> => {
    const response = await api.get(`/evidence/project/${projectId}`);
    return response.data;
  },

  getAllEvidence: async (): Promise<any> => {
    const response = await api.get('/evidence/all');
    return response.data;
  },
};

export default evidenceService;
