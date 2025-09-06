const mongoose = require('mongoose');

async function checkMongoDB() {
  try {
    console.log('Checking MongoDB connection...');
    console.log('MONGODB_URI:', process.env.MONGODB_URI || 'Not set');
    
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI is not set in environment variables');
      console.log('Please add MONGODB_URI to your .env file');
      return;
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected Successfully!');
    console.log('Host:', conn.connection.host);
    console.log('Database:', conn.connection.name);
    
    await mongoose.disconnect();
    console.log('✅ Connection test completed successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:');
    console.error(error.message);
    console.log('\nPossible solutions:');
    console.log('1. Install MongoDB locally');
    console.log('2. Use MongoDB Atlas (cloud)');
    console.log('3. Check your connection string');
  }
}

// Load environment variables
require('dotenv').config();

checkMongoDB(); 