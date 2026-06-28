const express = require('express');
const Middleware = require('../middleware/userMiddleware');
const authRouter = express.Router();
const {
  register,
  login,
  logout,
  adminRegister,
  DeleteProfile,
  forgotPassword,   // ✅ new
  resetPassword     // ✅ new
} = require('../controllers/userAuthent');
const adminMiddleware = require('../middleware/adminMiddleware');

// Public routes (no authentication required)
authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/forgot-password', forgotPassword);   // ✅ new: request reset link
authRouter.post('/reset-password', resetPassword);     // ✅ new: update password with token

// Protected routes (require authentication)
authRouter.post('/logout', Middleware, logout);
authRouter.post('/admin/register', adminMiddleware, adminRegister);
authRouter.post('/deleteProfile', Middleware, DeleteProfile);

// Check authentication status
authRouter.get('/check', Middleware, (req, res) => {
  try {
    const reply = {
      firstName: req.result.firstName,
      emailId: req.result.emailId,
      _id: req.result._id,
      role: req.result.role
    };
    res.status(200).json({   // 200 is more appropriate than 201 for a check
      user: reply,
      message: "Valid User"
    });
  } catch (err) {
    res.status(500).send("Internal Server Error while authenticating");
  }
});

module.exports = authRouter;