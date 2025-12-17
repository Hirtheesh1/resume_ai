const mongoose = require("mongoose");

const QASchema = new mongoose.Schema({
  question: String,
  answer: String,
  score: {
    technical: Number,
    clarity: Number,
    depth: Number,
    overall: Number,
    feedback: String,
  },
});

const InterviewSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    resume: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
      required: true,
    },
    qa: [QASchema],
    lastQuestion: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("InterviewSession", InterviewSessionSchema);
