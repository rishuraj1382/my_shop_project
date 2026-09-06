// backend/middleware/uploadMiddleware.js
// Multer config for shop-image uploads: memory storage (buffer straight to
// Cloudinary, nothing touches local disk), server-side type/size validation —
// the frontend also validates, but that's a UX nicety, never a security boundary.
const multer = require('multer');

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return cb(new Error('INVALID_FILE_TYPE'));
    }
    cb(null, true);
  },
});

module.exports = { upload, ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES };
