// // backend/models/Order.js
// const mongoose = require('mongoose');

// const OrderSchema = new mongoose.Schema({
//   customerName: { type: String, required: true },
//   customerContact: { type: String, required: true },
//   customerAddress: { type: String, required: true },
//   items: [{
//     name: String,
//     quantity: Number,
//   }],
//   // UPDATED the status enum to include the new options
//   status: {
//     type: String,
//     enum: ['Pending', 'Confirmed', 'Packed', 'Ready to Deliver'],
//     default: 'Pending',
//   },
//   shop: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true,
//   },
//   createdAt: { type: Date, default: Date.now },
// });

// module.exports = mongoose.model('Order', OrderSchema);



// backend/models/Order.js
const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  customerContact: { type: String, required: true },
  customerAddress: { type: String, required: true },
  // UPDATE THE ITEMS ARRAY
  items: [{
    name: String,
    quantity: Number,
    price: Number, // Price per unit at the time of order
    unit: String,  // Unit at the time of order
  }],
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Packed', 'Ready to Deliver'],
    default: 'Pending',
  },
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Order', OrderSchema);
