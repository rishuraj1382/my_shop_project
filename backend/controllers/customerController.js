// backend/controllers/customerController.js
const User = require('../models/User');
const Order = require('../models/Order');

// GET /api/customer/favorites
exports.getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('favorites', 'shopName city fullAddress mobileNumber shopImage averageRating totalReviews productCount pincode');
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.favorites || []);
  } catch (err) {
    console.error('[customerController ERROR]', err.message);
    res.status(500).send('Server error');
  }
};

// POST /api/customer/favorites/:shopId — Add favorite
exports.addFavorite = async (req, res) => {
  try {
    const { shopId } = req.params;
    const user = await User.findById(req.user.id);
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    const alreadyFav = user.favorites.some(fav => fav.toString() === shopId);
    if (alreadyFav) {
      return res.json({ message: 'Already in favorites', favorites: user.favorites });
    }

    user.favorites.push(shopId);
    await user.save();
    res.json({ message: 'Added to favorites', favorites: user.favorites });
  } catch (err) {
    console.error('[customerController ERROR]', err.message);
    res.status(500).send('Server error');
  }
};

// DELETE /api/customer/favorites/:shopId — Remove favorite
exports.removeFavorite = async (req, res) => {
  try {
    const { shopId } = req.params;
    const user = await User.findById(req.user.id);
    
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.favorites = user.favorites.filter(fav => fav.toString() !== shopId);
    await user.save();
    res.json({ message: 'Removed from favorites', favorites: user.favorites });
  } catch (err) {
    console.error('[customerController ERROR]', err.message);
    res.status(500).send('Server error');
  }
};

// GET /api/customer/recent-searches
exports.getRecentSearches = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('recentSearches');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.recentSearches || []);
  } catch (err) {
    res.status(500).send('Server error');
  }
};

// POST /api/customer/recent-searches — Save a search term
exports.saveRecentSearch = async (req, res) => {
  try {
    const { term } = req.body;
    if (!term || !term.trim()) {
      return res.status(400).json({ message: 'Search term required' });
    }
    
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Remove if already exists (to move to front), then prepend
    user.recentSearches = user.recentSearches.filter(s => s.toLowerCase() !== term.trim().toLowerCase());
    user.recentSearches.unshift(term.trim());
    // Keep only last 10
    user.recentSearches = user.recentSearches.slice(0, 10);
    
    await user.save();
    res.json(user.recentSearches);
  } catch (err) {
    res.status(500).send('Server error');
  }
};

// DELETE /api/customer/recent-searches — Clear all recent searches
exports.clearRecentSearches = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { recentSearches: [] });
    res.json({ message: 'Recent searches cleared' });
  } catch (err) {
    res.status(500).send('Server error');
  }
};

// GET /api/customer/dashboard — Aggregated stats for customer dashboard
exports.getDashboardData = async (req, res) => {
  try {
    const customerId = req.user.id;

    const allOrders = await Order.find({ customer: customerId })
      .populate('shop', 'shopName')
      .sort({ createdAt: -1 });

    const totalOrders = allOrders.length;
    const totalSpending = allOrders
      .filter(o => o.status !== 'Cancelled')
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    
    const activeStatuses = ['Pending', 'Confirmed', 'Packed', 'Ready to Deliver', 'Out For Delivery', 'Ready for Pickup'];
    const activeOrders = allOrders.filter(o => activeStatuses.includes(o.status));
    const recentOrders = allOrders.slice(0, 5);

    // Get favorites count
    const user = await User.findById(customerId).select('favorites name recentSearches');
    const savedShops = user?.favorites?.length || 0;

    res.json({
      user: { name: user?.name, savedShops },
      stats: { totalOrders, totalSpending: Math.round(totalSpending * 100) / 100, savedShops },
      activeOrders,
      recentOrders,
      recentSearches: user?.recentSearches || [],
    });
  } catch (err) {
    console.error('[customerController ERROR]', err.message);
    res.status(500).send('Server error');
  }
};
