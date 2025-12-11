// src/models/InterviewSession.js
const mongoose = require("mongoose");

const QASchema = new mongoose.Schema({
  question: String,
  answer: String,
  score: Object,
  createdAt: { type: Date, default: Date.now },
});

const InterviewSessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  resume: { type: mongoose.Schema.Types.ObjectId, ref: "Resume" },
  qa: [QASchema],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("InterviewSession", InterviewSessionSchema);
