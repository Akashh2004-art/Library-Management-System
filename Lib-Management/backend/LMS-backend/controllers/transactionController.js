const Transaction = require('../models/transactionModel');
const Book = require('../models/bookModel');

// Fetch all transactions
const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate('userId', 'name email') // Assuming userId is a reference to the User model
      .populate('bookId', 'title author'); // Assuming bookId is a reference to the Book model

    res.status(200).json(transactions); // Return the transactions
  } catch (error) {
    res.status(500).json({ message: 'Error fetching transactions', error: error.message });
  }
};

// Add a new transaction (if required for custom logic)
const addTransaction = async (req, res) => {
  const { userId, bookId, action } = req.body;

  // Validate input
  if (!userId || !bookId || !action) {
    return res.status(400).json({ message: 'User ID, Book ID, and Action are required' });
  }

  try {
    const newTransaction = new Transaction({
      userId,
      bookId,
      action,
      date: new Date(),
    });

    const savedTransaction = await newTransaction.save();
    res.status(201).json({ message: 'Transaction added successfully', transaction: savedTransaction });
  } catch (error) {
    res.status(500).json({ message: 'Error adding transaction', error: error.message });
  }
};

// Lend a book
const lendBook = async (req, res) => {
  const { userId, bookId } = req.body;

  if (!userId || !bookId) {
    return res.status(400).json({ message: 'User ID and Book ID are required' });
  }

  try {
    const book = await Book.findById(bookId);
    if (!book || book.copiesAvailable < 1) {
      return res.status(400).json({ message: 'Book not available for lending' });
    }

    const newTransaction = new Transaction({
      userId,
      bookId,
      action: 'lend',
      date: new Date(),
    });

    await newTransaction.save();
    book.copiesAvailable -= 1;
    await book.save();

    res.status(201).json({ message: 'Book lent successfully', transaction: newTransaction });
  } catch (error) {
    res.status(500).json({ message: 'Error lending book', error: error.message });
  }
};

// Return a book
const returnBook = async (req, res) => {
  const { userId, bookId } = req.body;

  if (!userId || !bookId) {
    return res.status(400).json({ message: 'User ID and Book ID are required' });
  }

  try {
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(400).json({ message: 'Book not found' });
    }

    const newTransaction = new Transaction({
      userId,
      bookId,
      action: 'return',
      date: new Date(),
    });

    await newTransaction.save();
    book.copiesAvailable += 1;
    await book.save();

    res.status(201).json({ message: 'Book returned successfully', transaction: newTransaction });
  } catch (error) {
    res.status(500).json({ message: 'Error returning book', error: error.message });
  }
};

module.exports = { getTransactions, addTransaction, lendBook, returnBook };
