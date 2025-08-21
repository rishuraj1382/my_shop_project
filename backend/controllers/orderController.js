// backend/controllers/orderController.js
const Order = require('../models/Order');

// Gets orders only for the logged-in shopkeeper
const getShopkeeperOrders = async (req, res) => {
  try {
    // req.user.id comes from the auth middleware
    const orders = await Order.find({ shop: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// This function is for customers, so it remains public
const createOrder = async (req, res) => {
  const { customerName, customerContact, customerAddress, items, shopId } = req.body;
  if (!shopId) {
    return res.status(400).json({ message: 'shopId is required' });
  }
  const newOrder = new Order({
    customerName, customerContact, customerAddress, items, shop: shopId,
  });
  try {
    const order = await newOrder.save();
    res.json(order);
  } catch (err) {
    console.error('Error saving order:', err.message);
    res.status(500).send('Server Error');
  }
};

// This function needs to check ownership
// ... (keep all other functions the same)

// This function needs to check ownership AND emit a socket event
const updateOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order || order.shop.toString() !== req.user.id) {
            return res.status(404).json({ msg: 'Order not found or not authorized' });
        }
        order.status = req.body.status;
        await order.save();

        // --- NEW WEBSOCKET LOGIC ---
        // Get the io instance from the request object
        const io = req.io;
        // Emit an event specifically for this order's ID
        // The frontend will listen for this event to get live updates
        io.emit(`orderUpdate:${order._id}`, { status: order.status });
        // --- END OF NEW LOGIC ---

        res.json(order);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

// ... (make sure your module.exports includes updateOrder)


// This function needs to check ownership
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

// NEW PUBLIC FUNCTION: Gets a single order by its ID for tracking
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }
    // We only send back non-sensitive information
    res.json({
      status: order.status,
      items: order.items,
      customerName: order.customerName
    });
  } catch (err) {
    // This handles cases where the provided ID is not in a valid format
    if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Order not found' });
    }
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

module.exports = {
  getShopkeeperOrders,
  createOrder,
  updateOrder,
  deleteOrder,
  getOrderById,
};


