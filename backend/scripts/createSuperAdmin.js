// backend/scripts/createSuperAdmin.js
//
// Standalone bootstrap script — NOT an HTTP endpoint. There is no way to create or promote
// a superadmin account over the network; this must be run manually on the server console.
//
// Usage:
//   SUPERADMIN_USERNAME=admin SUPERADMIN_PASSWORD=at-least-8-chars node scripts/createSuperAdmin.js
//   (optionally SUPERADMIN_EMAIL=admin@example.com)
//
// If the username already belongs to an existing customer/shopkeeper account, re-run with
// SUPERADMIN_ALLOW_PROMOTE=true to promote that account in place instead of erroring out.

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../db');
const User = require('../models/User');

async function main() {
  const username = process.env.SUPERADMIN_USERNAME;
  const password = process.env.SUPERADMIN_PASSWORD;
  const email = process.env.SUPERADMIN_EMAIL;
  const allowPromote = process.env.SUPERADMIN_ALLOW_PROMOTE === 'true';

  if (!username || !password) {
    console.error('SUPERADMIN_USERNAME and SUPERADMIN_PASSWORD env vars are required.');
    process.exitCode = 1;
    return;
  }
  if (password.length < 8) {
    console.error('SUPERADMIN_PASSWORD must be at least 8 characters.');
    process.exitCode = 1;
    return;
  }

  await connectDB();

  try {
    let user = await User.findOne({ username });

    if (user) {
      if (user.role === 'superadmin') {
        console.log(`User '${username}' is already a superadmin. Nothing to do.`);
        return;
      }
      if (!allowPromote) {
        console.error(
          `A user named '${username}' already exists with role '${user.role}'. ` +
          `Re-run with SUPERADMIN_ALLOW_PROMOTE=true to promote this existing account to superadmin.`
        );
        process.exitCode = 1;
        return;
      }
      user.role = 'superadmin';
      user.isActive = true;
      await user.save();
      console.log(`Promoted existing user '${username}' to superadmin.`);
      return;
    }

    user = new User({
      username,
      password, // hashed by the model's pre('save') hook
      role: 'superadmin',
      name: 'Super Admin',
      isActive: true,
      ...(email ? { email } : {}),
    });
    await user.save();
    console.log(`Superadmin '${username}' created successfully.`);
  } catch (err) {
    console.error('Failed to create/promote superadmin:', err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
}

main();
