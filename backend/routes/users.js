// backend/routes/users.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { updateShopDetails, getShopDetails } = require('../controllers/userController');

// @route   GET /api/users/shop
// @desc    Get shop details for logged-in user
router.get('/shop', auth, getShopDetails);

// @route   PUT /api/users/shop
// @desc    Update shop details for logged-in user
router.put('/shop', auth, updateShopDetails);

module.exports = router;
