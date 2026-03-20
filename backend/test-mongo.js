const mongoose = require('mongoose');
const uri = 'mongodb+srv://rishuraj1382:ShopPassword123@cluster0.f2ddoex.mongodb.net/test?appName=Cluster0';

async function testConnection() {
  try {
    await mongoose.connect(uri);
    
    const users = await mongoose.connection.db.collection('users').find({}).project({ username: 1, pincode: 1, pinCode: 1, _id: 0 }).toArray();
    console.log(`Found ${users.length} users in the test database.`);
    console.log(users);
    
    process.exit(0);
  } catch (err) {
    console.error('Connection error:', err);
    process.exit(1);
  }
}
testConnection();
