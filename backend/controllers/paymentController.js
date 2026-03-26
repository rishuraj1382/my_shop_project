// backend/controllers/paymentController.js
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// POST /api/payment/create-order
// Creates a Razorpay order and returns order details to the frontend
const createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const options = {
      amount: Math.round(amount * 100), // Razorpay expects amount in paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    };

    const razorpayOrder = await razorpayInstance.orders.create(options);

    res.json({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error('Error creating Razorpay order:', err);
    res.status(500).json({ message: 'Failed to create Razorpay order' });
  }
};

// POST /api/payment/verify-payment
// Verifies Razorpay payment signature and saves order to DB
const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderData,
    } = req.body;

    // 1. Verify the payment signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Payment verification failed. Invalid signature.' });
    }

    // 2. Signature is valid — save order to database
    const newOrder = new Order({
      customerName: orderData.customerName,
      customerContact: orderData.customerContact,
      customerAddress: orderData.customerAddress,
      items: orderData.items,
      totalAmount: orderData.totalAmount,
      shop: orderData.shopId,
      customer: orderData.customerId,
      paymentMethod: 'Online',
      paymentStatus: 'Paid',
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
    });

    const savedOrder = await newOrder.save();

    // 3. Emit socket event for real-time dashboard update
    const io = req.io;
    if (io) {
      io.emit('newOrder', savedOrder);
    }

    res.json({ message: 'Payment verified and order placed!', order: savedOrder });
  } catch (err) {
    console.error('Error verifying payment:', err);
    res.status(500).json({ message: 'Payment verification failed' });
  }
};

// POST /api/payment/place-order
// Places a COD order directly without payment gateway
const placeOrder = async (req, res) => {
  try {
    const { customerName, customerContact, customerAddress, items, totalAmount, shopId, customerId } = req.body;

    if (!customerName || !customerContact || !customerAddress || !items || !totalAmount || !shopId) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const newOrder = new Order({
      customerName,
      customerContact,
      customerAddress,
      items,
      totalAmount,
      shop: shopId,
      customer: customerId,
      paymentMethod: 'COD',
      paymentStatus: 'Pending',
    });

    const savedOrder = await newOrder.save();

    // Emit socket event for real-time dashboard update
    const io = req.io;
    if (io) {
      io.emit('newOrder', savedOrder);
    }

    res.json({ message: 'Order placed successfully (COD)!', order: savedOrder });
  } catch (err) {
    console.error('Error placing COD order:', err);
    res.status(500).json({ message: 'Failed to place order' });
  }
};

module.exports = {
  createRazorpayOrder,
  verifyPayment,
  placeOrder,
};
