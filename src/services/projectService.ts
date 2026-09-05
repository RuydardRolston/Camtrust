import api from './api';

export interface ProjectPayload {
  title: string;
  location: string;
  description: string;
  budget: string;
  startDate: string;
  estimatedDuration?: string;
}

export interface ProjectUpdatePayload
  extends Partial<Omit<ProjectPayload, 'budget'>> {}

export interface ProjectStatusPayload {
  status: string;
  rejectionReason?: string;
}

export const projectService = {
  createProject: async (data: ProjectPayload): Promise<any> => {
    const response = await api.post('/projects/create', data);
    return response.data;
  },

  getMyProjects: async (): Promise<any> => {
    const response = await api.get('/projects/my');
    return response.data;
  },

  getProjectById: async (id: string | number): Promise<any> => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },

  getAllProjects: async (): Promise<any> => {
    const response = await api.get('/projects/all');
    return response.data;
  },

  updateProject: async (
    id: string | number,
    data: ProjectUpdatePayload
  ): Promise<any> => {
    const response = await api.put(`/projects/${id}`, data);
    return response.data;
  },

  updateProjectStatus: async (
    id: string | number,
    data: ProjectStatusPayload
  ): Promise<any> => {
    const response = await api.put(`/projects/${id}/status`, data);
    return response.data;
  },

  deleteProject: async (id: string | number): Promise<void> => {
    await api.delete(`/projects/${id}`);
  },
};

export default projectService;
