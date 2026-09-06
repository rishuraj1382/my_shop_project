// backend/controllers/shopController.js
const User = require('../models/User');

exports.searchShopsByPincode = async (req, res) => {
  try {
    const shops = await User.find({
      pincode: req.params.pincode,
      role: 'shopkeeper'
    }).select('shopName city fullAddress mobileNumber shopImage pincode averageRating totalReviews productCount isOpen location');
    
    if (!shops || shops.length === 0) {
      return res.json([]);
    }
    
    res.json(shops);
  } catch (err) {
    console.error(`[shopController ERROR] `, err.message);
    res.status(500).send('Server error');
  }
};

exports.getShopById = async (req, res) => {
  try {
    const shop = await User.findOne({ _id: req.params.id, role: 'shopkeeper' })
      .select('shopName city fullAddress mobileNumber shopImage pincode averageRating totalReviews productCount isOpen location');
    
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }
    res.json(shop);
  } catch (err) {
    console.error(`[shopController ERROR] `, err.message);
    res.status(500).send('Server error');
  }
};
