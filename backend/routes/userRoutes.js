const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getUserProfile,
  updateRegNo,
  updateSemester,
  checkEmail,
  sendOTP,
  verifyOTP,
  resetPassword,
  getBorrowRequests,
  getBorrowedBooks // Add this
} = require('../controllers/userController');

// Profile routes
router.get('/profile', protect, getUserProfile);
router.patch('/update-regno', protect, updateRegNo);
router.patch('/update-semester', protect, updateSemester);

// Borrow requests route
router.get('/borrow-requests', protect, getBorrowRequests);

// Borrowed books route
router.get('/borrowed-books', protect, getBorrowedBooks);

// Password reset routes
router.post('/check-email', checkEmail);
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword);

module.exports = router;