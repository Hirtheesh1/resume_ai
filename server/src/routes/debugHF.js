const express = require("express");
const router = express.Router();
const { embedText } = require("../services/embeddingService");

router.get("/hf", async (req, res) => {
  try {
    const v = await embedText("This is a HuggingFace embedding test.");
    res.json({
      success: true,
      dimension: v.length,
      preview: v.slice(0, 5), // first 5 numbers
    });
  } catch (err) {
    res.json({
      success: false,
      error: err.message,
    });
  }
});

module.exports = router;
