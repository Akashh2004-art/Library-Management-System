const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');

// Load environment variables
dotenv.config();

// Import Middleware
const { protect, adminProtect } = require('./middleware/authMiddleware');

// Import Route Files
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const bookRoutes = require('./routes/bookRoutes');
const userRoutes = require('./routes/userRoutes');
const notificationRoutes = require('./routes/notificationroutes');
const transactionRoutes = require('./routes/transactionRoutes'); // Add this line

// Import Controllers
const { getMembers, addMember } = require('./controllers/memberController');
const { getTransactions, addTransaction } = require('./controllers/transactionController');
const { getBorrowedBooks } = require('./controllers/userController'); // Add this line

// Initialize express
const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:8000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect(
  process.env.MONGODB_URI || 'mongodb+srv://akashsahTKy3FSYS@cluster0.iz9uj.mongodb.net/lms-db-1',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
)
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin/notifications', notificationRoutes);
app.use('/api/transactions', transactionRoutes); // Add this line

// Remove these lines since they're now handled in transactionRoutes
// app.get('/api/transactions', adminProtect, getTransactions);
// app.post('/api/transactions', adminProtect, addTransaction);

// Add this new route
app.get('/api/users/borrowed-books', protect, getBorrowedBooks);

// Member Routes (Direct)
app.get('/api/members', protect, getMembers);
app.post('/api/members', adminProtect, addMember);

// Protected Route Test
app.get('/api/protected', protect, (req, res) => {
  res.json({ message: 'You have accessed a protected route' });
});

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({
    message: 'Route not found',
    requestedUrl: req.originalUrl,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Server error',
    error: process.env.NODE_ENV === 'development' ? err : {},
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API endpoint: http://localhost:${PORT}`);
});

module.exports = app;
