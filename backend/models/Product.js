
// const mongoose = require('mongoose');

// const ProductSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true,
//     trim: true,
//   },
//   price: {
//     type: Number,
//     required: true,
//   },
//   // ADD THIS FIELD TO LINK THE PRODUCT TO A SHOP
//   shop: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User', // This creates a reference to the User model
//     required: true,
//   },
// });

// module.exports = mongoose.model('Product', ProductSchema);

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
  // ADD THESE NEW FIELDS
  unit: {
    type: String,
    required: true,
    trim: true,
    default: 'piece' // e.g., "per kg", "litre", "500g pack"
  },
  productImage: {
    type: String,
    default: 'https://placehold.co/400x400/a7a7ff/white?text=Product', // A default placeholder image
  },
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

module.exports = mongoose.model('Product', ProductSchema);
