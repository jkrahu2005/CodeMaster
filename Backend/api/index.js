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

app.use("/user", authRouter);
app.use("/problem", problemRouter);
app.use("/submission", submitRouter);
app.use("/ai", aiRouter);
app.use("/video", videoRouter);

let isConnected = false;

async function connect() {
  if (isConnected) return;

  await Promise.all([
    main(),
    redisClient.isOpen ? Promise.resolve() : redisClient.connect(),
  ]);

  console.log("MongoDB & Redis Connected");
  isConnected = true;
}

// This runs before every serverless invocation
module.exports = async (req, res) => {
  try {
    await connect();
    return app(req, res);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server initialization failed",
    });
  }
};