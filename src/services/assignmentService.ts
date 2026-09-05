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

  getVerifiedEngineers: async (): Promise<any> => {
    const response = await api.get('/assignments/verified-engineers');
    return response.data;
  },

  proposeProfessional: async (
    projectId: string | number,
    professionalId: string | number
  ): Promise<any> => {
    const response = await api.post('/assignments/propose', {
      projectId,
      professionalId,
    });
    return response.data;
  },

  acceptAssignment: async (id: string | number): Promise<any> => {
    const response = await api.post(`/assignments/${id}/accept`);
    return response.data;
  },

  rejectAssignment: async (id: string | number): Promise<any> => {
    const response = await api.post(`/assignments/${id}/reject`);
    return response.data;
  },

  getProjectAssignments: async (
    projectId: string | number
  ): Promise<any> => {
    const response = await api.get('/assignments', {
      params: { projectId },
    });
    return response.data;
  },

  getMyAssignments: async (): Promise<any> => {
    const response = await api.get('/assignments/my');
    return response.data;
  },

  getPendingAssignments: async (): Promise<any> => {
    const response = await api.get('/assignments/pending');
    return response.data;
  },
};

export default assignmentService;
