const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');

const MONGO_URI = 'mongodb://localhost:27017/rewear';
const saltRounds = 12;

async function addUsers() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  // Hash passwords
  const adminPassword = await bcrypt.hash('admin123', saltRounds);
  const ownerPassword = await bcrypt.hash('owner123', saltRounds);

  // Add admin
  let admin = await User.findOne({ email: 'admin@rewear.com' });
  if (!admin) {
    admin = await User.create({
      name: 'Admin',
      email: 'admin@rewear.com',
      password: adminPassword,
      role: 'admin',
      isActive: true,
      isEmailVerified: true,
      coinBalance: 5000
    });
    console.log('Admin user created.');
  } else {
    console.log('Admin user already exists.');
  }

  // Add owner
  let owner = await User.findOne({ email: 'owner@rewear.com' });
  if (!owner) {
    owner = await User.create({
      name: 'Owner',
      email: 'owner@rewear.com',
      password: ownerPassword,
      role: 'owner',
      isActive: true,
      isEmailVerified: true,
      coinBalance: 10000
    });
    console.log('Owner user created.');
  } else {
    console.log('Owner user already exists.');
  }

  process.exit(0);
}

addUsers(); 