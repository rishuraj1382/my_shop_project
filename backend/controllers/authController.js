// backend/controllers/authController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  const { username, password, role, name, shopName, city, pincode, fullAddress, mobileNumber } = req.body;
  
  try {
    // Check if username already exists
    let user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // If shopkeeper, validate required shopkeeper fields
    if (role === 'shopkeeper') {
      if (!shopName || !city || !pincode || !fullAddress || !mobileNumber) {
        return res.status(400).json({ message: 'All shop details are required for shopkeeper registration' });
      }
      // Check if shop name already exists
      let shop = await User.findOne({ shopName });
      if (shop) {
        return res.status(400).json({ message: 'Shop name already exists' });
      }
    }

    // If customer, validate required customer fields
    if (role === 'customer') {
      if (!name || !mobileNumber) {
        return res.status(400).json({ message: 'Name and mobile number are required for customer registration' });
      }
    }

    // Build user object based on role
    const userData = { username, password, role: role || 'shopkeeper', mobileNumber };
    
    if (role === 'customer') {
      userData.name = name;
    } else {
      userData.shopName = shopName;
      userData.city = city;
      userData.pincode = pincode;
      userData.fullAddress = fullAddress;
      userData.name = name || shopName; // Use shopName as display name if name not provided
    }

    user = new User(userData);
    await user.save();

    // Include role in JWT payload
    const payload = { user: { id: user.id, role: user.role } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
      if (err) throw err;
      const displayName = user.name || user.shopName || user.username;
      res.json({ token, role: user.role, name: displayName });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    let user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    // Include role in JWT payload
    const payload = { user: { id: user.id, role: user.role } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
      if (err) throw err;
      const displayName = user.name || user.shopName || user.username;
      res.json({ token, role: user.role, name: displayName });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// NEW: Get current user info
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
