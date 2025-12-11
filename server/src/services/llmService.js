// src/services/llmService.js
const axios = require("axios");

// ALWAYS use .env — never fallback
const GROQ_MODEL = process.env.GROQ_MODEL;
const GROQ_KEY = process.env.GROQ_API_KEY;

if (GROQ_MODEL) {
  console.error("❌ ERROR: GROQ_MODEL is  set in .env",GROQ_MODEL);
}
if (!GROQ_KEY) { 
  console.error("❌ ERROR: GROQ_API_KEY is not set in .env");
}

// Print exact model being used (from .env)
console.log("Using GROQ Model:", GROQ_MODEL);

const chatCompletion = async ({ systemPrompt, userPrompt }) => {
  const response = await axios.post(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      model: GROQ_MODEL,  // <--- FIXED
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.2,
    },
    {
      headers: {
        Authorization: `Bearer ${GROQ_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data.choices[0].message.content;
};

module.exports = { chatCompletion };
