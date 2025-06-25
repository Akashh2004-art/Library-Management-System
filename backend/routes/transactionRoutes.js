const express = require('express');
const router = express.Router();
const { protect, adminProtect } = require('../middleware/authMiddleware');
const { 
  getTransactions, 
  addTransaction, 
  lendBook, 
  returnBook,
  updateBorrowRequestStatus // Add this import
} = require('../controllers/transactionController');

// Fetch all transactions (Admin only)
router.get('/', adminProtect, getTransactions);

// Add a new transaction (General endpoint, if needed)
router.post('/', protect, addTransaction);

// Lend a book (User requests to borrow a book)
router.post('/lend', protect, lendBook);

// Return a book (User requests to return a book)
router.post('/return', protect, returnBook);

// Update borrow request status (Admin only)
router.patch('/update-status', adminProtect, updateBorrowRequestStatus);

module.exports = router;