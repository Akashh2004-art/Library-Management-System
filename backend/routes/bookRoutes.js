const express = require('express');
const router = express.Router();
const { protect, adminProtect } = require('../middleware/authMiddleware');
const { 
    getBooks, 
    addBook,
    updateBook,
    deleteBook,
    getBooksByDepartmentAndSemester,
    createBorrowRequest,
    updateBookStatus  // Add this controller
} = require('../controllers/bookController');

// Public routes
router.get('/', getBooks);

// Protected routes
router.post('/borrow-request', protect, createBorrowRequest);
router.get('/filter', protect, getBooksByDepartmentAndSemester);

// Admin routes
router.post('/', adminProtect, addBook);
router.put('/:id', adminProtect, updateBook);
router.delete('/:id', adminProtect, deleteBook);
router.put('/:id/status', adminProtect, updateBookStatus);  // Add this route

module.exports = router;