// src/services/scoringService.js
const { chatCompletion } = require("./llmService");
const { embedText } = require("./embeddingService");
const Resume = require("../models/Resume");

const scoreAnswer = async ({ resumeId, question, answer, userId }) => {
  // Load resume summary/title optionally
  const resumeDoc = await Resume.findById(resumeId).lean();

  const systemPrompt = `
You are an expert technical interviewer and grader.
Given: resume context (brief), a question asked, and the candidate's answer, produce a JSON object with:
- overall: integer 1-10
- technical_accuracy: 1-10
- clarity: 1-10
- depth: 1-10
- improvement: short suggestion (1-2 sentences)
Also produce a short textual summary explanation in "explain".
Return ONLY a valid JSON object.
  `;

  const userPrompt = `
Resume (short):
${resumeDoc ? resumeDoc.text.slice(0, 1000) : "[no resume text]"}

Question:
${question}

Candidate answer:
${answer}

Return the JSON.
  `;

  const raw = await chatCompletion({ systemPrompt, userPrompt });

  // Try to parse JSON from LLM
  let parsed = null;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    // If Groq returns text not strict JSON, ask again or fallback to heuristics
    // Simple fallback: give neutral scores
    parsed = {
      overall: 6,
      technical_accuracy: 6,
      clarity: 6,
      depth: 6,
      improvement: "Could not auto-parse model output. Answer needs human review.",
      explain: raw.slice(0, 500),
    };
  }

  return parsed;
};

module.exports = { scoreAnswer };
