const Admin = require('../models/adminModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { generateOTP, sendEmail } = require('../utils/helpers');
const User = require('../models/userModel');

// Add the generateAdminToken helper function
const generateAdminToken = (admin) => {
  return jwt.sign(
    { id: admin._id, role: 'admin' },
    process.env.JWT_SECRET_ADMIN,  // JWT_SECRET theke JWT_SECRET_ADMIN e change korlam
    { expiresIn: '24h' }
  );
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('name email department regNo semester')
      .sort({ createdAt: -1 });
    
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

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

    // Use the new generateAdminToken function
    const token = generateAdminToken(admin);

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


// Add this new function with your existing functions
const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, department, regNo, semester } = req.body;

    // Basic validation
    if (!name || !department) {
      return res.status(400).json({ 
        message: 'Name and department are required' 
      });
    }

    // Find user and check if exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }

    // Check if registration number is unique if provided
    if (regNo) {
      const existingUser = await User.findOne({ 
        regNo, 
        _id: { $ne: userId } 
      });
      
      if (existingUser) {
        return res.status(400).json({ 
          message: 'Registration number already exists' 
        });
      }
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        name,
        department,
        regNo: regNo || undefined,
        semester: semester || undefined,
        // Update lastSemesterUpdateDate if semester is changed
        ...(semester && { lastSemesterUpdateDate: new Date() })
      },
      { 
        new: true,
        runValidators: true 
      }
    ).select('name email department regNo semester lastSemesterUpdateDate');

    res.status(200).json(updatedUser);

  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ 
      message: 'Failed to update user',
      error: error.message 
    });
  }
};


// Check if admin email exists
const checkEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const admin = await Admin.findOne({ email });
    
    return res.json({ exists: !!admin });
  } catch (error) {
    console.error('Error checking admin email:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Send OTP to admin email
const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const admin = await Admin.findOne({ email });
    
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    
    // Generate a 6-digit OTP
    const otp = generateOTP(6);
    
    // Save OTP to admin document with expiry time (15 minutes)
    admin.resetPasswordOTP = otp;
    admin.resetPasswordOTPExpiry = Date.now() + 15 * 60 * 1000;
    await admin.save();
    
    // Send email with OTP
    await sendEmail({
      from: `"ITGPC-LMS Admin" <${process.env.EMAIL}>`,
      to: email,
      subject: 'Password Reset OTP',
      text: `Your OTP for password reset is: ${otp}. This OTP will expire in 15 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #4f46e5;">Password Reset OTP</h2>
          <p>Hello ${admin.name},</p>
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
    const admin = await Admin.findOne({ 
      email,
      resetPasswordOTP: otp,
      resetPasswordOTPExpiry: { $gt: Date.now() }
    });
    
    if (!admin) {
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
    const admin = await Admin.findOne({ 
      email,
      resetPasswordOTP: otp,
      resetPasswordOTPExpiry: { $gt: Date.now() }
    });
    
    if (!admin) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    admin.password = hashedPassword;
    admin.resetPasswordOTP = undefined;
    admin.resetPasswordOTPExpiry = undefined;
    await admin.save();
    
    return res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    return res.status(500).json({ message: 'Failed to reset password' });
  }
};

// Add this function if it's missing
const getAdminDashboard = async (req, res) => {
  try {
    // Add your dashboard logic here
    res.json({
      message: 'Admin dashboard data',
      // Add other dashboard data as needed
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Make sure to export it
module.exports = {
  registerAdmin,
  adminLogin,
  checkEmail,
  sendOTP,
  verifyOTP,
  resetPassword,
  getAllUsers,
  updateUser,
  getAdminDashboard  // Add this to exports
};
