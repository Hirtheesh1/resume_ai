import api from '../config/api';

export const ragService = {
  query: async (query, resumeId) => {
    const response = await api.post('/rag/query', { query, resumeId });
    return response.data;
  },
};

