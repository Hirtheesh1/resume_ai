const { embedText } = require("../services/embeddingService");
const { searchRelevantChunks } = require("../services/vectorSearchService");
const { chatCompletion } = require("../services/llmService");
const InterviewSession = require("../models/InterviewSession"); // <-- You already have or create this

//---------------------------------------------------------------
// Helper: Fetch previous interview history
//---------------------------------------------------------------
async function getSession(userId, resumeId) {
  let session = await InterviewSession.findOne({ user: userId, resume: resumeId });
  if (!session) {
    session = await InterviewSession.create({
      user: userId,
      resume: resumeId,
      qa: [],
      createdAt: new Date(),
    });
  }
  return session;
}

//---------------------------------------------------------------
// Main Interview Logic (Upgraded)
//---------------------------------------------------------------
const generateNextQuestion = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { resumeId, previousAnswer, mode = "mixed" } = req.body;

    if (!resumeId) {
      res.status(400);
      throw new Error("resumeId is required");
    }

    //-------------------------------------------------------------
    // 1️⃣ Load interview session
    //-------------------------------------------------------------
    const session = await getSession(userId, resumeId);
    const previousQAList = session.qa || [];

    //-------------------------------------------------------------
    // 2️⃣ Choose question type (Behavioral, Technical, Deep dive)
    //-------------------------------------------------------------
    let questionType = "technical";

    const count = previousQAList.length;

    if (mode === "behavioral") {
      questionType = "behavioral";
    } else if (mode === "technical") {
      questionType = "technical";
    } else {
      // mixed mode rotation
      if (count % 3 === 0) questionType = "resume_based";
      else if (count % 3 === 1) questionType = "technical_deep";
      else questionType = "behavioral";
    }

    //-------------------------------------------------------------
    // 3️⃣ Build vector query (embedding of last answer or starter)
    //-------------------------------------------------------------
    const queryEmbedding = previousAnswer
      ? await embedText(previousAnswer)
      : await embedText("interview job role experience");

    //-------------------------------------------------------------
    // 4️⃣ Retrieve resume context (RAG)
    //-------------------------------------------------------------
    const chunks = await searchRelevantChunks({
      userId,
      resumeId,
      queryEmbedding,
      topK: 5,
    });

    const resumeContext = chunks
      .map((c, idx) => `Chunk ${idx + 1}:\n${c.text}`)
      .join("\n\n---\n\n");

    //-------------------------------------------------------------
    // 5️⃣ Format previous Q&A memory for AI
    //-------------------------------------------------------------
    const history = previousQAList
      .map(
        (item, i) =>
          `Q${i + 1}: ${item.question}\nA${i + 1}: ${item.answer}`
      )
      .join("\n\n");

    //-------------------------------------------------------------
    // 6️⃣ Strong System Prompt
    //-------------------------------------------------------------
    const systemPrompt = `
You are a highly professional technical + behavioral interview AI.
Your responsibilities:

1. NEVER repeat any question already asked.
2. ALWAYS analyze resume context before asking anything.
3. ALWAYS review interview history before asking the next question.
4. Ask ONLY ONE new question per turn.
5. Question must be personalized to the candidate's resume.
6. Make the next question deeper than the previous one.
7. For behavioral mode, ask STAR (Situation, Task, Action, Result) questions.
8. For technical mode, ask detailed, architecture-level questions.
9. DO NOT answer the question yourself.
10. DO NOT give hints or examples — only the question.
    `;

    //-------------------------------------------------------------
    // 7️⃣ Dynamic User Prompt With All Memory
    //-------------------------------------------------------------
    const userPrompt = `
Resume Context:
${resumeContext || "[No resume context found]"}

Interview History So Far:
${history || "[None yet]"}

User's Latest Answer:
"${previousAnswer || "[Interview starting]"}"

Your next question should be a: **${questionType}** question.

Rules:
- Must be new (do not repeat any question above).
- Must be based on resume OR last answer.
- Must be deeper and more challenging.
- Ask only ONE question.

Generate the next interview question now.
`;

    //-------------------------------------------------------------
    // 8️⃣ Ask LLM for the next question
    //-------------------------------------------------------------
    const nextQuestion = await chatCompletion({
      systemPrompt,
      userPrompt,
    });

    //-------------------------------------------------------------
    // 9️⃣ Save to session memory
    //-------------------------------------------------------------
    if (previousAnswer) {
      session.qa.push({
        question: session.lastQuestion || "Initial Question",
        answer: previousAnswer,
      });
    }

    session.lastQuestion = nextQuestion;
    await session.save();

    //-------------------------------------------------------------
    // 🔟 Respond to client
    //-------------------------------------------------------------
    res.json({
      success: true,
      nextQuestion,
      questionType,
      retrievedChunks: chunks,
    });
  } catch (err) {
    next(err);
  }
};
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const createReport = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { resumeId } = req.body;

    if (!resumeId) {
      res.status(400);
      throw new Error("resumeId is required");
    }

    const session = await InterviewSession.findOne({ user: userId, resume: resumeId });

    if (!session || session.qa.length === 0) {
      res.status(400);
      throw new Error("No interview QA found for this session.");
    }

    // Create PDF path
    const fileName = `interview_report_${resumeId}_${Date.now()}.pdf`;
    const filePath = path.join(__dirname, "../../tmp", fileName);

    if (!fs.existsSync(path.join(__dirname, "../../tmp"))) {
      fs.mkdirSync(path.join(__dirname, "../../tmp"));
    }

    const doc = new PDFDocument();
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // PDF HEADER
    doc.fontSize(22).text("Interview Report", { align: "center" });
    doc.moveDown();

    // Add Q&A
    session.qa.forEach((item, idx) => {
      doc.fontSize(16).text(`Q${idx + 1}: ${item.question}`, { bold: true });
      doc.fontSize(14).text(`A${idx + 1}: ${item.answer}`);
      doc.moveDown();
    });

    doc.end();

    // Send file when PDF is ready
    stream.on("finish", () => {
      res.download(filePath);
    });

  } catch (err) {
    next(err);
  }
};

module.exports = { generateNextQuestion ,createReport};
