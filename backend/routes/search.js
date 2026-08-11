// backend/routes/search.js
const express = require('express');
const router = express.Router();
const { globalSearch } = require('../controllers/searchController');

// GET /api/search?pincode=XXX&q=milk&sort=price_asc
router.get('/', globalSearch);

module.exports = router;
