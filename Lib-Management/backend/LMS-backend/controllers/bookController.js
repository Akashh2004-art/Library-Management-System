const Book = require('../models/bookModel');

// Fetch all books
const getBooks = async (req, res) => {
  try {
    const books = await Book.find(); // Fetch all books from the database
    res.status(200).json(books); // Return the books as JSON
  } catch (error) {
    res.status(500).json({ message: 'Error fetching books', error: error.message });
  }
};

// Add a new book
const addBook = async (req, res) => {
  const { title, author, isbn, copiesAvailable } = req.body;

  // Validate input
  if (!title || !author || !isbn || copiesAvailable === undefined) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const newBook = new Book({
      title,
      author,
      isbn,
      copiesAvailable,
    });

    const savedBook = await newBook.save();
    res.status(201).json({ message: 'Book added successfully', book: savedBook });
  } catch (error) {
    res.status(500).json({ message: 'Error adding book', error: error.message });
  }
};

module.exports = { getBooks, addBook };
