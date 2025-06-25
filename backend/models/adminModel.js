const mongoose = require('mongoose');

// Define Admin Schema
const adminSchema = new mongoose.Schema({
  instituteName: {
    type: String,
    required: [true, 'Institute Name is required'],
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
  },
  phoneNumber: {
    type: String,
    required: [false, 'Phone Number is required'],
    unique: true,  // Ensure phoneNumber is unique
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,  // Ensure email is unique
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],  // Email format validation
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
  },
  role: {
    type: String,
    default: 'admin', // Default role is 'admin'
  },
  resetPasswordOTP: {
    type: String,
  },
  resetPasswordOTPExpiry: {
    type: Date,
  },
}, {
  timestamps: true,  // Adds createdAt and updatedAt fields
});

// Remove password hashing and comparison methods
// No need for `bcrypt` or `pre-save` middleware anymore

// Create and export the model
const Admin = mongoose.model('Admin', adminSchema);
module.exports = Admin;
