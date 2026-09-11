import api from './api';

export const documentService = {
  uploadDocument: async (formData: FormData): Promise<any> => {
    const response = await api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': undefined,
      },
    });
    return response.data;
  },

  getProjectDocuments: async (
    projectId: string | number
  ): Promise<any> => {
    const response = await api.get('/documents', {
      params: { projectId },
    });
    return response.data;
  },

  getAllDocuments: async (): Promise<any> => {
    const response = await api.get('/documents/all');
    return response.data;
  },

  deleteDocument: async (id: string | number): Promise<void> => {
    await api.delete(`/documents/${id}`);
  },
};

export default documentService;
