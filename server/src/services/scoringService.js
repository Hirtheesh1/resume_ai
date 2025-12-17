const { chatCompletion } = require("./llmService");

async function scoreAnswer({ question, answer }) {
  const systemPrompt = `
You are a senior interviewer.
Return ONLY valid JSON.

Score each from 0 to 10:
- technical
- clarity
- depth
- overall

Also add short feedback.

JSON format:
{
  "technical": number,
  "clarity": number,
  "depth": number,
  "overall": number,
  "feedback": string
}
`;

  const userPrompt = `
Question:
${question}

Candidate Answer:
${answer}
`;

  const raw = await chatCompletion({ systemPrompt, userPrompt });

  try {
    const parsed = JSON.parse(raw);

    // safety guard
    return {
      technical: Number(parsed.technical) || 0,
      clarity: Number(parsed.clarity) || 0,
      depth: Number(parsed.depth) || 0,
      overall: Number(parsed.overall) || 0,
      feedback: parsed.feedback || "No feedback provided",
    };
  } catch {
    return {
      technical: 5,
      clarity: 5,
      depth: 5,
      overall: 5,
      feedback: "Answer needs more structure and depth.",
    };
  }
}

module.exports = { scoreAnswer };
