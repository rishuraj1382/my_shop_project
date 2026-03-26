// backend/controllers/orderController.js
const Order = require('../models/Order');

// Gets orders only for the logged-in shopkeeper
const getShopkeeperOrders = async (req, res) => {
  try {
    const orders = await Order.find({ shop: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// This function is for customers, so it remains public
const createOrder = async (req, res) => {
  const { customerName, customerContact, customerAddress, items, shopId, customerId } = req.body;
  if (!shopId) {
    return res.status(400).json({ message: 'shopId is required' });
  }
  const orderData = {
    customerName, customerContact, customerAddress, items, shop: shopId,
  };
  // Link order to logged-in customer if customerId is provided
  if (customerId) {
    orderData.customer = customerId;
  }
  const newOrder = new Order(orderData);
  try {
    const order = await newOrder.save();
    res.json(order);
  } catch (err) {
    console.error('Error saving order:', err.message);
    res.status(500).send('Server Error');
  }
};

// Update order status (shopkeeper only) with socket event
const updateOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order || order.shop.toString() !== req.user.id) {
            return res.status(404).json({ msg: 'Order not found or not authorized' });
        }
        order.status = req.body.status;
        await order.save();

        // WebSocket live update
        const io = req.io;
        io.emit(`orderUpdate:${order._id}`, { status: order.status });
        // Emit a general event for this shop so tracking pages can re-fetch their queue position
        io.emit(`shopQueueUpdate:${order.shop.toString()}`);

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
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    let queuePosition = 0;
    if (['Pending', 'Confirmed', 'Packed'].includes(order.status)) {
      const olderActiveOrdersCount = await Order.countDocuments({
        shop: order.shop,
        status: { $in: ['Pending', 'Confirmed', 'Packed'] },
        createdAt: { $lt: order.createdAt }
      });
      queuePosition = olderActiveOrdersCount + 1;
    }

    res.json({
      status: order.status,
      items: order.items,
      customerName: order.customerName,
      queuePosition,
      shopId: order.shop
    });
  } catch (err) {
    if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Order not found' });
    }
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// NEW: Get orders for the logged-in customer
const getCustomerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user.id })
      .sort({ createdAt: -1 })
      .populate('shop', 'shopName');
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
};
