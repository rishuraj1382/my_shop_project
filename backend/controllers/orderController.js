// backend/controllers/orderController.js
const mongoose = require('mongoose');
const Order = require('../models/Order');
const User = require('../models/User');
const emailService = require('../services/emailService');
const {
  ORDER_PRIORITY_ADD_FIELDS_STAGE,
  ORDER_PRIORITY_SORT_STAGE,
  ORDER_PRIORITY_UNSET_STAGE,
} = require('../utils/orderPriority');

// Gets orders only for the logged-in shopkeeper — current/actionable orders first,
// then Delivered, then Cancelled; newest-first within each group.
const getShopkeeperOrders = async (req, res) => {
  try {
    const orders = await Order.aggregate([
      { $match: { shop: new mongoose.Types.ObjectId(req.user.id) } },
      ORDER_PRIORITY_ADD_FIELDS_STAGE,
      ORDER_PRIORITY_SORT_STAGE,
      ORDER_PRIORITY_UNSET_STAGE,
    ]);
    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// This function is for customers, so it remains public
const createOrder = async (req, res) => {
  const { customerName, customerContact, customerAddress, items, shopId, customerId, totalAmount, paymentMethod, paymentStatus, fulfillmentType } = req.body;
  if (!shopId) {
    return res.status(400).json({ message: 'shopId is required' });
  }

  // Fetch shop name for denormalization, and check it's accepting orders
  let shopName = '';
  try {
    const shop = await User.findById(shopId).select('shopName isOpen');
    if (shop) {
      shopName = shop.shopName;
      if (shop.isOpen === false) {
        return res.status(403).json({ message: 'This shop is currently closed. You can browse products, but ordering is temporarily unavailable.' });
      }
    }
  } catch (e) { /* ignore */ }

  const orderData = {
    customerName, customerContact, customerAddress, items, shop: shopId, shopName,
    totalAmount: totalAmount || 0,
    paymentMethod: paymentMethod || 'COD',
    fulfillmentType,
  };
  if (customerId) {
    orderData.customer = customerId;
  }
  if (paymentStatus) orderData.paymentStatus = paymentStatus;

  const newOrder = new Order(orderData);
  try {
    const order = await newOrder.save();
    emailService.notifyNewOrder(order);
    res.json(order);
  } catch (err) {
    console.error('Error saving order:', err.message);
    res.status(500).send('Server Error');
  }
};

// Update order status (shopkeeper only) with socket event
const VALID_STATUSES = ['Pending', 'Confirmed', 'Packed', 'Ready to Deliver', 'Out For Delivery', 'Ready for Pickup', 'Delivered', 'Cancelled'];
const CUSTOMER_CANCELLABLE_STATUSES = ['Pending', 'Confirmed'];

// Shared side effects for any status change: socket notifications + email (fire-and-forget).
async function applyOrderStatusChange(order, newStatus, io) {
  order.status = newStatus;
  await order.save();

  // WebSocket live update to customer tracking page
  io.emit(`orderUpdate:${order._id}`, { status: order.status });
  // Shop-wide queue update
  io.emit(`shopQueueUpdate:${order.shop.toString()}`);
  // Notification to customer if they're connected
  if (order.customer) {
    io.emit(`customerNotification:${order.customer.toString()}`, {
      type: 'orderUpdate',
      orderId: order._id,
      status: newStatus,
      shopName: order.shopName || 'your shop',
      message: `Your order is now: ${newStatus}`,
    });
  }
  // New order notification to shopkeeper room
  io.emit(`shopNotification:${order.shop.toString()}`, {
    type: 'statusChanged',
    orderId: order._id,
  });

  emailService.notifyOrderStatusChange(order, newStatus);
}

const updateOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order || order.shop.toString() !== req.user.id) {
      return res.status(404).json({ msg: 'Order not found or not authorized' });
    }

    const newStatus = req.body.status;
    if (!VALID_STATUSES.includes(newStatus)) {
      return res.status(400).json({ msg: 'Invalid status' });
    }

    if (order.status === 'Cancelled') {
      return res.status(400).json({ msg: 'This order has already been cancelled.' });
    }
    if (newStatus === 'Cancelled' && order.status === 'Delivered') {
      return res.status(400).json({ msg: 'Cannot cancel a delivered order.' });
    }

    await applyOrderStatusChange(order, newStatus, req.io);

    res.json(order);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

// Customer cancels their own order — only while still Pending/Confirmed, before the
// shop starts packing/shipping. Guest-checkout orders (no linked customer account)
// can't self-cancel here; the shopkeeper can still cancel via updateOrder.
const cancelOrderByCustomer = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order || order.customer?.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Order not found' });
    }
    if (!CUSTOMER_CANCELLABLE_STATUSES.includes(order.status)) {
      return res.status(400).json({ message: 'This order can no longer be cancelled.' });
    }

    await applyOrderStatusChange(order, 'Cancelled', req.io);

    res.json(order);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order || order.shop.toString() !== req.user.id) {
      return res.status(404).json({ msg: 'Order not found or not authorized' });
    }
    await order.deleteOne();
    res.json({ msg: 'Order removed' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

// PUBLIC: Gets a single order by its ID for tracking
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('shop', 'shopName');
    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    let queuePosition = 0;
    const activeStatuses = ['Pending', 'Confirmed', 'Packed'];
    if (activeStatuses.includes(order.status)) {
      const olderActiveOrdersCount = await Order.countDocuments({
        shop: order.shop,
        status: { $in: activeStatuses },
        createdAt: { $lt: order.createdAt }
      });
      queuePosition = olderActiveOrdersCount + 1;
    }

    res.json({
      status: order.status,
      fulfillmentType: order.fulfillmentType,
      items: order.items,
      customerName: order.customerName,
      totalAmount: order.totalAmount,
      paymentMethod: order.paymentMethod,
      queuePosition,
      shopId: order.shop._id,
      shopName: order.shop.shopName || order.shopName,
      createdAt: order.createdAt,
    });
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Order not found' });
    }
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Get orders for the logged-in customer with filtering — current/active orders
// first, then Delivered, then Cancelled; newest-first within each group.
const getCustomerOrders = async (req, res) => {
  try {
    const { filter, search } = req.query;
    let query = { customer: new mongoose.Types.ObjectId(req.user.id) };

    // Date range filter
    if (filter) {
      const now = new Date();
      let dateFrom;
      if (filter === '30d') {
        dateFrom = new Date(now.setDate(now.getDate() - 30));
      } else if (filter === '6m') {
        dateFrom = new Date(now.setMonth(now.getMonth() - 6));
      } else if (filter === '1y') {
        dateFrom = new Date(now.setFullYear(now.getFullYear() - 1));
      }
      if (dateFrom) {
        query.createdAt = { $gte: dateFrom };
      }
    }

    let orders = await Order.aggregate([
      { $match: query },
      {
        $lookup: {
          from: 'users',
          localField: 'shop',
          foreignField: '_id',
          as: 'shop',
          pipeline: [{ $project: { shopName: 1, city: 1 } }],
        },
      },
      { $unwind: { path: '$shop', preserveNullAndEmptyArrays: true } },
      ORDER_PRIORITY_ADD_FIELDS_STAGE,
      ORDER_PRIORITY_SORT_STAGE,
      ORDER_PRIORITY_UNSET_STAGE,
    ]);

    // Text search filter (client-side on populated data for simplicity)
    if (search && search.trim()) {
      const term = search.trim().toLowerCase();
      orders = orders.filter(order => {
        const shopMatch = (order.shop?.shopName || order.shopName || '').toLowerCase().includes(term);
        const itemMatch = order.items.some(item => item.name.toLowerCase().includes(term));
        return shopMatch || itemMatch;
      });
    }

    res.json(orders);
  } catch (err) {
    console.error('Error fetching customer orders:', err.message);
    res.status(500).send('Server Error');
  }
};

module.exports = {
  getShopkeeperOrders,
  createOrder,
  updateOrder,
  deleteOrder,
  getOrderById,
  getCustomerOrders,
  cancelOrderByCustomer,
};
