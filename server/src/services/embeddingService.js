// src/services/embeddingService.js
const { pipeline } = require("@xenova/transformers");

// Load model ONCE globally
let embeddingModel = null;

async function loadEmbeddingModel() {
  if (!embeddingModel) {
    console.log("⏳ Loading local embedding model (MiniLM-L6-v2)...");
    embeddingModel = await pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2"
    );
    console.log("✅ Local embedding model loaded.");
  }
  return embeddingModel;
}

async function embedText(text) {
  try {
    const model = await loadEmbeddingModel();

    const output = await model(text, {
      pooling: "mean", // produce 1 vector
      normalize: true, // normalized embeddings
    });

    // output.data = Float32Array → convert to JS array
    return Array.from(output.data);
  } catch (err) {
    console.error("Local Embedding Error:", err);
    throw new Error("Local embedding failed: " + err.message);
  }
}

async function embedTexts(textArray) {
  const results = [];
  for (const t of textArray) {
    results.push(await embedText(t));
  }
  return results;
}

module.exports = { embedText, embedTexts };
