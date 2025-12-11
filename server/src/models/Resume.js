// src/models/Resume.js
const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    originalFileName: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    totalChunks: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Resume = mongoose.model('Resume', resumeSchema);
module.exports = Resume;
