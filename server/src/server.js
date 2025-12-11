console.log(">>> CWD:", process.cwd());
require("dotenv").config();
console.log(">>> ENV LOADED, GROQ_MODEL =", process.env.GROQ_MODEL);

const http = require("http");
const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

console.log("Groq KEY exists:", !!process.env.GROQ_API_KEY);

const startServer = async () => {
  try {
    await connectDB();

    const server = http.createServer(app);

    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err.message);
    process.exit(1);
  }
};

startServer();
