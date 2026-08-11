// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

const corsOptions = {
  origin: ['http://localhost:3000', 'https://my-shop-project-frontend.onrender.com'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true
};

// Initialize Socket.IO
const io = new Server(server, {
  cors: corsOptions
});

// Connect to the database
connectDB();

// Middlewares
app.use(cors(corsOptions));
app.use(express.json());

// Make the 'io' instance available to all routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Define Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/shops', require('./routes/shops'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/users', require('./routes/users'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/search', require('./routes/search'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/customer', require('./routes/customer'));
app.use('/api/admin', require('./routes/admin'));

// Socket.IO connection management
io.on('connection', (socket) => {
  console.log('A user connected with socket ID:', socket.id);

  // Allow shopkeepers to join their own room for new order notifications
  socket.on('joinShopRoom', (shopId) => {
    socket.join(`shop:${shopId}`);
    console.log(`Socket ${socket.id} joined shop room: shop:${shopId}`);
  });

  // Allow customers to join their own room for status notifications
  socket.on('joinCustomerRoom', (customerId) => {
    socket.join(`customer:${customerId}`);
    console.log(`Socket ${socket.id} joined customer room: customer:${customerId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server started on port ${PORT}`));
