// src/controllers/interviewController.js
const { embedText } = require("../services/embeddingService");
const { searchRelevantChunks } = require("../services/vectorSearchService");
const { chatCompletion } = require("../services/llmService");

const generateNextQuestion = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { resumeId, previousAnswer } = req.body;

    if (!resumeId) {
      return res.status(400).json({ error: "resumeId is required" });
    }

    const embedding = previousAnswer
      ? await embedText(previousAnswer)
      : await embedText("start interview");

    const chunks = await searchRelevantChunks({
      userId,
      resumeId,
      queryEmbedding: embedding,
      topK: 5,
    });

    const context = chunks
      .map((c, i) => `Chunk ${i + 1}:\n${c.text}`)
      .join("\n\n");

    const systemPrompt = `
You are an AI technical interviewer. Ask ONE interview question.
Base the question ONLY on the resume context.
If previousAnswer exists, ask a deeper follow-up question.
Never answer for the user.
`.trim();

    const userPrompt = `
Previous Answer:
${previousAnswer || "None"}

Resume Context:
${context}
`.trim();

    const nextQuestion = await chatCompletion({
      systemPrompt,
      userPrompt,
    });

    res.json({ question: nextQuestion, retrievedChunks: chunks });

  } catch (err) {
    next(err);
  }
};

console.log(">>> generateNextQuestion TYPE =", typeof generateNextQuestion);

module.exports = { generateNextQuestion };
