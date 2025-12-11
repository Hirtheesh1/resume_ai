// src/routes/ragRoutes.js
const express = require('express');
const router = express.Router();

const protect = require('../middleware/authMiddleware'); // FIXED !!!
const { interviewAssist } = require('../controllers/ragController');

// POST /api/rag/query
router.post('/query', protect, interviewAssist);

module.exports = router;
