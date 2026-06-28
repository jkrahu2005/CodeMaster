const mongoose = require("mongoose");

async function main() {
  if (mongoose.connection.readyState === 1) return;

  await mongoose.connect(process.env.DB_CONNECT_STRING);

  console.log("MongoDB Connected");
}

module.exports = main;