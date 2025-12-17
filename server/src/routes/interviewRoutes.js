const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");

const {
  generateNextQuestion,
  createReport,
} = require("../controllers/interviewController");

router.post("/next", protect, generateNextQuestion);
router.post("/report", protect, createReport);

module.exports = router;
