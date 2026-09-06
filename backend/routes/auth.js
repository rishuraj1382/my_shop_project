// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile, googleAuth } = require('../controllers/authController');
const auth = require('../middleware/authMiddleware');

// @route   POST /api/auth/register
router.post('/register', register);

// @route   POST /api/auth/login
router.post('/login', login);

// @route   POST /api/auth/google
router.post('/google', googleAuth);

// @route   GET /api/auth/me
router.get('/me', auth, getMe);

// @route   PATCH /api/auth/profile
// @desc    Update customer profile (name, email, mobile, saved addresses)
router.patch('/profile', auth, updateProfile);

module.exports = router;