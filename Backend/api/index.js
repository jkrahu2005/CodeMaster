const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();

const main = require("../src/config/db");
const redisClient = require("../src/config/reddis");

const authRouter = require("../src/routes/userAuth");
const problemRouter = require("../src/routes/problemCreator");
const submitRouter = require("../src/routes/submit");
const aiRouter = require("../src/routes/aiChatting");
const videoRouter = require("../src/routes/videoCreator");

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

let initialized = false;

async function initialize() {
  if (initialized) return;

  await main();

  if (!redisClient.isOpen) {
    await redisClient.connect();
  }

  initialized = true;
  console.log("✅ MongoDB & Redis Connected");
}

app.use(async (req, res, next) => {
  try {
    await initialize();
    next();
  } catch (err) {
    next(err);
  }
});

// ======================
// Health Check Routes
// ======================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🚀 CodeMaster Backend is running",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend is healthy",
    environment: process.env.NODE_ENV,
    mongodb: "connected",
    redis: redisClient.isOpen ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});

// ======================
// Routes
// ======================

app.use("/user", authRouter);
app.use("/problem", problemRouter);
app.use("/submission", submitRouter);
app.use("/ai", aiRouter);
app.use("/video", videoRouter);

// ======================
// Global Error Handler
// ======================

app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

module.exports = app;