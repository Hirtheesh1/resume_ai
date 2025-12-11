// src/services/interviewStore.js
const InterviewSession = require("../models/InterviewSession");
const mongoose = require("mongoose");

/**
 * Add QA pair to session for resume (create session if missing)
 */
const addQAPair = async ({ resumeId, userId, question, answer, score }) => {
  // find existing session for resume+user (or create a new one)
  let session = await InterviewSession.findOne({ resume: resumeId, user: userId });
  if (!session) {
    session = new InterviewSession({ resume: resumeId, user: userId, qa: [] });
  }
  session.qa.push({ question, answer, score });
  await session.save();
  return session;
};

const getInterviewByResume = async (resumeId) => {
  return InterviewSession.findOne({ resume: resumeId }).lean();
};

module.exports = { addQAPair, getInterviewByResume };
