import api from './api';

export interface AssistantPayload {
  projectId: string | number;
  question: string;
}

export interface AssistantResponse {
  answer: string;
}

export const aiService = {
  askAssistant: async (
    projectId: string | number,
    question: string
  ): Promise<AssistantResponse> => {
    const response = await api.post('/ai/assistant', { projectId, question });
    return response.data;
  },
};

export default aiService;
