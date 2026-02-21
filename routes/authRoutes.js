const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const upload = require('../middleware/upload');

const { Types } = require('mongoose');

// Add or remove favorite restaurant

// @route   POST /api/auth/favorite/:restaurantId
// @desc    Add a restaurant to user's favorites
// @access  Private (user only)
router.post('/favorite/:restaurantId', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    console.log('TOKEN:', token);
    if (!token) return res.status(401).json({ message: 'Not authorized' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    console.log('DECODED:', decoded);
    const user = await User.findById(decoded.id);
    console.log('USER:', user);
    if (!user || user.role !== 'user') return res.status(403).json({ message: 'Only users can favorite restaurants' });
    const restId = req.params.restaurantId;
    console.log('RESTAURANT ID:', restId);
    if (!Types.ObjectId.isValid(restId)) return res.status(400).json({ message: 'Invalid restaurant ID' });
    console.log('USER FAVORITES:', user.favorites);
    if (user.favorites.some(fav => fav.toString() === restId)) return res.status(400).json({ message: 'Already favorited' });
    user.favorites.push(restId);
    await user.save();
    res.status(200).json({ success: true, favorites: user.favorites });
  } catch (err) {
    console.error('FAVORITE ERROR:', err);
    res.status(500).json({ message: err.message });
  }
});

// @route   DELETE /api/auth/favorite/:restaurantId
// @desc    Remove a restaurant from user's favorites
// @access  Private (user only)
router.delete('/favorite/:restaurantId', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Not authorized' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const user = await User.findById(decoded.id);
    if (!user || user.role !== 'user') return res.status(403).json({ message: 'Only users can unfavorite restaurants' });
    const restId = req.params.restaurantId;
    if (!Types.ObjectId.isValid(restId)) return res.status(400).json({ message: 'Invalid restaurant ID' });
    user.favorites = user.favorites.filter(fav => fav.toString() !== restId);
    await user.save();
    res.status(200).json({ success: true, favorites: user.favorites });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET /api/auth/favorites
// @desc    Get user's favorite restaurants
// @access  Private (user only)
router.get('/favorites', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Not authorized' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const user = await User.findById(decoded.id).populate('favorites');
    if (!user || user.role !== 'user') return res.status(403).json({ message: 'Only users can view favorites' });
    res.status(200).json({ success: true, favorites: user.favorites });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, captchaToken } = req.body;

    // Verify reCAPTCHA
    if (process.env.RECAPTCHA_SECRET_KEY) {
      const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${captchaToken}`;
      const recaptchaRes = await fetch(verifyUrl, { method: 'POST' });
      const recaptchaData = await recaptchaRes.json();
      if (!recaptchaData.success) {
        return res.status(400).json({ message: 'Invalid reCAPTCHA. Please try again.' });
      }
    }

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    user = await User.create({
      name,
      email,
      password,
      role
    });

    // Create token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', {
      expiresIn: '30d'
    });

    res.status(201).json({ success: true, token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password, captchaToken } = req.body;

    // Verify reCAPTCHA
    if (process.env.RECAPTCHA_SECRET_KEY) {
      const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${captchaToken}`;
      const recaptchaRes = await fetch(verifyUrl, { method: 'POST' });
      const recaptchaData = await recaptchaRes.json();
      if (!recaptchaData.success) {
        return res.status(400).json({ message: 'Invalid reCAPTCHA. Please try again.' });
      }
    }

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide an email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });

    res.status(200).json({ success: true, token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET /api/auth/me
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const user = await User.findById(decoded.id);

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   PUT /api/auth/updatedetails
router.put('/updatedetails', upload.single('avatar'), async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    
    const fieldsToUpdate = {
      name: req.body.name,
      email: req.body.email
    };

    if (req.file) {
      fieldsToUpdate.avatar = req.file.path;
    }

    const user = await User.findByIdAndUpdate(decoded.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Middleware to protect admin routes
const protectAdmin = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden, admin role required' });
    }
    req.user = decoded; // Attach user payload to request
    next();
  } catch (err) {
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

// @route   GET /api/auth/users
// @desc    Get all users (Admin only)
router.get('/users', protectAdmin, async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   PUT /api/auth/users/:id
// @desc    Update user role (Admin only)
router.put('/users/:id', protectAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'storekeeper', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, {
      new: true,
      runValidators: true
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   DELETE /api/auth/users/:id
// @desc    Delete a user (Admin only)
router.delete('/users/:id', protectAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;