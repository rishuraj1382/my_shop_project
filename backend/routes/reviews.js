// backend/routes/reviews.js
const express = require('express');
const router = express.Router();
const { createReview, getShopReviews, getMyReviews, checkMyReview } = require('../controllers/reviewController');
const auth = require('../middleware/authMiddleware');

// POST /api/reviews — Create/update a review (customer only)
router.post('/', auth, createReview);

// GET /api/reviews/mine — Get my reviews
router.get('/mine', auth, getMyReviews);

// GET /api/reviews/check/:shopId — Check if I reviewed a shop
router.get('/check/:shopId', auth, checkMyReview);

// GET /api/reviews/shop/:shopId — Public: get reviews for a shop
router.get('/shop/:shopId', getShopReviews);

module.exports = router;
