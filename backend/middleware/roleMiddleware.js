// backend/middleware/roleMiddleware.js
// Usage: router.post('/', auth, authorizeRole('shopkeeper'), handler)

const authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ msg: 'Access denied. Insufficient permissions.' });
    }
    next();
  };
};

module.exports = authorizeRole;
