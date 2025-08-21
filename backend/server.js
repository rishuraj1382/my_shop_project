// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
const http = require('http'); // 1. Import http
const { Server } = require("socket.io"); // 2. Import Server from socket.io

const app = express();
const server = http.createServer(app); // 3. Create an HTTP server from the Express app

// 4. Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Allow your frontend to connect
    methods: ["GET", "POST"]
  }
});

// Connect to the database
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());

// 5. Make the 'io' instance available to all routes
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

// 6. Set up a basic connection listener for Socket.IO
io.on('connection', (socket) => {
  console.log('A user connected with socket ID:', socket.id);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;

// 7. Start the server using the http instance, not the app instance
server.listen(PORT, () => console.log(`Server started on port ${PORT}`));
