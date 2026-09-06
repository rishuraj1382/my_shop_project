// backend/routes/users.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const authorizeRole = require('../middleware/roleMiddleware');
const { upload } = require('../middleware/uploadMiddleware');
const {
  updateShopDetails,
  getShopDetails,
  toggleShopStatus,
  uploadShopImage,
  deleteShopImage,
} = require('../controllers/userController');

// Translates multer's fileFilter/limits errors into a clean 400 instead of an
// uncaught exception or Express's default HTML error page.
function handleShopImageUpload(req, res, next) {
  upload.single('image')(req, res, (err) => {
    if (!err) return next();
    if (err.message === 'INVALID_FILE_TYPE') {
      return res.status(400).json({ message: 'Please select a valid image (JPEG, PNG, or WEBP).' });
    }
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'Image must be smaller than 5MB.' });
    }
    console.error('[users route] upload middleware error:', err.message);
    return res.status(400).json({ message: 'Could not process the uploaded file.' });
  });
}

// @route   GET /api/users/shop
// @desc    Get shop details for logged-in user
router.get('/shop', auth, getShopDetails);

// @route   PUT /api/users/shop
// @desc    Update shop details for logged-in user
router.put('/shop', auth, updateShopDetails);

// @route   PUT /api/users/shop/toggle-status
// @desc    Toggle open/closed status for the logged-in shopkeeper's shop
router.put('/shop/toggle-status', auth, authorizeRole('shopkeeper'), toggleShopStatus);

// @route   POST /api/users/shop/image
// @desc    Upload/replace the shop image for the logged-in shopkeeper
router.post('/shop/image', auth, authorizeRole('shopkeeper'), handleShopImageUpload, uploadShopImage);

// @route   DELETE /api/users/shop/image
// @desc    Remove the shop image for the logged-in shopkeeper
router.delete('/shop/image', auth, authorizeRole('shopkeeper'), deleteShopImage);

module.exports = router;
