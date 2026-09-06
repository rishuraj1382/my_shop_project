// backend/controllers/paymentController.js
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const User = require('../models/User');
const emailService = require('../services/emailService');

// ---------------------------------------------------------------------------
// Razorpay is OPTIONAL. The server starts and COD works normally even when
// RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET are absent or still set to their
// placeholder values. Online payments become available automatically once real
// credentials are added to the environment — no code change required.
// ---------------------------------------------------------------------------

/** Placeholder strings written in .env.example / .env template files. */
const PLACEHOLDER_VALUES = new Set([
  'your-razorpay-key-id',
  'your-razorpay-key-secret',
  'rzp_test_YOUR_KEY_ID_HERE',
  'YOUR_KEY_SECRET_HERE',
]);

/**
 * Returns true only when both Razorpay env vars are present and contain real
 * (non-placeholder) values. Call this at request time, not at module load.
 */
const isRazorpayConfigured = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  return (
    keyId && keyId.trim() !== '' && !PLACEHOLDER_VALUES.has(keyId.trim()) &&
    keySecret && keySecret.trim() !== '' && !PLACEHOLDER_VALUES.has(keySecret.trim())
  );
};

/** Lazy singleton — only instantiated when credentials are actually present. */
let _razorpayInstance = null;
const getRazorpayInstance = () => {
  if (!_razorpayInstance) {
    _razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return _razorpayInstance;
};

// Log once at startup so the deployment logs make the status clear.
if (isRazorpayConfigured()) {
  console.log('[Payment] Razorpay credentials detected. Online payments enabled.');
} else {
  console.warn('[Payment] Razorpay credentials not configured. Online payments disabled.');
}

// Helper: fetch shop name
const getShopName = async (shopId) => {
  try {
    const shop = await User.findById(shopId).select('shopName');
    return shop?.shopName || '';
  } catch { return ''; }
};

// POST /api/payment/create-order
const createRazorpayOrder = async (req, res) => {
  // Guard: return a clear error if Razorpay credentials are not configured.
  if (!isRazorpayConfigured()) {
    return res.status(503).json({
      message: 'Online payments are not available. Please use Cash on Delivery.',
    });
  }
  try {
    const { amount, shopId } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }
    if (!shopId) {
      return res.status(400).json({ message: 'shopId is required' });
    }
    const shop = await User.findById(shopId).select('isOpen');
    if (shop && shop.isOpen === false) {
      return res.status(403).json({ message: 'This shop is currently closed. You can browse products, but ordering is temporarily unavailable.' });
    }
    const options = {
      amount: Math.round(amount * 100), // Razorpay expects paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    };
    const razorpayOrder = await getRazorpayInstance().orders.create(options);
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
const verifyPayment = async (req, res) => {
  // Guard: a payment can only be verified when Razorpay is configured.
  if (!isRazorpayConfigured()) {
    return res.status(503).json({
      message: 'Online payments are not available. Please use Cash on Delivery.',
    });
  }
  try {
    const {
      razorpay_order_id, razorpay_payment_id, razorpay_signature, orderData,
    } = req.body;

    // 1. Verify the payment signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Payment verification failed. Invalid signature.' });
    }

    // 2. Fetch shop name for denormalization
    // NOTE: Intentionally does NOT re-check shop.isOpen here. By this point Razorpay
    // has already captured the customer's payment (see signature verification above).
    // Rejecting a captured payment would leave the customer paid with no order record.
    // The closed-shop gate is enforced earlier, at createRazorpayOrder, before any money moves.
    const shopName = await getShopName(orderData.shopId);

    // 3. Save order to database
    const newOrder = new Order({
      customerName: orderData.customerName,
      customerContact: orderData.customerContact,
      customerAddress: orderData.customerAddress,
      items: orderData.items,
      totalAmount: orderData.totalAmount,
      shop: orderData.shopId,
      shopName,
      customer: orderData.customerId,
      fulfillmentType: orderData.fulfillmentType,
      paymentMethod: 'Online',
      paymentStatus: 'Paid',
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
    });

    const savedOrder = await newOrder.save();

    emailService.notifyNewOrder(savedOrder);

    // 4. Emit socket event for real-time dashboard update
    const io = req.io;
    if (io) {
      io.emit('newOrder', savedOrder);
      // Notify shopkeeper room
      io.to(`shop:${orderData.shopId}`).emit('newOrder', savedOrder);
    }

    res.json({ message: 'Payment verified and order placed!', order: savedOrder });
  } catch (err) {
    console.error('Error verifying payment:', err);
    res.status(500).json({ message: 'Payment verification failed' });
  }
};

// POST /api/payment/place-order — COD
const placeOrder = async (req, res) => {
  try {
    const { customerName, customerContact, customerAddress, items, totalAmount, shopId, customerId, fulfillmentType } = req.body;

    if (!customerName || !customerContact || !customerAddress || !items || !totalAmount || !shopId) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Fetch shop name for denormalization, and check it's accepting orders
    const shop = await User.findById(shopId).select('shopName isOpen');
    if (shop && shop.isOpen === false) {
      return res.status(403).json({ message: 'This shop is currently closed. You can browse products, but ordering is temporarily unavailable.' });
    }
    const shopName = shop?.shopName || '';

    const newOrder = new Order({
      customerName,
      customerContact,
      customerAddress,
      items,
      totalAmount,
      shop: shopId,
      shopName,
      customer: customerId,
      fulfillmentType,
      paymentMethod: 'COD',
      paymentStatus: 'Pending',
    });

    const savedOrder = await newOrder.save();

    emailService.notifyNewOrder(savedOrder);

    // Emit socket event for real-time dashboard update
    const io = req.io;
    if (io) {
      io.emit('newOrder', savedOrder);
      // Notify shopkeeper room
      io.to(`shop:${shopId}`).emit('newOrder', savedOrder);
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
