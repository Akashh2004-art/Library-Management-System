const Admin = require('../models/adminModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Admin Registration
const registerAdmin = async (req, res) => {
  const { instituteName, name, phoneNumber, email, password, confirmPassword } = req.body;

  // Validate inputs
  if (!instituteName || !name || !phoneNumber || !email || !password || !confirmPassword) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Check if phone number is valid
  if (!phoneNumber || phoneNumber.trim() === "") {
    return res.status(400).json({ message: 'Phone number is required' });
  }

  // Check if passwords match
  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  try {
    // Check if admin already exists (either by email or phone number)
    const existingAdmin = await Admin.findOne({ $or: [{ email }, { phoneNumber }] });
    if (existingAdmin) {
      return res.status(409).json({ message: 'Admin with this email or phone number already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new admin
    const newAdmin = new Admin({
      instituteName,
      name,
      phoneNumber,
      email,
      password: hashedPassword,
      role: 'admin', // Explicitly set role as admin
    });

    // Save the new admin
    await newAdmin.save();

    res.status(201).json({ message: 'Admin registered successfully' });
  } catch (error) {
    console.error('Error during admin registration:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};



// Admin Login

const adminLogin = async (req, res) => {
  const { emailOrPhone, password } = req.body;

  // Validate inputs
  if (!emailOrPhone || !password) {
    return res.status(400).json({ message: 'Email or Phone and password are required' });
  }

  try {
    // Log the incoming data for debugging
    console.log('Login attempt with:', emailOrPhone);

    // Check if admin exists by email or phone number
    const admin = await Admin.findOne({
      $or: [{ email: emailOrPhone }, { phoneNumber: emailOrPhone }],
    });

    // Log the result for debugging
    console.log('Admin found:', admin);

    if (!admin) {
      return res.status(401).json({ message: 'Invalid email/phone or password' });
    }

    // Trim the password to remove any extra spaces
    const trimmedPassword = password.trim();

    // Verify password
    const isPasswordValid = await bcrypt.compare(trimmedPassword, admin.password);

    // Log the result of the password comparison for debugging
    console.log('Password valid:', isPasswordValid);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email/phone or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = adminLogin;



module.exports = { registerAdmin, adminLogin };
