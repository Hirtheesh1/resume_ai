const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const { generateNextQuestion ,createReport} = require("../controllers/interviewController");


// Ask next question
router.post("/next", protect, generateNextQuestion);

// Generate interview report (PDF)
router.post("/report", protect, createReport);

module.exports = router;
