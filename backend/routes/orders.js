// backend/routes/orders.js
const express = require('express');
const router = express.Router();
const {
  getShopkeeperOrders,
  createOrder,
  updateOrder,
  deleteOrder,
  getOrderById, // 1. Import the new function
} = require('../controllers/orderController');
const auth = require('../middleware/authMiddleware');

// PRIVATE: Get orders for the logged-in shopkeeper
router.get('/', auth, getShopkeeperOrders);

// PUBLIC: Get a single order for tracking
router.get('/track/:id', getOrderById); // 2. Add the new public route

// PUBLIC: Customers can create orders
router.post('/', createOrder);

// PRIVATE: Shopkeepers can update and delete their own orders
router.put('/:id', auth, updateOrder);
router.delete('/:id', auth, deleteOrder);

module.exports = router;
