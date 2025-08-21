// backend/routes/products.js
const express = require('express');
const router = express.Router();
const {
  getShopkeeperProducts,
  getProductsByShop,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const auth = require('../middleware/authMiddleware');

// PRIVATE route for a logged-in shopkeeper to get their own products
router.get('/', auth, getShopkeeperProducts);

// PUBLIC route for customers to get products from a specific shop
router.get('/shop/:shopId', getProductsByShop);

// PRIVATE routes for admin actions
router.post('/', auth, createProduct);
router.put('/:id', auth, updateProduct);
router.delete('/:id', auth, deleteProduct);

module.exports = router;
