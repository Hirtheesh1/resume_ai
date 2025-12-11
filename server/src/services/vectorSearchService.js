// src/services/vectorSearchService.js
const ResumeChunk = require('../models/ResumeChunk');
const mongoose = require('mongoose');
const { TOP_K_CHUNKS } = require('../utils/constants');

/**
 * Correct Vector Search:
 *
 * 1. $vectorSearch MUST be first
 * 2. Then apply $match (filter user/resume)
 * 3. Then $project fields
 */
const searchRelevantChunks = async ({
  userId,
  resumeId,
  queryEmbedding,
  topK = TOP_K_CHUNKS,
}) => {
  const matchStage = {
    user: new mongoose.Types.ObjectId(userId),
  };

  if (resumeId) {
    matchStage.resume = new mongoose.Types.ObjectId(resumeId);
  }

  const pipeline = [
    // 1️⃣ FIRST STAGE → vector search
    {
      $vectorSearch: {
        index: 'resume_chunk_embedding_index',
        path: 'embedding',
        queryVector: queryEmbedding,
        numCandidates: 100,
        limit: topK,
      },
    },

    // 2️⃣ THEN → filter by user + resume
    {
      $match: matchStage,
    },

    // 3️⃣ THEN → select output fields
    {
      $project: {
        text: 1,
        chunkIndex: 1,
        resume: 1,
        score: { $meta: 'vectorSearchScore' },
      },
    },
  ];

  return ResumeChunk.aggregate(pipeline);
};

module.exports = { searchRelevantChunks };
