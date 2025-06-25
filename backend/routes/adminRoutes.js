const express = require('express');
const router = express.Router();
const { 
  registerAdmin, 
  adminLogin, 
  checkEmail, 
  sendOTP, 
  verifyOTP, 
  resetPassword,
  getAllUsers,
  updateUser,
  getAdminDashboard
} = require('../controllers/adminController');
const { adminProtect } = require('../middleware/authMiddleware');
const { getAllTransactions } = require('../controllers/transactionController'); // Existing imports er sathe add korun

// Admin authentication routes
router.post('/register', registerAdmin);
router.post('/login', adminLogin);
router.post('/check-email', checkEmail);
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword);

// Protected admin routes
router.get('/dashboard', adminProtect, getAdminDashboard);
router.get('/users', adminProtect, getAllUsers);
router.put('/users/:userId', adminProtect, updateUser);

// Existing routes er niche ei route ta add korun
router.get('/transactions', adminProtect, getAllTransactions);

module.exports = router;