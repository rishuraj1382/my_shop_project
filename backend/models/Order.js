// backend/models/Order.js
const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  customerContact: { type: String, required: true },
  customerAddress: { type: String, required: true },
  items: [{
    name: String,
    quantity: Number,
    price: Number,
    unit: String,
    selectedOption: String,
  }],
  totalAmount: {
    type: Number,
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: ['Online', 'COD'],
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed'],
    default: 'Pending',
  },
  razorpayOrderId: {
    type: String,
  },
  razorpayPaymentId: {
    type: String,
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Packed', 'Ready to Deliver', 'Out For Delivery', 'Ready for Pickup', 'Delivered', 'Cancelled'],
    default: 'Pending',
  },
  fulfillmentType: {
    type: String,
    enum: ['Delivery', 'Pickup'],
    default: 'Delivery',
  },
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // Denormalized shop name for faster customer order queries
  shopName: {
    type: String,
    trim: true,
  },
  // Link to logged-in customer for order history
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: { type: Date, default: Date.now },
});

// Index for customer order queries
OrderSchema.index({ customer: 1, createdAt: -1 });
OrderSchema.index({ shop: 1, createdAt: -1 });

module.exports = mongoose.model('Order', OrderSchema);
