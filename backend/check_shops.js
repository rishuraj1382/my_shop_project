const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log('Connected to MongoDB');
  const shops = await User.find({});
  console.log(`Total users/shops in DB: ${shops.length}`);
  if (shops.length > 0) {
    console.log('Sample shop:', JSON.stringify(shops[0], null, 2));
    const shopsByPincode = await User.find({ pincode: '799046' });
    console.log(`Shops for 799046: ${shopsByPincode.length}`);
  }
  mongoose.connection.close();
}).catch(err => {
  console.error(err);
});
