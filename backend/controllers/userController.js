const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const { generateOTP, sendEmail } = require('../utils/helpers');
const Transaction = require('../models/transactionModel');
const Book = require('../models/bookModel'); // Add this import

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update registration number
const updateRegNo = async (req, res) => {
  try {
    const { regNo } = req.body;
    
    if (!regNo) {
      return res.status(400).json({ message: 'Registration number is required' });
    }

    // Check if user already has a registration number
    const user = await User.findById(req.user._id);
    if (user.regNo) {
      return res.status(400).json({ message: 'Registration number can only be set once' });
    }

    // Check if regNo is already taken
    const existingUser = await User.findOne({ regNo });
    if (existingUser) {
      return res.status(400).json({ message: 'Registration number already exists' });
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { regNo },
      { new: true }
    ).select('-password');

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update semester
const updateSemester = async (req, res) => {
  try {
    const { semester } = req.body;
    
    if (!semester) {
      return res.status(400).json({ message: 'Semester is required' });
    }

    const user = await User.findById(req.user._id);

    // Check if user has set their registration number
    if (!user.regNo) {
      return res.status(400).json({ message: 'Please set your registration number first' });
    }

    // Check if 20 days have passed since last update
    if (user.lastSemesterUpdateDate) {
      const daysSinceLastUpdate = Math.floor(
        (new Date() - new Date(user.lastSemesterUpdateDate)) / (1000 * 60 * 60 * 24)
      );
      
      if (daysSinceLastUpdate < 20) {
        return res.status(400).json({ 
          message: 'Semester can only be updated after 20 days',
          daysRemaining: 20 - daysSinceLastUpdate
        });
      }
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { 
        semester,
        lastSemesterUpdateDate: new Date()
      },
      { new: true }
    ).select('-password');

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Check if user email exists
const checkEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    
    return res.json({ exists: !!user });
  } catch (error) {
    console.error('Error checking user email:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Send OTP to user email
const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Generate a 6-digit OTP
    const otp = generateOTP(6);
    
    // Save OTP to user document with expiry time (15 minutes)
    user.resetPasswordOTP = otp;
    user.resetPasswordOTPExpiry = Date.now() + 15 * 60 * 1000;
    await user.save();
    
    // Send email with OTP
    await sendEmail({
      to: email,
      subject: 'Password Reset OTP',
      text: `Your OTP for password reset is: ${otp}. This OTP will expire in 15 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #4f46e5;">Password Reset OTP</h2>
          <p>Hello ${user.name},</p>
          <p>You requested to reset your password. Please use the following OTP to complete the process:</p>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; text-align: center; font-size: 24px; letter-spacing: 5px; font-weight: bold;">
            ${otp}
          </div>
          <p>This OTP will expire in 15 minutes.</p>
          <p>If you didn't request this, please ignore this email or contact support if you have concerns.</p>
          <p>Thank you,<br>Library Management System</p>
        </div>
      `
    });
    
    return res.json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    return res.status(500).json({ message: 'Failed to send OTP' });
  }
};

// Verify OTP
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ 
      email,
      resetPasswordOTP: otp,
      resetPasswordOTPExpiry: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }
    
    return res.json({ success: true });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Reset password
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ 
      email,
      resetPasswordOTP: otp,
      resetPasswordOTPExpiry: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    user.password = hashedPassword;
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpiry = undefined;
    await user.save();
    
    return res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    return res.status(500).json({ message: 'Failed to reset password' });
  }
};

const getBorrowedBooks = async (req, res) => {
  try {
    // Find books where user has active borrow records
    const books = await Book.find({
      'borrowRecords': {
        $elemMatch: {
          userId: req.user._id,
          status: { $in: ['borrowed', 'Accepted'] }
        }
      }
    });

    console.log('Found borrowed books:', books);
    res.json(books);
    
  } catch (error) {
    console.error('Error in getBorrowedBooks:', error);
    res.status(500).json({ message: 'Error fetching borrowed books' });
  }
};

const getBorrowRequests = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find all books with borrow records for this user
    const books = await Book.find({
      'borrowRecords.userId': userId
    });

    // Extract and format borrow requests
    const borrowRequests = books.flatMap(book => 
      book.borrowRecords
        .filter(record => record.userId.toString() === userId.toString())
        .map(record => ({
          _id: record._id,
          book: {
            _id: book._id,
            title: book.title,
            author: book.author
          },
          status: record.status, // Ensure status is correctly fetched
          borrowDate: record.borrowDate,
          dueDate: record.dueDate,
          plannedReturnDate: record.plannedReturnDate
        }))
    );

    res.json(borrowRequests);
  } catch (error) {
    console.error('Error fetching borrow requests:', error);
    res.status(500).json({ 
      message: 'Failed to fetch borrow requests',
      error: error.message 
    });
  }
};

// Update the exports to include getBorrowRequests
module.exports = {
  getBorrowedBooks,
  getUserProfile,
  updateRegNo,
  updateSemester,
  checkEmail,
  sendOTP,
  verifyOTP,
  resetPassword,
  getBorrowRequests // Add this
};