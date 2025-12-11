// src/services/pdfService.js
const pdfParse = require('pdf-parse');

const extractTextFromPdf = async (buffer) => {
  const data = await pdfParse(buffer);
  return data.text || '';
};

module.exports = { extractTextFromPdf };
