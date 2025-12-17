const { embedText } = require("../services/embeddingService");
const { searchRelevantChunks } = require("../services/vectorSearchService");
const { chatCompletion } = require("../services/llmService");
const { scoreAnswer } = require("../services/scoringService");
const InterviewSession = require("../models/InterviewSession");

const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

//---------------------------------------------------
// Helper
//---------------------------------------------------
async function getSession(userId, resumeId) {
  let session = await InterviewSession.findOne({ user: userId, resume: resumeId });
  if (!session) {
    session = await InterviewSession.create({
      user: userId,
      resume: resumeId,
      qa: [],
    });
  }
  return session;
}

//---------------------------------------------------
// INTERVIEW QUESTION GENERATOR (HUMAN-LIKE)
//---------------------------------------------------
const generateNextQuestion = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { resumeId, previousAnswer, mode = "mixed" } = req.body;

    if (!resumeId) throw new Error("resumeId required");

    const session = await getSession(userId, resumeId);
    const qaHistory = session.qa || [];

    // Save previous answer with score
    if (previousAnswer && session.lastQuestion) {
      const score = await scoreAnswer({
        question: session.lastQuestion,
        answer: previousAnswer,
      });

      session.qa.push({
        question: session.lastQuestion,
        answer: previousAnswer,
        score,
      });
    }

    // Rotate question type
    let type = "technical";
    if (mode === "behavioral") type = "behavioral";
    else if (mode === "mixed") {
      if (qaHistory.length % 3 === 0) type = "resume";
      else if (qaHistory.length % 3 === 1) type = "technical";
      else type = "behavioral";
    }

    // RAG context
    const embedding = previousAnswer
      ? await embedText(previousAnswer)
      : await embedText("interview experience");

    const chunks = await searchRelevantChunks({
      userId,
      resumeId,
      queryEmbedding: embedding,
      topK: 5,
    });

    const resumeContext = chunks.map(c => c.text).join("\n\n");

    const history = qaHistory
      .map((q, i) => `Q${i + 1}: ${q.question}\nA${i + 1}: ${q.answer}`)
      .join("\n\n");

    const systemPrompt = `
You are a HUMAN interviewer.
Sound natural, curious, and professional.

Rules:
- Ask ONLY ONE question.
- Never repeat questions.
- Briefly react like a human.
- Ask deeper follow-ups.
- Do NOT answer yourself.
`;

    const userPrompt = `
Resume:
${resumeContext}

Previous interview:
${history || "None"}

Candidate last answer:
"${previousAnswer || "Interview starting"}"

Ask a ${type} interview question.
`;

    const nextQuestion = await chatCompletion({
      systemPrompt,
      userPrompt,
    });

    session.lastQuestion = nextQuestion;
    await session.save();

    res.json({
      success: true,
      nextQuestion,
      questionType: type,
    });
  } catch (err) {
    next(err);
  }
};

//---------------------------------------------------
// PDF REPORT GENERATOR (SAFE + NO NaN)
//---------------------------------------------------
const createReport = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { resumeId } = req.body;

    const session = await InterviewSession.findOne({ user: userId, resume: resumeId });
    if (!session || session.qa.length === 0) {
      throw new Error("No interview data found");
    }

    const dir = path.join(__dirname, "../../tmp");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);

    const filePath = path.join(dir, `interview_report_${Date.now()}.pdf`);

    const doc = new PDFDocument({ margin: 40 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    doc.fontSize(22).text("Interview Evaluation Report", { align: "center" });
    doc.moveDown(2);

    let total = 0;
    let count = 0;

    session.qa.forEach((q, i) => {
      doc.fontSize(14).text(`Q${i + 1}: ${q.question}`);
      doc.fontSize(12).text(`Answer: ${q.answer}`);

      if (q.score && typeof q.score.overall === "number") {
        total += q.score.overall;
        count++;

        doc.fontSize(11).text(
          `Scores → Tech: ${q.score.technical}/10 | Clarity: ${q.score.clarity}/10 | Depth: ${q.score.depth}/10 | Overall: ${q.score.overall}/10`
        );
        doc.fontSize(11).text(`Feedback: ${q.score.feedback}`);
      } else {
        doc.fontSize(11).text("Score: Not evaluated");
      }

      doc.moveDown();
    });

    const avg = count > 0 ? (total / count).toFixed(1) : "0.0";

    let verdict = "No Hire";
    if (count < 3) verdict = "Insufficient Data";
    else if (avg >= 8) verdict = "Strong Hire";
    else if (avg >= 6.5) verdict = "Hire";
    else if (avg >= 5) verdict = "Borderline";

    doc.addPage();
    doc.fontSize(18).text("Final Result");
    doc.moveDown();
    doc.fontSize(14).text(`Average Score: ${avg} / 10`);
    doc.fontSize(14).text(`Recommendation: ${verdict}`);

    doc.end();

    stream.on("finish", () => res.download(filePath));
  } catch (err) {
    next(err);
  }
};

module.exports = {
  generateNextQuestion,
  createReport,
};
