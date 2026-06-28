const axios = require("axios");

// Wait helper
const waiting = (timer) => new Promise((resolve) => setTimeout(resolve, timer));

// Language mapping
const getLanguageById = (lang) => {
  const map = {
    cpp: 54,
    "c++": 54,
    c: 50,
    java: 62,
    javascript: 63,
    node: 63,
    python: 71,
    py: 71,
  };

  const id = map[lang.toLowerCase()];

  if (!id) {
    throw new Error(`Unsupported language: ${lang}`);
  }

  return id;
};

// Common headers
const headers = {
  "x-rapidapi-key": process.env.JUDGE0_API_KEY,
  "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
};

// Submit batch
const submitBatch = async (submissions) => {
  const options = {
    method: "POST",
    url: "https://judge0-ce.p.rapidapi.com/submissions/batch",
    params: {
      base64_encoded: "false",
    },
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
    data: {
      submissions,
    },
  };

  try {
    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    console.error("Batch Submit Error:", error.response?.data || error.message);
    throw error;
  }
};

// Poll Judge0 until all submissions finish
const submitToken = async (resultToken) => {
  const options = {
    method: "GET",
    url: "https://judge0-ce.p.rapidapi.com/submissions/batch",
    params: {
      tokens: resultToken.join(","),
      base64_encoded: "false",
      fields: "*",
    },
    headers,
  };

  const fetchData = async () => {
    const response = await axios.request(options);
    return response.data;
  };

  while (true) {
    const result = await fetchData();

    const allDone = result.submissions.every(
      (submission) => submission.status_id > 2
    );

    if (allDone) {
      return result.submissions;
    }

    await waiting(1000);
  }
};

module.exports = {
  getLanguageById,
  submitBatch,
  submitToken,
};