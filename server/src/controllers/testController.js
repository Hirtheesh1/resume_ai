// src/controllers/testController.js
const { chatCompletion } = require('../services/llmService');
const { embedText } = require('../services/embeddingService');
const { searchRelevantChunks } = require('../services/vectorSearchService');

const testLLM = async (req, res, next) => {
  try {
    const answer = await chatCompletion({
      systemPrompt: 'You are a test assistant.',
      userPrompt: 'Say hello and confirm you are working.',
    });

    res.json({ answer });
  } catch (err) {
    next(err);
  }
};

const testVectorSearch = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const dummyQuery = 'software engineer skills';
    const queryEmbedding = await embedText(dummyQuery);

    const results = await searchRelevantChunks({
      userId,
      queryEmbedding,
      topK: 3,
    });

    res.json({
      dummyQuery,
      resultCount: results.length,
      results,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { testLLM, testVectorSearch };
    