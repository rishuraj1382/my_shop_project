// backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    sparse: true, // allows multiple null values (not all users have email)
  },
  password: {
    type: String,
    required: function () { return !this.googleId; },
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local',
  },
  profilePicture: {
    type: String,
  },
  role: {
    type: String,
    enum: ['customer', 'shopkeeper', 'superadmin'],
    default: 'shopkeeper',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  // Common fields
  name: {
    type: String,
    trim: true,
  },
  mobileNumber: {
    type: String,
    trim: true,
  },
  // Customer-specific fields
  savedAddresses: {
    type: [String],
    default: [],
  },
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  recentSearches: {
    type: [String],
    default: [],
  },
  // Shopkeeper-specific fields
  shopName: {
    type: String,
    trim: true,
  },
  city: {
    type: String,
    trim: true,
  },
  pincode: {
    type: String,
    trim: true,
  },
  fullAddress: {
    type: String,
    trim: true,
  },
  // Exact map location (optional — set via Registration or Settings location picker)
  location: {
    address: { type: String, trim: true },
    latitude: { type: Number },
    longitude: { type: Number },
  },
  // Real shop photos are uploaded via Cloudinary (POST /api/users/shop/image) and
  // stored as the returned secure_url. Empty string = no photo uploaded yet; the
  // frontend renders a design-system fallback (icon/initials) in that case. The
  // old literal placehold.co URL below is no longer the default for new shops,
  // but is still recognized as "no real image" by the frontend for shops created
  // before this change (no migration was run — nothing to fix, purely additive).
  shopImage: {
    type: String,
    default: '',
  },
  // Shopkeeper rating (computed from reviews)
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  totalReviews: {
    type: Number,
    default: 0,
  },
  // Denormalized product count for shop cards
  productCount: {
    type: Number,
    default: 0,
  },
  // Whether the shop is currently accepting orders
  isOpen: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model('User', UserSchema);
