// backend/models/Product.js
const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
  },
  unit: {
    type: String,
    required: true,
    trim: true,
    default: 'piece',
  },
  productImage: {
    type: String,
    default: 'https://placehold.co/400x400/a7a7ff/white?text=Product',
  },
  // NEW: Stock toggle
  inStock: {
    type: Boolean,
    default: true,
  },
  // NEW: Quantity type system
  quantityType: {
    type: String,
    enum: ['weight', 'unit'],
    default: 'unit',
  },
  quantityOptions: {
    type: [String],
    default: [],
  },
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

module.exports = mongoose.model('Product', ProductSchema);
