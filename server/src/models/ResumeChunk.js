// src/models/ResumeChunk.js
const mongoose = require('mongoose');

const resumeChunkSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    resume: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      required: true,
      index: true,
    },
    chunkIndex: {
      type: Number,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    // Vector for Atlas vector search
    embedding: {
      type: [Number],
      required: true,
    },
  },
  { timestamps: true }
);

// For Atlas vector search you must also create a vector index in the Atlas UI
// with path: "embedding" and appropriate dimensions.

const ResumeChunk = mongoose.model('ResumeChunk', resumeChunkSchema);
module.exports = ResumeChunk;
