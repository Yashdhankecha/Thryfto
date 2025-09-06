const mongoose = require('mongoose');
require('dotenv').config();

// Connect to database and check indexes
const checkIndexes = async () => {
  try {
    console.log('🔍 Checking database indexes...');
    
    // Connect to MongoDB
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mern-auth-app');
    console.log(`✅ Connected to MongoDB: ${conn.connection.host}`);
    
    // Get the User collection
    const User = require('./models/User');
    const collection = User.collection;
    
    // List all indexes
    const indexes = await collection.indexes();
    console.log('\n📋 Current indexes:');
    indexes.forEach((index, i) => {
      console.log(`${i + 1}. ${JSON.stringify(index.key)} - ${index.unique ? 'UNIQUE' : 'NORMAL'}`);
    });
    
    // Check for duplicate googleId indexes
    const googleIdIndexes = indexes.filter(index => 
      Object.keys(index.key).includes('googleId')
    );
    
    if (googleIdIndexes.length > 1) {
      console.log('\n⚠️  Found duplicate googleId indexes:');
      googleIdIndexes.forEach((index, i) => {
        console.log(`${i + 1}. ${JSON.stringify(index.key)}`);
      });
      
      console.log('\n💡 To fix this, you can:');
      console.log('1. Drop the duplicate index manually');
      console.log('2. Or restart your server (the warning should disappear)');
    } else {
      console.log('\n✅ No duplicate googleId indexes found');
    }
    
    await mongoose.disconnect();
    console.log('\n✅ Database connection closed');
    
  } catch (error) {
    console.error('❌ Error checking indexes:', error.message);
  }
};

// Run the check
checkIndexes(); 