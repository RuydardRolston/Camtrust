import api from './api';

export interface MilestonePayload {
  projectId: string | number;
  label: string;
  plannedDate?: string;
  completionRate?: number;
  status?: string;
}

export interface MilestoneUpdatePayload
  extends Partial<Omit<MilestonePayload, 'projectId'>> {}

export const milestoneService = {
  createMilestone: async (data: MilestonePayload): Promise<any> => {
    const response = await api.post('/milestones/create', data);
    return response.data;
  },

  updateMilestone: async (
    id: string | number,
    data: MilestoneUpdatePayload
  ): Promise<any> => {
    const response = await api.put(`/milestones/${id}`, data);
    return response.data;
  },

  getMilestones: async (projectId: string | number): Promise<any> => {
    const response = await api.get('/milestones', {
      params: { projectId },
    });
    return response.data;
  },

  getMyMilestones: async (): Promise<any> => {
    const response = await api.get('/milestones/my');
    return response.data;
  },
};

export default milestoneService;
