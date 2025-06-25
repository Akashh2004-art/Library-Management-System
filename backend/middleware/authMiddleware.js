const jwt = require('jsonwebtoken');
const Admin = require('../models/adminModel');
const User = require('../models/userModel');

// Middleware for User authentication
const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided, authorization denied' });
    }

    // Ekhane JWT_SECRET er bodole JWT_SECRET_USER use korbo
    const decoded = jwt.verify(token, process.env.JWT_SECRET_USER);
    req.user = await User.findById(decoded.id);
    if (!req.user) {
      return res.status(404).json({ message: 'User not found' });
    }

    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Middleware for Admin authentication
const adminProtect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Please login as admin to access this page' });
    }

    // Ekhane JWT_SECRET er bodole JWT_SECRET_ADMIN use korbo
    const decoded = jwt.verify(token, process.env.JWT_SECRET_ADMIN);
    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    req.admin = admin;
    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    return res.status(401).json({ message: 'Invalid or expired token. Please login again.' });
  }
};

module.exports = { protect, adminProtect };