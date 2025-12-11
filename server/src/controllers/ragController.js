// src/controllers/ragController.js
const { embedText } = require('../services/embeddingService');
const { searchRelevantChunks } = require('../services/vectorSearchService');
const { chatCompletion } = require('../services/llmService');

const interviewAssist = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { query, resumeId } = req.body;

    if (!query) {
      res.status(400);
      throw new Error('Query is required');
    }

    // 1. Embed the query
    const queryEmbedding = await embedText(query);

    // 2. Vector search for relevant chunks
    const chunks = await searchRelevantChunks({
      userId,
      resumeId: resumeId || undefined,
      queryEmbedding,
      topK: 6,
    });

    const context = chunks.map((c, idx) => `Chunk ${idx + 1}:\n${c.text}`).join('\n\n---\n\n');

    const systemPrompt = `
You are an AI interview assistant and resume analyst. 
You are given context from a candidate's resume. 
Use ONLY this context plus your general knowledge to answer the user's query.
Be specific and reference skills, experiences, and technologies mentioned in the context when relevant.
If something is not in the resume context, you can still give general advice, but be clear about that.
    `.trim();

    const userPrompt = `
User question:
"${query}"

Resume context:
${context || '[No context found for this user/resume]'}
    `.trim();

    // 3. Ask Groq LLM
    const answer = await chatCompletion({ systemPrompt, userPrompt });

    res.json({
      query,
      answer,
      retrievedChunks: chunks,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { interviewAssist };
