// backend/controllers/authController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function generateUsernameFromEmail(email) {
  const base = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '') || 'user';
  let candidate = base;
  let suffix = 0;
  while (await User.findOne({ username: candidate })) {
    suffix += 1;
    candidate = `${base}${suffix}`;
  }
  return candidate;
}

exports.register = async (req, res) => {
  const { username, email, password, role, name, shopName, city, pincode, fullAddress, mobileNumber, location } = req.body;

  // SECURITY: role is client-supplied on a public endpoint. Never trust it directly —
  // only 'customer' and 'shopkeeper' are self-registerable. Anything else (including
  // 'superadmin' or garbage values) silently normalizes to the safe default.
  const normalizedRole = role === 'customer' ? 'customer' : 'shopkeeper';

  try {
    // Check if username already exists
    let user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Check if email already exists (if provided)
    if (email) {
      let emailUser = await User.findOne({ email });
      if (emailUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    // If shopkeeper, validate required shopkeeper fields
    if (normalizedRole === 'shopkeeper') {
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
    if (normalizedRole === 'customer') {
      if (!name || !mobileNumber) {
        return res.status(400).json({ message: 'Name and mobile number are required for customer registration' });
      }
    }

    // Build user object based on role
    const userData = { username, password, role: normalizedRole, mobileNumber };
    if (email) userData.email = email;

    if (normalizedRole === 'customer') {
      userData.name = name;
    } else {
      userData.shopName = shopName;
      userData.city = city;
      userData.pincode = pincode;
      userData.fullAddress = fullAddress;
      userData.name = name || shopName;
      if (location && typeof location.latitude === 'number' && typeof location.longitude === 'number') {
        userData.location = {
          address: typeof location.address === 'string' ? location.address : '',
          latitude: location.latitude,
          longitude: location.longitude,
        };
      }
    }

    user = new User(userData);
    await user.save();

    // Include role in JWT payload
    const payload = { user: { id: user.id, role: user.role } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
      if (err) throw err;
      const displayName = user.name || user.shopName || user.username;
      res.json({ token, role: user.role, name: displayName, userId: user.id });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    // Support login via username OR email
    let user = await User.findOne({
      $or: [
        { username: username },
        { email: username }, // treat the "username" field as potentially being an email
      ],
    });
    if (!user) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    if (user.isActive === false) {
      return res.status(403).json({ message: 'This account has been deactivated. Please contact support.' });
    }

    if (!user.password) {
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
      res.json({ token, role: user.role, name: displayName, userId: user.id });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// GET /api/auth/me — Get current user info
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password').populate('favorites', 'shopName city fullAddress mobileNumber shopImage averageRating totalReviews pincode');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// PATCH /api/auth/profile — Update customer profile
exports.updateProfile = async (req, res) => {
  const { name, email, mobileNumber, savedAddresses } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    // Check email uniqueness if changing
    if (email && email !== user.email) {
      const existing = await User.findOne({ email });
      if (existing) return res.status(400).json({ message: 'Email already in use by another account' });
      user.email = email;
    }

    if (name) user.name = name;
    if (mobileNumber) user.mobileNumber = mobileNumber;
    if (savedAddresses !== undefined) user.savedAddresses = savedAddresses;

    await user.save();
    const updated = user.toObject();
    delete updated.password;
    res.json(updated);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// POST /api/auth/google — Sign in / sign up with Google (customer-only)
exports.googleAuth = async (req, res) => {
  const { credential } = req.body;
  if (!credential) {
    return res.status(400).json({ message: 'Missing Google credential' });
  }

  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch (err) {
    console.error('Google token verification failed:', err.message);
    return res.status(400).json({ message: 'Invalid Google credential' });
  }

  const { sub: googleId, email, name, picture } = payload;
  if (!email) {
    return res.status(400).json({ message: 'Google account has no email' });
  }

  try {
    // (a) already linked — returning Google user
    let user = await User.findOne({ googleId });

    // (b) not linked by googleId yet — fall back to email match (account-linking)
    if (!user) {
      user = await User.findOne({ email });
      if (user) {
        user.googleId = googleId;
        if (!user.profilePicture && picture) user.profilePicture = picture;
        await user.save();
      }
    }

    if (user && user.isActive === false) {
      return res.status(403).json({ message: 'This account has been deactivated. Please contact support.' });
    }

    // (c) no match at all — create a brand-new customer account
    if (!user) {
      const username = await generateUsernameFromEmail(email);
      user = new User({
        username,
        email,
        googleId,
        authProvider: 'google',
        role: 'customer',
        name: name || username,
        profilePicture: picture,
      });
      await user.save();
    }

    const jwtPayload = { user: { id: user.id, role: user.role } };
    jwt.sign(jwtPayload, process.env.JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
      if (err) throw err;
      const displayName = user.name || user.shopName || user.username;
      res.json({ token, role: user.role, name: displayName, userId: user.id });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
