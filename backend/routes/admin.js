// backend/routes/admin.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const authorizeRole = require('../middleware/roleMiddleware');
const admin = require('../controllers/adminController');

// Every route below requires a valid JWT AND role === 'superadmin'.
router.use(auth, authorizeRole('superadmin'));

router.get('/overview', admin.getOverview);
router.get('/users', admin.getUsers);
router.patch('/users/:id/status', admin.updateUserStatus);
router.patch('/users/:id/role', admin.updateUserRole);
router.get('/shops', admin.getShops);
router.get('/orders', admin.getOrders);
router.get('/analytics', admin.getAnalytics);

module.exports = router;
