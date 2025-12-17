import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { interviewService } from '../services/interviewService';
import './Interview.css';

const Interview = () => {
  const [searchParams] = useSearchParams();
  const resumeId = searchParams.get('resumeId');

  const [currentQuestion, setCurrentQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [qaHistory, setQaHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [questionType, setQuestionType] = useState('');
  const [mode, setMode] = useState('mixed');

  useEffect(() => {
    if (resumeId) {
      generateQuestion();
    } else {
      setError('Please select a resume from the dashboard');
    }
  }, [resumeId]);

  const generateQuestion = async (previousAnswer = null) => {
    if (!resumeId) return;

    setLoading(true);
    setError('');

    try {
      const response = await interviewService.generateNextQuestion(
        resumeId,
        previousAnswer,
        mode
      );
      setCurrentQuestion(response.nextQuestion);
      setQuestionType(response.questionType);
      setAnswer('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate question');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!answer.trim()) {
      setError('Please provide an answer');
      return;
    }

    // Add to history
    setQaHistory([...qaHistory, { question: currentQuestion, answer }]);

    // Generate next question
    await generateQuestion(answer);
  };

  const handleGenerateReport = async () => {
    if (!resumeId) return;

    setLoading(true);
    setError('');

    try {
      await interviewService.createReport(resumeId);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  if (!resumeId) {
    return (
      <div className="interview">
        <div className="error-message">Please select a resume from the dashboard</div>
      </div>
    );
  }

  return (
    <div className="interview">
      <div className="interview-header">
        <h1>Interview Practice</h1>
        <div className="mode-selector">
          <label>
            <input
              type="radio"
              value="mixed"
              checked={mode === 'mixed'}
              onChange={(e) => setMode(e.target.value)}
            />
            Mixed
          </label>
          <label>
            <input
              type="radio"
              value="technical"
              checked={mode === 'technical'}
              onChange={(e) => setMode(e.target.value)}
            />
            Technical
          </label>
          <label>
            <input
              type="radio"
              value="behavioral"
              checked={mode === 'behavioral'}
              onChange={(e) => setMode(e.target.value)}
            />
            Behavioral
          </label>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="interview-content">
        <div className="question-section">
          {loading && !currentQuestion ? (
            <div className="loading">Generating question...</div>
          ) : (
            <>
              {questionType && (
                <div className="question-type">Type: {questionType}</div>
              )}
              <div className="question-box">
                <h3>Question:</h3>
                <p>{currentQuestion || 'Click "Start Interview" to begin'}</p>
              </div>

              <form onSubmit={handleSubmitAnswer} className="answer-form">
                <label htmlFor="answer">Your Answer:</label>
                <textarea
                  id="answer"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Type your answer here..."
                  rows={6}
                  required
                />
                <button
                  type="submit"
                  disabled={loading || !answer.trim()}
                  className="submit-answer-btn"
                >
                  {loading ? 'Processing...' : 'Submit Answer'}
                </button>
              </form>
            </>
          )}
        </div>

        {qaHistory.length > 0 && (
          <div className="history-section">
            <h3>Interview History</h3>
            <div className="qa-list">
              {qaHistory.map((qa, index) => (
                <div key={index} className="qa-item">
                  <div className="qa-question">
                    <strong>Q{index + 1}:</strong> {qa.question}
                  </div>
                  <div className="qa-answer">
                    <strong>A{index + 1}:</strong> {qa.answer}
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={handleGenerateReport}
              className="generate-report-btn"
            >
              Generate PDF Report
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Interview;

