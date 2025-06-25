const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    bookId: {  // Add this
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: false
    },
    transactionId: {  // Add this
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction',
        required: false
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['BORROW_REQUEST', 'RETURN_REMINDER', 'GENERAL'],
        default: 'GENERAL'
    },
    details: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    status: {
        type: String,
        enum: ['unread', 'read', 'confirmed', 'rejected'],
        default: 'unread'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Notification', notificationSchema);