const jwt = require('jsonwebtoken');
const Admin = require('../models/adminModel');

// Middleware to protect routes (for any authenticated user)
const protect = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', ''); // Retrieve token from header

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify token
    req.user = decoded; // Attach user info to the request object
    next(); // Call next middleware or route handler
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Middleware to protect admin-only routes
const adminProtect = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', ''); // Retrieve token from header

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify token
    req.user = decoded; // Attach user info to the request object

    // Check if the user is an admin
    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      return res.status(403).json({ message: 'Not authorized as admin' });
    }

    req.admin = admin; // Attach admin info to the request object
    next(); // Call next middleware or route handler
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = { protect, adminProtect };
