const mongoose = require('mongoose');

// Create borrowing record schema
const borrowRecordSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    borrowDate: {
        type: Date,
        default: Date.now
    },
    dueDate: {
        type: Date,
        required: true
    },
    plannedReturnDate: {  // New field
        type: Date,
        required: true
    },
    actualReturnDate: {
        type: Date,
        default: null
    },
    status: {  // Update enum and default value
        type: String,
        enum: ['Pending', 'Accepted', 'Rejected', 'borrowed', 'returned', 'overdue'],
        default: 'Pending' // Default status is Pending
    }
});

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    isbn: {
        type: String,
        required: true,
        unique: true
    },
    department: {
        type: String,
        required: true,
        enum: ['C.S.T', 'E.E', 'E.T.C.E']
    },
    semester: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    description: {
        type: String,
        required: true
    },
    availableQuantity: {
        type: Number,
        default: function() {
            return this.quantity;
        }
    },
    borrowedQuantity: {
        type: Number,
        default: 0
    },
    borrowRecords: [borrowRecordSchema]
}, { timestamps: true });

module.exports = mongoose.model('Book', bookSchema);