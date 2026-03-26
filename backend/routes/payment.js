// backend/routes/payment.js
const express = require('express');
const router = express.Router();
const {
  createRazorpayOrder,
  verifyPayment,
  placeOrder,
} = require('../controllers/paymentController');

// POST /api/payment/create-order — Create a Razorpay order
router.post('/create-order', createRazorpayOrder);

// POST /api/payment/verify-payment — Verify Razorpay payment signature and save order
router.post('/verify-payment', verifyPayment);

// POST /api/payment/place-order — Place a COD order
router.post('/place-order', placeOrder);

module.exports = router;
