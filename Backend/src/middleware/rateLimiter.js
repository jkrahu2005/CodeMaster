const redisClient = require("../config/reddis");

const COOLDOWN_TIME = 10; // seconds

const rateLimiter = async (req, res, next) => {
  try {
    const userId = req.result._id.toString();
    const key = `cooldown:submit:${userId}`;

    const exists = await redisClient.exists(key);
    if (exists) {
      const ttl = await redisClient.ttl(key);
      return res.status(429).json({
        success: false,
        message: `You are submitting too fast. Please wait ${ttl} more seconds.`,
      });
    }

    // Set key with expiration to act as cooldown
    await redisClient.set(key, "1", "EX", COOLDOWN_TIME);

    next();
  } catch (error) {
    console.error("Cooldown Rate Limiter Error:", error);
    res.status(500).json({ success: false, message: "Internal server error in rate limiter." });
  }
};

module.exports = rateLimiter;
