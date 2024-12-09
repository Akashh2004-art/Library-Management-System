const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');

// Import Controllers
const { getBooks, addBook } = require('./controllers/bookController');
const { getMembers, addMember } = require('./controllers/memberController');
const { getTransactions, addTransaction } = require('./controllers/transactionController');
const { registerUser, loginUser } = require('./controllers/authController');
const { registerAdmin, adminLogin } = require('./controllers/adminController');
const { lendBook, returnBook } = require('./controllers/transactionController');

// Import Middleware
const { protect, adminProtect } = require('./middleware/authMiddleware');

// Load environment variables from .env file
dotenv.config();

// Validate environment variables
if (!process.env.MONGODB_URI || !process.env.JWT_SECRET) {
  console.error('Error: Missing required environment variables (MONGODB_URI, JWT_SECRET)');
  process.exit(1);
}

const app = express();
app.use(express.json()); // Middleware to parse JSON request body

// Middleware
app.use(cors()); // Allow requests from frontend
app.use(bodyParser.json()); // Parse incoming request bodies (for handling form data, etc.)

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes

// Books Routes
app.get('/api/books', getBooks); // Fetch all books (open to all users)
app.post('/api/books', adminProtect, addBook); // Add a new book (admin-only)

// Members Routes
app.get('/api/members', protect, getMembers); // Fetch all members (protected)
app.post('/api/members', adminProtect, addMember); // Add a new member (admin-only)

// Transactions Routes
app.get('/api/transactions', adminProtect, getTransactions); // Fetch all transactions (admin-only)
app.post('/api/transactions', adminProtect, addTransaction); // Add a new transaction (admin-only)

// Authentication Routes
app.post('/api/auth/register', registerUser); // Register new user (Member)
app.post('/api/auth/login', loginUser); // Login user (Generate token)

// Admin Routes
app.post('/api/admin/register', registerAdmin); // Register a new admin
app.post('/api/admin/login', adminLogin); // Admin login (Generate token)

// Example of a protected route (for authenticated users)
app.get('/api/protected', protect, (req, res) => {
  res.send('This is a protected route');
});

// Lend a book (Protected)
app.post('/api/books/lend', protect, lendBook);

// Return a book (Protected)
app.post('/api/books/return', protect, returnBook);

// Fallback Route (for 404s)
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler (for uncaught errors)
app.use((err, req, res, next) => {
  console.error(err.stack); // Log the error stack to the console
  res.status(500).json({ message: 'Server error', error: err.message });
});

// Start Server
const PORT = process.env.PORT || 5000; // Ensure this port matches the frontend API calls
app.listen(PORT, () => {
  console.log(`Backend connected @ port ${PORT}`);
});
