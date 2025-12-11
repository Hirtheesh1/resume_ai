// src/routes/testRoutes.js
const express = require("express");
const Groq = require("groq-sdk");

const router = express.Router();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Test #1 — Simple LLM check
router.get("/llm", async (req, res) => {
  try {
    const response = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL,
      messages: [
        { role: "system", content: "You are a test assistant." },
        { role: "user", content: "Say hello and confirm you are working." }
      ],
    });

    res.json({
      success: true,
      answer: response.choices[0].message.content,
    });
  } catch (err) {
    console.error("Groq API Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Test #2 — short message
router.get("/groq", async (req, res) => {
  try {
    const response = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL,
      messages: [
        {
          role: "user",
          content: "Say one short sentence about AI resumes.",
        },
      ],
      temperature: 0.7,
      max_tokens: 50,
    }); 

    res.json({ reply: response.choices[0].message.content });
  } catch (err) {
    console.error("Groq API Error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
