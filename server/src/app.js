const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/authRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const ragRoutes = require('./routes/ragRoutes');
const testRoutes = require('./routes/testRoutes');
const debugHF = require("./routes/debugHF");
const interviewRoutes = require("./routes/interviewRoutes");

const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

const allowedOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  })
);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

// ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/rag', ragRoutes);
app.use('/api/test', testRoutes);
app.use('/api/debug', debugHF);
app.use('/api/interview', interviewRoutes);
// ERROR HANDLERS
app.use(notFound);
app.use(errorHandler);

module.exports = app;
