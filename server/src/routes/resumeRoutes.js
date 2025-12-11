// src/routes/resumeRoutes.js
const express = require('express');
const router = express.Router();

const protect = require('../middleware/authMiddleware'); // FIXED ❗
const upload = require('../middleware/uploadMiddleware');
const { uploadResume, listUserResumes } = require('../controllers/resumeController');

// POST /api/resume/upload
router.post('/upload', protect, upload.single('pdf'), uploadResume);

// GET /api/resume
router.get('/', protect, listUserResumes);

module.exports = router;
