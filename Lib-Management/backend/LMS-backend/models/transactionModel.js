const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  action: { type: String, enum: ['lend', 'return'], required: true },
  date: { type: Date, required: true },
});

module.exports = mongoose.model('Transaction', transactionSchema);
