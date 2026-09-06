// backend/models/Product.js
const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  category: {
    type: String,
    trim: true,
    default: 'General',
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
  // Stock toggle
  inStock: {
    type: Boolean,
    default: true,
  },
  // Quantity type system
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Text index for global product search
ProductSchema.index({ name: 'text', description: 'text', category: 'text' });
// Index for shop + price queries (global search sorting)
ProductSchema.index({ shop: 1, price: 1 });
ProductSchema.index({ price: 1 });

module.exports = mongoose.model('Product', ProductSchema);
