const validate = require('../utils/validator');
const User = require('../models/user');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const redisClient = require('../config/reddis');
const Submission = require('../models/submission');
const crypto = require('crypto');                       // for generating reset token
const nodemailer = require('nodemailer');               // to send emails
const PasswordResetToken = require('../models/PasswordResetToken'); // your token model

// Configure email transporter (use environment variables)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// ---------- Existing functions (unchanged) ----------
const register = async (req, res) => {
  try {
    validate(req.body);

    const { emailId, password } = req.body;

    req.body.password = await bcrypt.hash(password, 10);
    req.body.role = "user";

    const user = await User.create(req.body);

    const token = jwt.sign(
      {
        _id: user._id,
        emailId: user.emailId,
        role: user.role,
      },
      process.env.JWT_KEY,
      { expiresIn: 60 * 60 }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite:
        process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 60 * 60 * 1000,
    });

    const reply = {
      firstName: user.firstName,
      emailId: user.emailId,
      _id: user._id,
      role: user.role,
    };

    res.status(201).json({
      success: true,
      user: reply,
      message: "User registered successfully",
    });
  } catch (err) {
    console.error(err);

    res.status(400).json({
      success: false,
      message: err.message || "Registration failed",
    });
  }
};

const login = async (req, res) => {
  try {
    const { emailId, password } = req.body;

    if (!emailId || !password) {
      throw new Error("Invalid Credentials");
    }

    const user = await User.findOne({ emailId });

    if (!user) {
      throw new Error("User does not exist");
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      throw new Error("Password is incorrect");
    }

    const reply = {
      firstName: user.firstName,
      emailId: user.emailId,
      _id: user._id,
      role: user.role,
    };

    const token = jwt.sign(
      {
        _id: user._id,
        emailId: user.emailId,
        role: user.role,
      },
      process.env.JWT_KEY,
      {
        expiresIn: 60 * 60,
      }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite:
        process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      user: reply,
      message: "Logged in successfully",
    });
  } catch (err) {
    console.error(err);

    res.status(401).json({
      success: false,
      message: err.message || "Login failed",
    });
  }
};

const logout = async (req, res) => {
  try {
    const { token } = req.cookies;
    const payload = jwt.decode(token);
    await redisClient.set(`token:${token}`, 'blocked');
    await redisClient.expireAt(`token:${token}`, payload.exp);
    res.cookie("token", null, { expires: new Date(Date.now()) });
    res.send("logged out successfully");
  } catch (err) {
    res.status(401).send("error occured:" + err);
  }
};

const adminRegister = async (req, res) => {
  try {
    validate(req.body);
    const { firstName, emailId, password } = req.body;
    req.body.password = await bcrypt.hash(password, 10);
    req.body.role = 'admin';
    const user = await User.create(req.body);
    const token = jwt.sign({ _id: user._id, emailID: emailId, role: user.role }, process.env.JWT_KEY, { expiresIn: 60 * 60 });
    res.cookie('token', token, { maxAge: 60 * 60 * 1000 });
    res.status(201).send("user registered successfully");
  } catch (err) {
    res.status(401).send("error occured:" + err);
  }
};

const DeleteProfile = async (req, res) => {
  try {
    const userId = req.result._id;
    await User.findByIdAndDelete(userId);
    await Submission.deleteMany({ userId });
    res.status(200).send("deleted successfully");
  } catch (err) {
    res.status(500).send("Internal server error" + err);
  }
};

// ---------- NEW: Forgot password functions ----------
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Check if user exists
    const user = await User.findOne({ emailId: email });
    if (!user) {
      return res.status(404).json({ message: "No account found with this email" });
    }

    // Generate a secure token
    const token = crypto.randomBytes(32).toString('hex');

    // ✅ LOG TOKEN TO CONSOLE FOR TESTING
    console.log("=".repeat(50));
    console.log(`🔐 PASSWORD RESET TOKEN`);
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Token: ${token}`);
    console.log(`🔗 Reset Link: ${process.env.FRONTEND_URL}/reset-password?token=${token}`);
    console.log("=".repeat(50));

    // Delete any existing unused tokens for this user
    await PasswordResetToken.deleteMany({ userId: user._id });

    // Save new token (expires in 1 hour)
    await PasswordResetToken.create({
      userId: user._id,
      token: token,
      expiresAt: Date.now() + 3600000  // 1 hour
    });

    // Send email with reset link
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    const mailOptions = {
      to: user.emailId,
      subject: 'Password Reset Request',
      html: `<p>You requested a password reset. Click <a href="${resetLink}">here</a> to set a new password. This link expires in 1 hour.</p>`
    };

    await transporter.sendMail(mailOptions);
    
    // ✅ Optional: Log that email was sent
    console.log(`✅ Reset email sent to: ${email}`);

    res.status(200).json({ message: "Password reset link sent to your email" });
  } catch (err) {
    console.error("❌ Error in forgotPassword:", err);
    res.status(500).json({ message: "Server error while sending reset link" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ message: "Token and new password are required" });
    }

    // ✅ Log token being used for debugging
    console.log(`🔄 Attempting to reset password with token: ${token.substring(0, 20)}...`);

    // Find valid token
    const resetToken = await PasswordResetToken.findOne({
      token: token,
      expiresAt: { $gt: Date.now() }
    });

    if (!resetToken) {
      console.log(`❌ Invalid or expired token: ${token.substring(0, 20)}...`);
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    console.log(`✅ Token found for user ID: ${resetToken.userId}`);

    // Find the user
    const user = await User.findById(resetToken.userId);
    if (!user) {
      console.log(`❌ User not found for ID: ${resetToken.userId}`);
      return res.status(404).json({ message: "User not found" });
    }

    console.log(`✅ User found: ${user.emailId}`);

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    user.password = hashedPassword;
    await user.save();

    // Delete the used token so it cannot be reused
    await PasswordResetToken.deleteOne({ _id: resetToken._id });

    console.log(`✅ Password updated successfully for: ${user.emailId}`);

    res.status(200).json({ message: "Password updated successfully. You can now login." });
  } catch (err) {
    console.error("❌ Error in resetPassword:", err);
    res.status(500).json({ message: "Server error while resetting password" });
  }
};

// ---------- Updated exports ----------
module.exports = {
  register,
  login,
  logout,
  adminRegister,
  DeleteProfile,
  forgotPassword,   // new
  resetPassword     // new
};