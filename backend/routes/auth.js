// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const auth = require('../middleware/authMiddleware');

// @route   POST /api/auth/register
// @desc    Register a new user (customer or shopkeeper)
router.post('/register', register);

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
router.post('/login', login);

// @route   GET /api/auth/me
// @desc    Get current user info
router.get('/me', auth, getMe);

module.exports = router;