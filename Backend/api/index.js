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

let initialized = false;

async function initialize() {
  if (initialized) return;

  await main();

  if (!redisClient.isOpen) {
    await redisClient.connect();
  }

  initialized = true;
  console.log("MongoDB & Redis Connected");
}

app.use(async (req, res, next) => {
  try {
    await initialize();
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = app;