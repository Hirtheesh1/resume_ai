import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { resumeService } from '../services/resumeService';
import './UploadResume.css';

const UploadResume = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        setError('Please upload a PDF file');
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      setFile(selectedFile);
      setError('');
      setSuccess('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a PDF file');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await resumeService.uploadResume(file);
      setSuccess(`Resume uploaded successfully! ${result.totalChunks} chunks created.`);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload resume. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      if (droppedFile.type !== 'application/pdf') {
        setError('Please upload a PDF file');
        return;
      }
      if (droppedFile.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      setFile(droppedFile);
      setError('');
      setSuccess('');
    }
  };

  return (
    <div className="upload-resume">
      <h1>Upload Resume</h1>
      
      <div className="upload-container">
        <form onSubmit={handleSubmit}>
          <div
            className="drop-zone"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {file ? (
              <div className="file-selected">
                <p className="file-name">✓ {file.name}</p>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="remove-file-btn"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="drop-zone-content">
                <p>Drag and drop your PDF resume here</p>
                <p className="or-text">or</p>
                <label htmlFor="file-input" className="file-input-label">
                  Browse Files
                </label>
                <input
                  id="file-input"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="file-input"
                />
              </div>
            )}
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <button
            type="submit"
            disabled={!file || loading}
            className="submit-btn"
          >
            {loading ? 'Uploading...' : 'Upload Resume'}
          </button>
        </form>

        <div className="upload-info">
          <h3>Requirements:</h3>
          <ul>
            <li>File format: PDF only</li>
            <li>Maximum file size: 5MB</li>
            <li>The resume will be processed and chunked for AI analysis</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UploadResume;

