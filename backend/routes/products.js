// backend/routes/products.js
const express = require('express');
const router = express.Router();
const {
  getShopkeeperProducts,
  getProductsByShop,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleStock,
} = require('../controllers/productController');
const auth = require('../middleware/authMiddleware');
const authorizeRole = require('../middleware/roleMiddleware');

// PRIVATE route for a logged-in shopkeeper to get their own products
router.get('/', auth, authorizeRole('shopkeeper'), getShopkeeperProducts);

// PUBLIC route for customers to get products from a specific shop
router.get('/shop/:shopId', getProductsByShop);

// PRIVATE routes for shopkeeper actions only
router.post('/', auth, authorizeRole('shopkeeper'), createProduct);
router.put('/:id', auth, authorizeRole('shopkeeper'), updateProduct);
router.delete('/:id', auth, authorizeRole('shopkeeper'), deleteProduct);

// NEW: Toggle stock on/off (shopkeeper only)
router.put('/:id/toggle-stock', auth, authorizeRole('shopkeeper'), toggleStock);

module.exports = router;
