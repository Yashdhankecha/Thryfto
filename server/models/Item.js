const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  size: { type: String, required: false },
  color: { type: String },
  brand: { type: String },
  price: { type: Number, required: true }, // Price in INR
  coinReward: { type: Number, default: 0 }, // Coins earned from this transaction
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'swapped', 'sold'], default: 'pending' },
  flagged: { type: Boolean, default: false },
  images: [{ type: String }],
  category: { type: String, required: true },
  condition: { type: String, enum: ['New', 'Like New', 'Good', 'Fair'], required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  views: { type: Number, default: 0 },
});

module.exports = mongoose.model('Item', ItemSchema); 