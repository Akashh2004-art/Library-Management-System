const express = require('express');
const router = express.Router();
const { adminProtect } = require('../middleware/authMiddleware');
const { 
    getNotifications, 
    markAsRead, 
    markAllAsRead, 
    confirmNotification, // Add confirm
    rejectNotification    // Add reject
} = require('../controllers/notificationController');

router.get('/', adminProtect, getNotifications);
router.put('/:id/read', adminProtect, markAsRead);
router.put('/read-all', adminProtect, markAllAsRead);

// New Routes for Confirm and Reject
router.put('/:id/confirm', adminProtect, confirmNotification); // Confirm notification
router.put('/:id/reject', adminProtect, rejectNotification);   // Reject notification

module.exports = router;