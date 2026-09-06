// backend/routes/shops.js
const express = require('express');
const router = express.Router();
const { searchShopsByPincode, getShopById } = require('../controllers/shopController');

// @route   GET /api/shops/search/:pincode
router.get('/search/:pincode', searchShopsByPincode);

// @route   GET /api/shops/:id
// @desc    Get a single shop by ID
router.get('/:id', getShopById);

module.exports = router;
