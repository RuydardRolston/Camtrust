import api from './api';

export interface AssistantResponse {
  success: boolean;
  response?: string;
  answer?: string;
}

export const aiService = {
  askAssistant: async (
    projectId: string | number | null | undefined,
    question: string
  ): Promise<AssistantResponse> => {
    const response = await api.post('/ai/chat', { projectId, question, message: question });
    return {
      success: response.data?.success ?? true,
      answer: response.data?.answer || response.data?.response || 'No response from assistant.',
      response: response.data?.response || response.data?.answer || 'No response from assistant.',
    };
  },
};

export default aiService;
