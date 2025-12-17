import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { resumeService } from '../services/resumeService';
import { ragService } from '../services/ragService';
import './RAGQuery.css';

const RAGQuery = () => {
  const [searchParams] = useSearchParams();
  const resumeId = searchParams.get('resumeId');

  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState(resumeId || '');

  useEffect(() => {
    loadResumes();
  }, []);

  useEffect(() => {
    if (resumeId) {
      setSelectedResumeId(resumeId);
    }
  }, [resumeId]);

  const loadResumes = async () => {
    try {
      const data = await resumeService.listResumes();
      setResumes(data);
    } catch (err) {
      setError('Failed to load resumes');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) {
      setError('Please enter a question');
      return;
    }

    setLoading(true);
    setError('');
    setAnswer('');

    try {
      const response = await ragService.query(
        query,
        selectedResumeId || undefined
      );
      setAnswer(response.answer);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process query');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rag-query">
      <h1>RAG Query Assistant</h1>
      <p className="description">
        Ask questions about your resume. The AI will use RAG (Retrieval-Augmented Generation)
        to provide answers based on your uploaded resumes.
      </p>

      {error && <div className="error-message">{error}</div>}

      <div className="rag-container">
        <div className="query-section">
          <form onSubmit={handleSubmit}>
            {resumes.length > 0 && (
              <div className="form-group">
                <label htmlFor="resume-select">Select Resume (optional):</label>
                <select
                  id="resume-select"
                  value={selectedResumeId}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  className="resume-select"
                >
                  <option value="">All Resumes</option>
                  {resumes.map((resume) => (
                    <option key={resume._id} value={resume._id}>
                      {resume.originalFileName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="query">Your Question:</label>
              <textarea
                id="query"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g., What are my key skills? What experience do I have with React?"
                rows={4}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="submit-btn"
            >
              {loading ? 'Processing...' : 'Ask Question'}
            </button>
          </form>
        </div>

        {answer && (
          <div className="answer-section">
            <h3>Answer:</h3>
            <div className="answer-content">{answer}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RAGQuery;

