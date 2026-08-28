import api from './api';

export interface ReportPayload {
  projectId: string | number;
  summary: string;
}

export const reportService = {
  submitReport: async (data: ReportPayload): Promise<any> => {
    const response = await api.post('/reports/submit', data);
    return response.data;
  },

  getProjectReports: async (projectId: string | number): Promise<any[]> => {
    const response = await api.get('/reports', {
      params: { projectId },
    });
    return response.data;
  },

  getMyReports: async (): Promise<any[]> => {
    const response = await api.get('/reports/my');
    return response.data;
  },

  getAllReports: async (): Promise<any[]> => {
    const response = await api.get('/reports/all');
    return response.data;
  },
};

export default reportService;
