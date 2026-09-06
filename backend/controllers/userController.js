// backend/controllers/userController.js
const sharp = require('sharp');
const { PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const User = require('../models/User');
const { s3Client, BUCKET_NAME } = require('../s3');

// Versioned key pair per shop+upload (namespaced by the shopkeeper's own user id,
// never a client-supplied value). A FIXED key that's overwritten on every replace
// was tried first and rejected: CloudFront caches by path, and overwriting the
// same S3 key doesn't bust that cache (no automatic invalidation without either
// an explicit CreateInvalidation call — a new IAM permission + ~60s global
// propagation delay — or this: a version segment, so a replace is simply a new
// path CloudFront has never cached, live everywhere instantly, no invalidation
// API needed). The previous version's objects are explicitly deleted once the
// new version is confirmed live — see the cleanup calls in each function below.
const shopImageKeys = (userId, version) => ({
  full: `shops/${userId}/${version}/full.jpg`,
  thumb: `shops/${userId}/${version}/thumb.jpg`,
});

const cloudFrontUrl = (key) => `https://${process.env.AWS_CLOUDFRONT_DOMAIN}/${key}`;

// Recovers the version segment from a shopImage URL this app generated itself
// (https://<domain>/shops/<userId>/<version>/full.jpg), so a replace/delete can
// clean up the previous version's objects. Returns null for anything that isn't
// our own shape — empty string, or a pre-migration Cloudinary URL — nothing to
// clean up on S3 for an image that was never stored there.
function extractStoredVersion(shopImageUrl, userId) {
  if (!shopImageUrl) return null;
  const match = shopImageUrl.match(new RegExp(`/shops/${userId}/([^/]+)/full\\.jpg$`));
  return match ? match[1] : null;
}

function deleteVersionObjects(userId, version) {
  const keys = shopImageKeys(userId, version);
  return Promise.all([
    s3Client.send(new DeleteObjectCommand({ Bucket: BUCKET_NAME, Key: keys.full })),
    s3Client.send(new DeleteObjectCommand({ Bucket: BUCKET_NAME, Key: keys.thumb })),
  ]);
}

// NEW: Get shop details for the logged-in user
exports.getShopDetails = async (req, res) => {
  try {
    // Find user by ID from the token, but don't select the password
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};


// UPDATED: Update all shop details for the logged-in user
exports.updateShopDetails = async (req, res) => {
  try {
    const { shopName, fullAddress, city, pincode, mobileNumber, shopImage, location } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Update fields if they are provided in the request
    if (shopName) user.shopName = shopName;
    if (fullAddress) user.fullAddress = fullAddress;
    if (city) user.city = city;
    if (pincode) user.pincode = pincode;
    if (mobileNumber) user.mobileNumber = mobileNumber;
    if (shopImage) user.shopImage = shopImage;
    if (location && typeof location.latitude === 'number' && typeof location.longitude === 'number') {
      user.location = {
        address: typeof location.address === 'string' ? location.address : '',
        latitude: location.latitude,
        longitude: location.longitude,
      };
    }

    await user.save();
    res.json({ msg: 'Shop details updated successfully', user });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Upload/replace the shop image for the logged-in shopkeeper. Scoped entirely by
// req.user.id (from the verified JWT) — there is no client-suppliable shop id
// anywhere in this flow, so one shopkeeper can never target another shop's image.
//
// Two variants are generated server-side with sharp (S3 has no on-the-fly
// transform-by-URL like the previous Cloudinary setup did) and uploaded to a new
// version path. The previous version's objects (if any) are deleted afterward —
// best-effort, non-fatal — now that the new one is confirmed live.
exports.uploadShopImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please select an image to upload.' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const previousVersion = extractStoredVersion(user.shopImage, req.user.id);
    const version = Date.now().toString();
    const keys = shopImageKeys(req.user.id, version);

    const [fullBuffer, thumbBuffer] = await Promise.all([
      sharp(req.file.buffer).rotate().resize(1200, 1200, { fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 82 }).toBuffer(),
      sharp(req.file.buffer).rotate().resize(400, 400, { fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 80 }).toBuffer(),
    ]);

    await Promise.all([
      s3Client.send(new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: keys.full,
        Body: fullBuffer,
        ContentType: 'image/jpeg',
      })),
      s3Client.send(new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: keys.thumb,
        Body: thumbBuffer,
        ContentType: 'image/jpeg',
      })),
    ]);

    user.shopImage = cloudFrontUrl(keys.full);
    await user.save();

    if (previousVersion) {
      deleteVersionObjects(req.user.id, previousVersion).catch((err) => {
        console.error('[userController] previous-version S3 cleanup failed:', err.message);
      });
    }

    res.json({ message: 'Shop image updated successfully.', shopImage: user.shopImage });
  } catch (err) {
    console.error('[userController] uploadShopImage failed:', err.message);
    res.status(500).json({ message: 'Failed to upload shop image. Please try again.' });
  }
};

// Remove the shop image for the logged-in shopkeeper — deletes the current
// version's S3 objects and resets the field so every display location falls
// back to the professional icon/initials placeholder immediately.
exports.deleteShopImage = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const version = extractStoredVersion(user.shopImage, req.user.id);
    if (version) {
      try {
        await deleteVersionObjects(req.user.id, version);
      } catch (destroyErr) {
        // Non-fatal: the DB reference is the source of truth for what customers see —
        // still clear it below even if the storage-side cleanup hiccups.
        console.error('[userController] S3 object deletion failed:', destroyErr.message);
      }
    }

    user.shopImage = '';
    await user.save();

    res.json({ message: 'Shop image removed.', shopImage: user.shopImage });
  } catch (err) {
    console.error('[userController] deleteShopImage failed:', err.message);
    res.status(500).json({ message: 'Failed to remove shop image. Please try again.' });
  }
};

// Toggle shop open/closed status for the logged-in shopkeeper
exports.toggleShopStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    user.isOpen = !user.isOpen;
    await user.save();
    res.json({ msg: `Shop is now ${user.isOpen ? 'open' : 'closed'}`, isOpen: user.isOpen });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
