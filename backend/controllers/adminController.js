// backend/controllers/adminController.js
const mongoose = require('mongoose');
const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const {
  ORDER_PRIORITY_ADD_FIELDS_STAGE,
  ORDER_PRIORITY_SORT_STAGE,
  ORDER_PRIORITY_UNSET_STAGE,
} = require('../utils/orderPriority');

// ---- Shared helpers ----

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function parsePagination(query) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

function parseSort(sort) {
  if (!sort) return { createdAt: -1 };
  const field = sort.replace(/^-/, '');
  const dir = sort.startsWith('-') ? -1 : 1;
  return { [field]: dir };
}

const CREATED_AT_FALLBACK = { $ifNull: ['$createdAt', { $toDate: '$_id' }] };

// ---- Overview ----

exports.getOverview = async (req, res) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      totalCustomers,
      totalShopkeepers,
      openShops,
      closedShops,
      totalProducts,
      totalOrders,
      ordersToday,
      completedOrders,
      cancelledOrders,
      salesAgg,
      newUsersTodayAgg,
    ] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({ role: 'shopkeeper' }),
      User.countDocuments({ role: 'shopkeeper', isOpen: true }),
      User.countDocuments({ role: 'shopkeeper', isOpen: false }),
      Product.countDocuments({}),
      Order.countDocuments({}),
      Order.countDocuments({ createdAt: { $gte: startOfToday } }),
      Order.countDocuments({ status: 'Delivered' }),
      Order.countDocuments({ status: 'Cancelled' }),
      Order.aggregate([
        { $match: { status: { $ne: 'Cancelled' } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      User.aggregate([
        { $addFields: { effectiveCreatedAt: CREATED_AT_FALLBACK } },
        { $match: { effectiveCreatedAt: { $gte: startOfToday } } },
        { $count: 'count' },
      ]),
    ]);

    res.json({
      totalUsers,
      totalCustomers,
      totalShopkeepers,
      // Every shopkeeper record IS a shop — no separate Shop model exists in this app.
      totalShops: totalShopkeepers,
      openShops,
      closedShops,
      totalProducts,
      totalOrders,
      ordersToday,
      completedOrders, // mapped to status: 'Delivered' — closest real equivalent in the current enum
      cancelledOrders,
      totalPlatformSales: salesAgg[0]?.total || 0, // sum across all non-cancelled orders (platform activity, not settled revenue)
      newUsersToday: newUsersTodayAgg[0]?.count || 0,
    });
  } catch (err) {
    console.error('[adminController] getOverview failed:', err.message);
    res.status(500).send('Server Error');
  }
};

// ---- Users ----

exports.getUsers = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.search) {
      const rx = new RegExp(escapeRegex(req.query.search), 'i');
      filter.$or = [{ username: rx }, { name: rx }, { email: rx }];
    }
    const sortObj = parseSort(req.query.sort);

    const [users, total] = await Promise.all([
      User.find(filter).select('-password').sort(sortObj).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);

    res.json({ users, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('[adminController] getUsers failed:', err.message);
    res.status(500).send('Server Error');
  }
};

exports.updateUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ message: 'isActive must be a boolean' });
    }
    if (req.params.id === req.user.id.toString()) {
      return res.status(400).json({ message: 'You cannot change your own account status' });
    }

    const user = await User.findByIdAndUpdate(req.params.id, { isActive }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (err) {
    console.error('[adminController] updateUserStatus failed:', err.message);
    res.status(500).send('Server Error');
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const ALLOWED_TARGET_ROLES = ['customer', 'shopkeeper'];

    if (!ALLOWED_TARGET_ROLES.includes(role)) {
      // Explicitly rejects 'superadmin' too, even from a superadmin requester — defense in
      // depth. Superadmin creation stays exclusive to the CLI bootstrap script.
      return res.status(400).json({ message: `role must be one of: ${ALLOWED_TARGET_ROLES.join(', ')}` });
    }
    if (req.params.id === req.user.id.toString()) {
      return res.status(400).json({ message: 'You cannot change your own role' });
    }

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (err) {
    console.error('[adminController] updateUserRole failed:', err.message);
    res.status(500).send('Server Error');
  }
};

// ---- Shops ----

exports.getShops = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const filter = { role: 'shopkeeper' };
    if (req.query.search) {
      const rx = new RegExp(escapeRegex(req.query.search), 'i');
      filter.$or = [{ shopName: rx }, { username: rx }, { city: rx }];
    }
    const sortObj = parseSort(req.query.sort);

    const [shops, total] = await Promise.all([
      User.find(filter).select('-password').sort(sortObj).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);

    const shopIds = shops.map((s) => s._id);
    const orderCounts = await Order.aggregate([
      { $match: { shop: { $in: shopIds } } },
      { $group: { _id: '$shop', orderCount: { $sum: 1 } } },
    ]);
    const orderCountMap = new Map(orderCounts.map((o) => [o._id.toString(), o.orderCount]));

    const shopsWithCounts = shops.map((s) => ({
      ...s.toObject(),
      orderCount: orderCountMap.get(s._id.toString()) || 0,
    }));

    res.json({ shops: shopsWithCounts, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('[adminController] getShops failed:', err.message);
    res.status(500).send('Server Error');
  }
};

// ---- Orders ----

exports.getOrders = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const filter = {};

    if (req.query.status) filter.status = req.query.status;

    if (req.query.search) {
      if (mongoose.Types.ObjectId.isValid(req.query.search)) {
        filter._id = new mongoose.Types.ObjectId(req.query.search);
      } else {
        filter.customerName = new RegExp(escapeRegex(req.query.search), 'i');
      }
    }

    if (req.query.startDate || req.query.endDate) {
      filter.createdAt = {};
      if (req.query.startDate) filter.createdAt.$gte = new Date(req.query.startDate);
      if (req.query.endDate) filter.createdAt.$lte = new Date(req.query.endDate);
    }

    // Default view (no explicit sort requested): current/actionable orders first, then
    // Delivered, then Cancelled, newest-first within each group — applied BEFORE
    // pagination so active orders on later pages are never hidden behind old ones.
    // An explicit ?sort= request (e.g. a column-header click) is respected as-is.
    const pipeline = [{ $match: filter }];
    if (req.query.sort) {
      pipeline.push({ $sort: parseSort(req.query.sort) });
    } else {
      pipeline.push(ORDER_PRIORITY_ADD_FIELDS_STAGE, ORDER_PRIORITY_SORT_STAGE, ORDER_PRIORITY_UNSET_STAGE);
    }
    pipeline.push({ $skip: skip }, { $limit: limit });

    const [orders, total] = await Promise.all([
      Order.aggregate(pipeline),
      Order.countDocuments(filter),
    ]);

    res.json({ orders, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('[adminController] getOrders failed:', err.message);
    res.status(500).send('Server Error');
  }
};

// ---- Analytics ----

exports.getAnalytics = async (req, res) => {
  try {
    const rangeMap = { '7d': 7, '30d': 30, '90d': 90 };
    const daysBack = rangeMap[req.query.range] || 7;
    const range = rangeMap[req.query.range] ? req.query.range : '7d';
    const since = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);

    const [
      ordersOverTime,
      newUsersOverTime,
      revenueOverTime,
      ordersByStatus,
      topShopsRaw,
      topProducts,
    ] = await Promise.all([
      Order.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      User.aggregate([
        { $addFields: { effectiveCreatedAt: CREATED_AT_FALLBACK } },
        { $match: { effectiveCreatedAt: { $gte: since } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$effectiveCreatedAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: since }, status: { $ne: 'Cancelled' } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$totalAmount' } } },
        { $sort: { _id: 1 } },
      ]),
      Order.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: since }, status: { $ne: 'Cancelled' } } },
        { $group: { _id: '$shop', totalSales: { $sum: '$totalAmount' }, orderCount: { $sum: 1 } } },
        { $sort: { totalSales: -1 } },
        { $limit: 10 },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'shopInfo' } },
        { $unwind: '$shopInfo' },
        { $project: { shopName: '$shopInfo.shopName', totalSales: 1, orderCount: 1 } },
      ]),
      // NOTE: Order.items has no productId, only a denormalized `name` string — this groups by
      // that name, which can merge same-named products across different shops or fragment
      // near-duplicate names. Real limitation of the current schema, not an aggregation bug.
      Order.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $unwind: '$items' },
        { $group: { _id: '$items.name', totalQuantity: { $sum: '$items.quantity' }, orderCount: { $sum: 1 } } },
        { $sort: { totalQuantity: -1 } },
        { $limit: 10 },
      ]),
    ]);

    res.json({
      range,
      ordersOverTime,
      newUsersOverTime,
      revenueOverTime,
      ordersByStatus,
      topShops: topShopsRaw,
      topProducts,
    });
  } catch (err) {
    console.error('[adminController] getAnalytics failed:', err.message);
    res.status(500).send('Server Error');
  }
};
