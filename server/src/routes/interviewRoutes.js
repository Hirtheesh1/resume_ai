const express = require("express");
const { generateNextQuestion } = require("../controllers/interviewController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/next", protect, generateNextQuestion);

module.exports = router;
