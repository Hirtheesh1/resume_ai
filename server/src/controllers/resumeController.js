// src/controllers/resumeController.js
const Resume = require('../models/Resume');
const ResumeChunk = require('../models/ResumeChunk');
const { extractTextFromPdf } = require('../services/pdfService');
const { chunkText } = require('../services/chunkService');
const { embedTexts } = require('../services/embeddingService');

const uploadResume = async (req, res, next) => {
  try {
    const userId = req.user._id;

    if (!req.file) {
      res.status(400);
      throw new Error('No PDF file uploaded');
    }

    // 1. Extract text from PDF
    const text = await extractTextFromPdf(req.file.buffer);

    if (!text || !text.trim()) {
      res.status(400);
      throw new Error('Could not extract text from PDF');
    }

    // 2. Chunk text
    const chunks = chunkText(text); // [{ index, text }, ...]

    // 3. Embed each chunk via HF
    const chunkTexts = chunks.map((c) => c.text);
    const embeddings = await embedTexts(chunkTexts);

    if (embeddings.length !== chunks.length) {
      res.status(500);
      throw new Error('Embedding length mismatch with chunks');
    }

    // 4. Create resume document
    const resume = await Resume.create({
      user: userId,
      originalFileName: req.file.originalname,
      text,
      totalChunks: chunks.length,
    });

    // 5. Create ResumeChunk docs
    const chunkDocs = chunks.map((c, i) => ({
      user: userId,
      resume: resume._id,
      chunkIndex: c.index,
      text: c.text,
      embedding: embeddings[i],
    }));

    await ResumeChunk.insertMany(chunkDocs);

    res.status(201).json({
      message: 'Resume uploaded and processed successfully',
      resumeId: resume._id,
      totalChunks: resume.totalChunks,
    });
  } catch (err) {
    next(err);
  }
};

const listUserResumes = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const resumes = await Resume.find({ user: userId }).sort('-createdAt');

    res.json(resumes);
  } catch (err) {
    next(err);
  }
};

module.exports = { uploadResume, listUserResumes };
