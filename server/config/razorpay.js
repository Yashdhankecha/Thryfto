const Razorpay = require('razorpay');

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_1DP5mmOlF5G5ag', // Test key
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'BxK1bVnqgqgqgqgqgqgqgqg' // Test secret
});

console.log('🔑 Razorpay initialized with key:', process.env.RAZORPAY_KEY_ID ? 'Environment variable' : 'Test key');

module.exports = razorpay;
