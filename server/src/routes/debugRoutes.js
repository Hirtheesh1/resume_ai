const express = require("express");
const router = express.Router();
const axios = require("axios");

router.get("/groq", async (req, res) => {
  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: process.env.GROQ_MODEL,
        messages: [
          { role: "system", content: "diagnostic test" },
          { role: "user", content: "say hello" },
        ],
      },
      {
        headers: { 
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({
      success: true,
      keyValid: true,
      message: response.data.choices[0].message.content
    });
  } catch (err) {
    res.json({
      success: false,
      keyValid: false,
      errorFromGroq: err.response?.data || err.message,
      usedKey: process.env.GROQ_API_KEY.substring(0, 8) + "********"
    });
  }
});

module.exports = router;
