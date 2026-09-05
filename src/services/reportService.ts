import api from './api';

export interface ReportPayload {
  projectId: string | number;
  milestoneId?: string | number | null;
  summary?: string;
  workCompleted?: string;
  workInProgress?: string;
  workRemaining?: string;
  observations?: string;
  issues?: string;
  recommendations?: string;
  progressPercentage?: number;
  pdfUrl?: string;
}

export const reportService = {
  submitReport: async (data: ReportPayload): Promise<any> => {
    const response = await api.post('/reports/submit', data);
    return response.data;
  },

  getProjectReports: async (projectId: string | number): Promise<any> => {
    const response = await api.get('/reports', {
      params: { projectId },
    });
    return response.data;
  },

  getReportById: async (id: string | number): Promise<any> => {
    const response = await api.get(`/reports/${id}`);
    return response.data;
  },

  getMyReports: async (): Promise<any> => {
    const response = await api.get('/reports/my');
    return response.data;
  },

  getAllReports: async (): Promise<any> => {
    const response = await api.get('/reports/all');
    return response.data;
  },
};

export default reportService;
