import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { resumeService } from '../services/resumeService';
import './Dashboard.css';

const Dashboard = () => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadResumes();
  }, []);

  const loadResumes = async () => {
    try {
      setLoading(true);
      const data = await resumeService.listResumes();
      setResumes(data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load resumes');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading">Loading resumes...</div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>My Resumes</h1>
        <Link to="/upload" className="upload-btn">
          + Upload New Resume
        </Link>
      </div>

      {error && <div className="error-message">{error}</div>}

      {resumes.length === 0 ? (
        <div className="empty-state">
          <p>No resumes uploaded yet.</p>
          <Link to="/upload" className="upload-btn">
            Upload Your First Resume
          </Link>
        </div>
      ) : (
        <div className="resumes-grid">
          {resumes.map((resume) => (
            <div key={resume._id} className="resume-card">
              <h3>{resume.originalFileName}</h3>
              <div className="resume-info">
                <p>
                  <strong>Chunks:</strong> {resume.totalChunks}
                </p>
                <p>
                  <strong>Uploaded:</strong> {formatDate(resume.createdAt)}
                </p>
              </div>
              <div className="resume-actions">
                <Link
                  to={`/interview?resumeId=${resume._id}`}
                  className="action-btn primary"
                >
                  Start Interview
                </Link>
                <Link
                  to={`/rag?resumeId=${resume._id}`}
                  className="action-btn secondary"
                >
                  RAG Query
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;

