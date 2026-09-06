// backend/routes/customer.js
const express = require('express');
const router = express.Router();
const {
  getFavorites,
  addFavorite,
  removeFavorite,
  getRecentSearches,
  saveRecentSearch,
  clearRecentSearches,
  getDashboardData,
} = require('../controllers/customerController');
const auth = require('../middleware/authMiddleware');

// All customer routes require authentication
router.get('/favorites', auth, getFavorites);
router.post('/favorites/:shopId', auth, addFavorite);
router.delete('/favorites/:shopId', auth, removeFavorite);

router.get('/recent-searches', auth, getRecentSearches);
router.post('/recent-searches', auth, saveRecentSearch);
router.delete('/recent-searches', auth, clearRecentSearches);

router.get('/dashboard', auth, getDashboardData);

module.exports = router;
