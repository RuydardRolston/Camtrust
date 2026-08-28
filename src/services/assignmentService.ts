import api from './api';

export const assignmentService = {
  assignProfessional: async (
    projectId: string | number,
    professionalId: string | number
  ): Promise<any> => {
    const response = await api.post('/assignments/assign', {
      projectId,
      professionalId,
    });
    return response.data;
  },

  getProjectAssignments: async (
    projectId: string | number
  ): Promise<any[]> => {
    const response = await api.get('/assignments', {
      params: { projectId },
    });
    return response.data;
  },

  getMyAssignments: async (): Promise<any[]> => {
    const response = await api.get('/assignments/my');
    return response.data;
  },
};

export default assignmentService;
