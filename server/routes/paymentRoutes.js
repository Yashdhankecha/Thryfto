const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const razorpay = require('../config/razorpay');
const Item = require('../models/Item');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const CoinTransaction = require('../models/CoinTransaction');
const crypto = require('crypto');

// Test route to verify payment routes are working
router.get('/test', (req, res) => {
  res.json({ message: 'Payment routes are working!', timestamp: new Date().toISOString() });
});

// Create Razorpay order
router.post('/create-order', protect, async (req, res) => {
  try {
    console.log('🛒 Payment create-order request received:', req.body);
    const { productId } = req.body;
    const buyerId = req.user.id;

    // Fetch product details
    const product = await Item.findById(productId).populate('user', 'name email phone');
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if product is available for purchase
    if (product.status !== 'approved') {
      return res.status(400).json({ error: 'Product is not available for purchase' });
    }

    // Check if user is not trying to buy their own product
    if (product.user._id.toString() === buyerId) {
      return res.status(400).json({ error: 'You cannot buy your own product' });
    }

    // Get buyer details
    const buyer = await User.findById(buyerId);
    if (!buyer) {
      return res.status(404).json({ error: 'Buyer not found' });
    }

    // Create Razorpay order
    const orderOptions = {
      amount: product.price * 100, // Convert to paise
      currency: 'INR',
      receipt: `order_${productId}_${Date.now()}`,
      notes: {
        productId: productId,
        buyerId: buyerId,
        sellerId: product.user._id.toString(),
        productTitle: product.title
      }
    };

    const order = await razorpay.orders.create(orderOptions);

    res.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt
      },
      product: {
        id: product._id,
        title: product.title,
        price: product.price,
        seller: {
          name: product.user.name,
          email: product.user.email
        }
      },
      buyer: {
        name: buyer.name,
        email: buyer.email,
        phone: buyer.phone || ''
      }
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Verify payment
router.post('/verify-payment', protect, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'your_secret_key_here')
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    // Get order details from Razorpay
    const order = await razorpay.orders.fetch(razorpay_order_id);
    const productId = order.notes.productId;
    const buyerId = order.notes.buyerId;
    const sellerId = order.notes.sellerId;

    // Fetch product and user details
    const product = await Item.findById(productId);
    const buyer = await User.findById(buyerId);
    const seller = await User.findById(sellerId);

    if (!product || !buyer || !seller) {
      return res.status(404).json({ error: 'Product or user not found' });
    }

    // Check if product is still available
    if (product.status !== 'approved') {
      return res.status(400).json({ error: 'Product is no longer available' });
    }

    // Create transaction record
    const transaction = new Transaction({
      item: productId,
      buyer: buyerId,
      seller: sellerId,
      offerAmount: product.price,
      coinReward: Math.floor(product.price * 0.05), // 5% of price as coins
      status: 'completed',
      type: 'buy',
      message: 'Payment completed via Razorpay',
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id
    });

    await transaction.save();

    // Update product status to sold
    await Item.findByIdAndUpdate(productId, { status: 'sold' });

    // Award coins to buyer (5% of purchase amount)
    const buyerCoins = Math.floor(product.price * 0.05);
    if (buyerCoins > 0) {
      buyer.coinBalance += buyerCoins;
      await buyer.save();

      await CoinTransaction.create({
        user: buyerId,
        type: 'earned',
        amount: buyerCoins,
        description: `Earned ${buyerCoins} coins from purchasing "${product.title}"`,
        relatedTransaction: transaction._id,
        relatedItem: productId,
        balanceAfter: buyer.coinBalance
      });
    }

    // Award coins to seller (3% of sale amount)
    const sellerCoins = Math.floor(product.price * 0.03);
    if (sellerCoins > 0) {
      seller.coinBalance += sellerCoins;
      await seller.save();

      await CoinTransaction.create({
        user: sellerId,
        type: 'earned',
        amount: sellerCoins,
        description: `Earned ${sellerCoins} coins from selling "${product.title}"`,
        relatedTransaction: transaction._id,
        relatedItem: productId,
        balanceAfter: seller.coinBalance
      });
    }

    res.json({
      success: true,
      message: 'Payment verified successfully',
      transaction: {
        id: transaction._id,
        amount: product.price,
        buyerCoins: buyerCoins,
        sellerCoins: sellerCoins
      },
      buyer: {
        coinBalance: buyer.coinBalance
      },
      seller: {
        coinBalance: seller.coinBalance
      }
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});

// Get payment details for a transaction
router.get('/transaction/:id', protect, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('item', 'title images price')
      .populate('buyer', 'name email')
      .populate('seller', 'name email');

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Check if user is part of this transaction
    if (transaction.buyer._id.toString() !== req.user.id && 
        transaction.seller._id.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to view this transaction' });
    }

    res.json({ transaction });
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({ error: 'Failed to fetch transaction' });
  }
});

module.exports = router;
