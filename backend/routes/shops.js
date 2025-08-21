// backend/routes/shops.js
const express = require('express');
const router = express.Router();
const { searchShopsByPincode } = require('../controllers/shopController');

// @route   GET /api/shops/search/:pincode
// @desc    Search for shops by pincode
router.get('/search/:pincode', searchShopsByPincode);

module.exports = router;
