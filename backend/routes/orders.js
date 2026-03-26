// backend/routes/orders.js
const express = require('express');
const router = express.Router();
const {
  getShopkeeperOrders,
  createOrder,
  updateOrder,
  deleteOrder,
  getOrderById,
  getCustomerOrders,
} = require('../controllers/orderController');
const auth = require('../middleware/authMiddleware');
const authorizeRole = require('../middleware/roleMiddleware');

// PRIVATE: Get orders for the logged-in shopkeeper
router.get('/', auth, authorizeRole('shopkeeper'), getShopkeeperOrders);

// PRIVATE: Get orders for the logged-in customer
router.get('/my-orders', auth, getCustomerOrders);

// PUBLIC: Get a single order for tracking
router.get('/track/:id', getOrderById);

// PUBLIC: Customers can create orders
router.post('/', createOrder);

// PRIVATE: Shopkeepers can update and delete their own orders
router.put('/:id', auth, authorizeRole('shopkeeper'), updateOrder);
router.delete('/:id', auth, authorizeRole('shopkeeper'), deleteOrder);

module.exports = router;
