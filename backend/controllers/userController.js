// backend/controllers/userController.js
const User = require('../models/User');

// NEW: Get shop details for the logged-in user
exports.getShopDetails = async (req, res) => {
  try {
    // Find user by ID from the token, but don't select the password
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};


// UPDATED: Update all shop details for the logged-in user
exports.updateShopDetails = async (req, res) => {
  try {
    const { shopName, fullAddress, city, pincode, mobileNumber, shopImage } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Update fields if they are provided in the request
    if (shopName) user.shopName = shopName;
    if (fullAddress) user.fullAddress = fullAddress;
    if (city) user.city = city;
    if (pincode) user.pincode = pincode;
    if (mobileNumber) user.mobileNumber = mobileNumber;
    if (shopImage) user.shopImage = shopImage;

    await user.save();
    res.json({ msg: 'Shop details updated successfully', user });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
