import api from '../config/api';

export const interviewService = {
  generateNextQuestion: async (resumeId, previousAnswer, mode = 'mixed') => {
    const response = await api.post('/interview/next', {
      resumeId,
      previousAnswer,
      mode,
    });
    return response.data;
  },

  createReport: async (resumeId) => {
    const response = await api.post(
      '/interview/report',
      { resumeId },
      { responseType: 'blob' }
    );
    
    // Create blob URL and trigger download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `interview_report_${Date.now()}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return response.data;
  },
};

