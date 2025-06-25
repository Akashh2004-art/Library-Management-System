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

// Add the new function to fetch all transactions with formatted data
const getAllTransactions = async (req, res) => {
  try {
    // Sob transactions fetch korbo with user and book details
    const transactions = await Transaction.find()
      .populate('userId', 'name email') 
      .populate('bookId', 'title')
      .sort({ date: -1 }); // Latest transactions age dekhabe

    const formattedTransactions = transactions.map(transaction => ({
      id: transaction._id,
      userId: transaction.userId._id,
      userName: transaction.userId.name,
      bookId: transaction.bookId._id,
      bookTitle: transaction.bookId.title,
      type: transaction.action === 'lend' ? 'borrow' : 'return',
      date: transaction.date,
      dueDate: transaction.dueDate,
      status: transaction.status
    }));

    res.status(200).json(formattedTransactions);
  } catch (error) {
    console.error('Error in fetching transactions:', error);
    res.status(500).json({ message: 'Transaction fetch korte problem hocche' });
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
    // Check if there's already a pending request
    const existingRequest = await Transaction.findOne({
      userId,
      bookId,
      status: 'Pending'
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'A request for this book is already pending' });
    }

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Create new transaction with Pending status
    const newTransaction = new Transaction({
      userId,
      bookId,
      action: 'lend',
      date: new Date(),
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      status: 'Pending' // Explicitly set status
    });

    const savedTransaction = await newTransaction.save();
    
    // Create notification for admin
    const notification = new Notification({
      type: 'BORROW_REQUEST',
      userId,
      bookId,
      transactionId: savedTransaction._id,
      message: `New borrow request for book: ${book.title}`,
      status: 'unread'
    });

    await notification.save();

    // Return response with status
    res.status(201).json({ 
      message: 'Borrow request created successfully', 
      transaction: savedTransaction,
      status: 'Pending'
    });

  } catch (error) {
    console.error('Error in lendBook:', error);
    res.status(500).json({ message: 'Error processing borrow request', error: error.message });
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

// Update borrow request status
const updateBorrowRequestStatus = async (req, res) => {
  const { transactionId, status } = req.body;

  if (!['Accepted', 'Rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const transaction = await Transaction.findById(transactionId);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    transaction.status = status; // Update status
    await transaction.save();

    res.json({ message: 'Borrow request status updated successfully', transaction });
  } catch (error) {
    console.error('Error updating borrow request status:', error);
    res.status(500).json({ message: 'Failed to update status', error: error.message });
  }
};

module.exports = { 
  getTransactions, 
  addTransaction, 
  lendBook, 
  returnBook,
  updateBorrowRequestStatus,
  getAllTransactions // Add this to exports
};
