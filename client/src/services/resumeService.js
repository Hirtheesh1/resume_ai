import api from '../config/api';

export const resumeService = {
  uploadResume: async (file) => {
    const formData = new FormData();
    formData.append('pdf', file);
    
    const response = await api.post('/resume/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  listResumes: async () => {
    const response = await api.get('/resume');
    return response.data;
  },
};

