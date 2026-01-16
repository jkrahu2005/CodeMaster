const axios = require('axios');

// Fixed wait function (actually delays)
const waiting = (timer) => new Promise(resolve => setTimeout(resolve, timer));

// Correct language mapping
const getLanguageById = (lang) => {
  const map = {
    "cpp": 54,
    "c++": 54,
    "c": 50,
    "java": 62,
    "javascript": 63,
    "node": 63,
    "python": 71,
    "py": 71
  };

  const id = map[lang.toLowerCase()];

  if (!id) {
    throw new Error(`Unsupported language: ${lang}`);
  }

  return id;
};


// Submit batch
const submitBatch = async (submissions) => {
  const options = {
    method: 'POST',
    url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
    params: { base64_encoded: 'false' },
    headers: {
      'x-rapidapi-key': 'f955e7ac9emsh9e674b0721d7f4ap140505jsn828eafc6f50c',
      'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
      'Content-Type': 'application/json'
    },
    data: { submissions }
  };

  try {
    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    console.error("Batch Submit Error:", error);
    throw error;
  }
};

// Poll Judge0 until all tokens are done
const submitToken = async (resultToken) => {
  const options = {
    method: 'GET',
    url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
    params: {
      tokens: resultToken.join(","),
      base64_encoded: 'false',
      fields: '*'
    },
    headers: {
      'x-rapidapi-key': 'f955e7ac9emsh9e674b0721d7f4ap140505jsn828eafc6f50c',
      'x-rapidapi-host': 'judge0-ce.p.rapidapi.com'
    }
  };

  const fetchData = async () => {
    const response = await axios.request(options);
    return response.data;
  };

  while (true) {
    const result = await fetchData();
    const allDone = result.submissions.every(r => r.status_id > 2);
    if (allDone) return result.submissions;
    await waiting(1000); // Wait 1 second before next poll
  }
};

module.exports = { getLanguageById, submitBatch, submitToken };
