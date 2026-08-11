const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const mongoose = require('mongoose');
const { protect } = require('../middleware/authMiddleware');

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'super_secret_hostel_admin_key_2026',
    { expiresIn: '30d' }
  );
};

// @desc    Admin Login
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both username and password',
      });
    }

    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({
        success: false,
        message: 'Database is not connected. Please verify your MONGODB_URI in .env file.',
      });
    }

    // Check if admin user exists in DB; if empty, auto seed initial admin
    let admin = await Admin.findOne({ username: username.toLowerCase().trim() });

    if (!admin) {
      const totalAdmins = await Admin.countDocuments();
      if (totalAdmins === 0) {
        // Auto-create initial admin if DB has no admin record yet
        const defaultUser = (process.env.ADMIN_USERNAME || 'admin').toLowerCase().trim();
        const defaultPass = process.env.ADMIN_PASSWORD || 'admin123';

        if (username.toLowerCase().trim() === defaultUser && password === defaultPass) {
          admin = await Admin.create({
            username: defaultUser,
            password: defaultPass,
            name: 'Hostel Chief Warden',
            role: 'Admin',
          });
        }
      }
    }

    if (admin && (await admin.matchPassword(password))) {
      return res.json({
        success: true,
        data: {
          _id: admin._id,
          username: admin.username,
          name: admin.name,
          role: admin.role,
          token: generateToken(admin._id),
        },
      });
    } else {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin username or password',
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: `Database or authentication error: ${error.message}`,
    });
  }
});

// @desc    Get Current Admin User
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  res.json({
    success: true,
    data: req.admin,
  });
});

// @desc    Update Admin Profile & Password (Inside Dashboard Option)
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, username, currentPassword, newPassword } = req.body;

    const admin = await Admin.findById(req.admin._id);

    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin record not found' });
    }

    // Require current password for security verification if changing password or username
    if (currentPassword || newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ success: false, message: 'Please enter your current password to authorize changes' });
      }
      const isMatch = await admin.matchPassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Current password is incorrect' });
      }
    }

    // Update username if changed (and check uniqueness)
    if (username && username.toLowerCase().trim() !== admin.username) {
      const existingUser = await Admin.findOne({
        username: username.toLowerCase().trim(),
        _id: { $ne: admin._id },
      });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Username is already taken by another admin' });
      }
      admin.username = username.toLowerCase().trim();
    }

    // Update display name
    if (name) {
      admin.name = name.trim();
    }

    // Update password if new password provided
    if (newPassword) {
      if (newPassword.length < 5) {
        return res.status(400).json({ success: false, message: 'New password must be at least 5 characters long' });
      }
      admin.password = newPassword; // Pre-save hook will hash this!
    }

    await admin.save();

    res.json({
      success: true,
      message: 'Admin profile and credentials updated successfully',
      data: {
        _id: admin._id,
        username: admin.username,
        name: admin.name,
        role: admin.role,
        token: generateToken(admin._id),
      },
    });
  } catch (error) {
    console.error('Error updating admin profile:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error updating admin profile' });
  }
});

module.exports = router;
