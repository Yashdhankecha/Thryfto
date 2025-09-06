const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');
const Item = require('./models/Item');
const Transaction = require('./models/Transaction');
const CoinTransaction = require('./models/CoinTransaction');
const AuditLog = require('./models/AuditLog');

const MONGO_URI = 'mongodb://localhost:27017/rewear';
const saltRounds = 12;

async function hashPassword(password) {
  return await bcrypt.hash(password, saltRounds);
}

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  // --- USERS ---
  // Add owner
  let owner = await User.findOne({ email: 'owner@rewear.com' });
  if (!owner) {
    owner = await User.create({ name: 'Owner', email: 'owner@rewear.com', password: await hashPassword('owner123'), role: 'owner', isActive: true, isEmailVerified: true, coinBalance: 10000 });
  }
  // Add admin
  let admin = await User.findOne({ email: 'admin@rewear.com' });
  if (!admin) {
    admin = await User.create({ name: 'Admin', email: 'admin@rewear.com', password: await hashPassword('admin123'), role: 'admin', isActive: true, isEmailVerified: true, coinBalance: 5000 });
  }
  // Add two specific users
  let user7 = await User.findOne({ email: 'yashdhankecha7@gmail.com' });
  if (!user7) {
    user7 = await User.create({ name: 'Yash 7', email: 'yashdhankecha7@gmail.com', password: await hashPassword('Y@sh123'), role: 'user', isActive: true, isEmailVerified: true, coinBalance: 1200 });
  }
  let user8 = await User.findOne({ email: 'yashdhankecha8@gmail.com' });
  if (!user8) {
    user8 = await User.create({ name: 'Yash 8', email: 'yashdhankecha8@gmail.com', password: await hashPassword('Y@sh123'), role: 'user', isActive: true, isEmailVerified: true, coinBalance: 1300 });
  }

  // Add a few more users for variety
  const users = [user7, user8];
  const extraUsersData = [
    { name: 'Amit', email: 'amit@rewear.com', password: await hashPassword('Password123'), role: 'user', isActive: true, isEmailVerified: true, coinBalance: 800 },
    { name: 'Sneha', email: 'sneha@rewear.com', password: await hashPassword('Password123'), role: 'user', isActive: false, isEmailVerified: false, coinBalance: 600 }
  ];
  const extraUsers = await User.insertMany(extraUsersData, { ordered: false }).catch(() => []);
  users.push(...extraUsers.filter(Boolean));

  // --- ITEMS ---
  const categories = ['Outerwear', 'Dresses', 'Shoes', 'Tops', 'Bottoms'];
  const brands = ['Nike', 'Adidas', 'Zara', 'H&M', 'Levis'];
  for (let i = 0; i < 10; i++) {
    await Item.create({
      title: `Item ${i + 1}`,
      brand: brands[i % brands.length],
      category: categories[i % categories.length],
      status: ['pending', 'approved', 'swapped'][i % 3],
      user: users[i % users.length]._id,
      price: Math.floor(Math.random() * 2000 + 500),
      coinReward: Math.floor(Math.random() * 100 + 20),
      size: ['S', 'M', 'L'][i % 3],
      condition: ['New', 'Like New', 'Good'][i % 3],
      description: `This is a sample description for Item ${i + 1}.`,
      createdAt: new Date(Date.now() - i * 3 * 24 * 60 * 60 * 1000)
    });
  }

  // --- TRANSACTIONS ---
  const allItems = await Item.find();
  for (let i = 0; i < 8; i++) {
    await Transaction.create({
      item: allItems[i]._id,
      buyer: users[(i + 1) % users.length]._id,
      seller: users[i % users.length]._id,
      offerAmount: Math.floor(Math.random() * 2000 + 500),
      status: ['completed', 'pending', 'accepted', 'rejected'][i % 4],
      type: ['buy', 'offer'][i % 2],
      message: `Transaction message ${i + 1}`,
      createdAt: new Date(Date.now() - i * 2 * 24 * 60 * 60 * 1000)
    });
  }

  // --- COIN TRANSACTIONS ---
  for (let i = 0; i < 8; i++) {
    await CoinTransaction.create({
      user: users[i % users.length]._id,
      type: ['earned', 'redeemed'][i % 2],
      amount: Math.floor(Math.random() * 200 + 50),
      description: `Coin transaction ${i + 1}`,
      relatedTransaction: null,
      balanceAfter: Math.floor(Math.random() * 2000 + 500),
      createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000)
    });
  }

  // --- AUDIT LOGS ---
  for (let i = 0; i < 8; i++) {
    await AuditLog.create({
      user: owner._id,
      action: ['Created user', 'Deleted item', 'Updated settings', 'Viewed report'][i % 4],
      details: `Audit log details ${i + 1}`,
      createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000)
    });
  }

  console.log('Seed complete!');
  process.exit(0);
}

seed(); 