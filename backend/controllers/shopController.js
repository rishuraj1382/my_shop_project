// backend/controllers/shopController.js
const User = require('../models/User');

exports.searchShopsByPincode = async (req, res) => {
  try {
    // Only return users who are shopkeepers
    const shops = await User.find({ 
      pincode: req.params.pincode, 
      role: 'shopkeeper' 
    }).select('shopName city fullAddress mobileNumber shopImage pincode');
    
    if (!shops || shops.length === 0) {
      return res.json([]);
    }
    
    res.json(shops);
  } catch (err) {
    console.error(`[DEBUG ERROR] `, err.message);
    res.status(500).send('Server error');
  }
};
