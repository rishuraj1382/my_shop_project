// // backend/controllers/shopController.js
// const User = require('../models/User');

// // @desc    Search for shops by pincode
// // @route   GET /api/shops/search/:pincode
// exports.searchShopsByPincode = async (req, res) => {
//   try {
//     const shops = await User.find({ pincode: req.params.pincode }).select('shopName city');
    
//     if (!shops || shops.length === 0) {
//       // It's better to return an empty array than a 404
//       // This way the frontend knows the search worked but found no results.
//       return res.json([]);
//     }
    
//     res.json(shops);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Server error');
//   }
// };



// backend/controllers/shopController.js
const User = require('../models/User');

exports.searchShopsByPincode = async (req, res) => {
  try {
    // Update the 'select' to include the new fields
    const shops = await User.find({ pincode: req.params.pincode }).select('shopName city fullAddress mobileNumber shopImage');
    
    if (!shops || shops.length === 0) {
      return res.json([]);
    }
    
    res.json(shops);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
