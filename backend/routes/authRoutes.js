const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');
const { checkEmail, sendOTP, verifyOTP, resetPassword } = require('../controllers/userController');

// Auth routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Password reset routes
router.post('/check-email', checkEmail);
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword);

module.exports = router;