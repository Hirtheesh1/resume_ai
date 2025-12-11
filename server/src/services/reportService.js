// src/services/reportService.js
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const sanitize = require("sanitize-filename");
const InterviewSession = require("../models/InterviewSession");
const Resume = require("../models/Resume");

const generateReport = async ({ resumeId, userId, interview }) => {
  // load resume summary to include
  const resume = await Resume.findById(resumeId).lean();
  const session = interview || (await InterviewSession.findOne({ resume: resumeId }));
  const filenameBase = sanitize(`interview_report_${resumeId}`);
  const outPath = path.join(__dirname, "../../tmp", `${filenameBase}_${Date.now()}.pdf`);
  // ensure tmp directory exists
  fs.mkdirSync(path.dirname(outPath), { recursive: true });

  const doc = new PDFDocument({ margin: 40 });
  const stream = fs.createWriteStream(outPath);
  doc.pipe(stream);

  // Header
  doc.fontSize(18).text("Interview Report", { align: "center" });
  doc.moveDown();
  doc.fontSize(12).text(`Resume ID: ${resumeId}`);
  doc.text(`Generated: ${new Date().toISOString()}`);
  doc.moveDown();

  // Resume summary (short)
  doc.fontSize(12).text("Resume Summary:");
  doc.fontSize(10).text((resume && resume.text ? resume.text.slice(0, 1000) : "No resume text") );
  doc.moveDown();

  // Q/A with scores
  doc.fontSize(12).text("Interview Q&A:");
  if (session && session.qa && session.qa.length) {
    session.qa.forEach((qa, idx) => {
      doc.moveDown(0.2);
      doc.fontSize(11).text(`${idx + 1}. Question: ${qa.question}`);
      doc.fontSize(11).text(`Answer: ${qa.answer}`);
      doc.fontSize(10).text(`Score: ${qa.score ? JSON.stringify(qa.score) : "N/A"}`);
      doc.moveDown(0.5);
    });
  } else {
    doc.text("No Q/A recorded for this session.");
  }

  doc.end();

  // return a promise that resolves when file finished writing
  return new Promise((resolve, reject) => {
    stream.on("finish", () => resolve(outPath));
    stream.on("error", (err) => reject(err));
  });
};

module.exports = { generateReport };
