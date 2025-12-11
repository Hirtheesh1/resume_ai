// src/services/chunkService.js
const { CHUNK_SIZE, CHUNK_OVERLAP } = require('../utils/constants');

// Simple character-based chunking with overlap
const chunkText = (text) => {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  const chunks = [];

  let start = 0;
  let index = 0;

  while (start < cleaned.length) {
    const end = start + CHUNK_SIZE;
    const chunk = cleaned.slice(start, end);
    chunks.push({ index, text: chunk });
    index += 1;
    start = end - CHUNK_OVERLAP; // overlap
    if (start < 0) start = 0;
  }

  return chunks;
};

module.exports = { chunkText };
