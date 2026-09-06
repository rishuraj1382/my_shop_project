// backend/controllers/reviewController.js
const Review = require('../models/Review');
const User = require('../models/User');
const Order = require('../models/Order');

// POST /api/reviews — Create or update a review
exports.createReview = async (req, res) => {
  const { shopId, orderId, rating, review } = req.body;
  const customerId = req.user.id;

  try {
    if (!shopId || !rating) {
      return res.status(400).json({ message: 'shopId and rating are required' });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Verify the order belongs to this customer and is delivered (optional check)
    if (orderId) {
      const order = await Order.findById(orderId);
      if (!order || order.customer?.toString() !== customerId) {
        return res.status(403).json({ message: 'You can only review orders you placed' });
      }
    }

    // Get customer name for display
    const customer = await User.findById(customerId).select('name username');
    const customerName = customer?.name || customer?.username || 'Anonymous';

    // Upsert: update if review exists, create if not
    const existingReview = await Review.findOne({ customer: customerId, shop: shopId });
    
    let savedReview;
    if (existingReview) {
      existingReview.rating = rating;
      existingReview.review = review || '';
      existingReview.order = orderId;
      existingReview.createdAt = new Date();
      savedReview = await existingReview.save();
    } else {
      const newReview = new Review({
        customer: customerId,
        shop: shopId,
        order: orderId,
        rating,
        review: review || '',
        customerName,
      });
      savedReview = await newReview.save();
    }

    // Recompute shop average rating atomically
    const stats = await Review.aggregate([
      { $match: { shop: require('mongoose').Types.ObjectId.createFromHexString(shopId) } },
      { $group: { _id: '$shop', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);

    if (stats.length > 0) {
      await User.findByIdAndUpdate(shopId, {
        averageRating: Math.round(stats[0].avgRating * 10) / 10,
        totalReviews: stats[0].count,
      });
    }

    res.status(existingReview ? 200 : 201).json(savedReview);
  } catch (err) {
    console.error('[reviewController ERROR]', err.message);
    res.status(500).send('Server error');
  }
};

// GET /api/reviews/shop/:shopId — Public: get reviews for a shop
exports.getShopReviews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ shop: req.params.shopId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('customer', 'name username');

    const total = await Review.countDocuments({ shop: req.params.shopId });

    res.json({ reviews, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('[reviewController ERROR]', err.message);
    res.status(500).send('Server error');
  }
};

// GET /api/reviews/mine — Get reviews written by the logged-in customer
exports.getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ customer: req.user.id })
      .sort({ createdAt: -1 })
      .populate('shop', 'shopName shopImage averageRating');

    res.json(reviews);
  } catch (err) {
    console.error('[reviewController ERROR]', err.message);
    res.status(500).send('Server error');
  }
};

// GET /api/reviews/check/:shopId — Check if current user has reviewed a shop
exports.checkMyReview = async (req, res) => {
  try {
    const review = await Review.findOne({ customer: req.user.id, shop: req.params.shopId });
    res.json({ hasReviewed: !!review, review: review || null });
  } catch (err) {
    res.status(500).send('Server error');
  }
};
