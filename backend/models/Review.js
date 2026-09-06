// backend/models/Review.js
const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  review: {
    type: String,
    trim: true,
    maxlength: 500,
  },
  customerName: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// One review per customer per shop
ReviewSchema.index({ customer: 1, shop: 1 }, { unique: true });
// For fetching shop reviews
ReviewSchema.index({ shop: 1, createdAt: -1 });

module.exports = mongoose.model('Review', ReviewSchema);
