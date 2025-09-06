const express = require('express');
const Item = require('../models/Item');
const Transaction = require('../models/Transaction');
const { protect } = require('../middleware/auth');
const router = express.Router();
const User = require('../models/User');

router.get('/overview', async (req, res) => {
  try {
    const totalItems = await Item.countDocuments();
    const swapsCompleted = await Item.countDocuments({ status: 'swapped' });
    const itemsAwaiting = await Item.countDocuments({ status: 'pending' });
    const flaggedItems = await Item.countDocuments({ flagged: true });
    const featuredItems = await Item.find().limit(5); // or use a 'featured' flag

    res.json({
      totalItems,
      swapsCompleted,
      itemsAwaiting,
      flaggedItems,
      featuredItems,
    });
  } catch (err) {
    res.status(500).json({ error: 'Dashboard data fetch failed' });
  }
});

// New endpoint for browsing items with filtering and pagination
router.get('/items', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 12, 
      category, 
      status, 
      condition, 
      minPrice, 
      maxPrice,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (condition) filter.condition = condition;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseInt(minPrice);
      if (maxPrice) filter.price.$lte = parseInt(maxPrice);
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get items with pagination
    const items = await Item.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count for pagination
    const totalItems = await Item.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / parseInt(limit));

    // Get unique categories for filter options
    const categories = await Item.distinct('category');
    const conditions = await Item.distinct('condition');

    res.json({
      items,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      },
      filters: {
        categories,
        conditions
      }
    });
  } catch (err) {
    console.error('Error fetching items:', err);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

// Simple in-memory cache for demo (resets on server restart)
const itemViewCache = {};
router.get('/items/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user.id : null;
    const uniqueKey = userId ? `user_${userId}` : `ip_${req.ip}`;
    const cacheKey = `${id}_${uniqueKey}`;

    // Only increment if not already viewed in this session
    if (!itemViewCache[cacheKey]) {
      await Item.findByIdAndUpdate(id, { $inc: { views: 1 } });
      itemViewCache[cacheKey] = true;
    }

    const item = await Item.findById(id).lean();
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json({ data: item });
  } catch (err) {
    console.error('Error fetching item:', err);
    res.status(500).json({ error: 'Failed to fetch item' });
  }
});

// Add new item (listing) - requires authentication
router.post('/items', protect, async (req, res) => {
  try {
    const {
      title,
      description,
      size,
      color,
      brand,
      points,
      category,
      condition,
      images
    } = req.body;

    // Validate required fields
    if (!title || !description || !points || !category || !condition) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }
    if (!Array.isArray(images) || images.length === 0 || !images[0]) {
      return res.status(400).json({ error: 'At least one image URL is required.' });
    }
    if (isNaN(points) || points <= 0) {
      return res.status(400).json({ error: 'Points must be a positive number.' });
    }

    // Create new item with user ID
    const newItem = new Item({
      title,
      description,
      size,
      color,
      brand,
      price: points, // Map points to price field
      category,
      condition,
      images,
      user: req.user.id, // Add the user ID from the authenticated request
      status: 'pending', // New items are pending approval by default
    });
    await newItem.save();
    
    // Award coins for successful listing (10 coins for listing)
    const listingCoins = 10;
    const user = await User.findById(req.user.id);
    if (user) {
      user.coinBalance += listingCoins;
      await user.save();
      
      // Record the coin transaction
      const CoinTransaction = require('../models/CoinTransaction');
      await CoinTransaction.create({
        user: req.user.id,
        type: 'earned',
        amount: listingCoins,
        description: `Earned ${listingCoins} coins for listing "${title}"`,
        relatedItem: newItem._id,
        balanceAfter: user.coinBalance
      });
    }
    
    res.status(201).json({ 
      success: true, 
      item: newItem,
      coinsEarned: listingCoins,
      message: `Item listed successfully! You earned ${listingCoins} coins.`
    });
  } catch (err) {
    console.error('Error creating item:', err);
    res.status(500).json({ error: 'Failed to create item.' });
  }
});

// Update item (editing) - requires authentication
router.put('/items/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      size,
      color,
      brand,
      points,
      category,
      condition,
      images
    } = req.body;

    // Validate required fields
    if (!title || !description || !points || !category || !condition) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }
    if (!Array.isArray(images) || images.length === 0 || !images[0]) {
      return res.status(400).json({ error: 'At least one image URL is required.' });
    }
    if (isNaN(points) || points <= 0) {
      return res.status(400).json({ error: 'Points must be a positive number.' });
    }

    // Check if item exists and belongs to user
    const item = await Item.findById(id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found.' });
    }
    if (item.user.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this item.' });
    }

    // Update item
    const updatedItem = await Item.findByIdAndUpdate(id, {
      title,
      description,
      size,
      color,
      brand,
      price: points, // Map points to price field
      category,
      condition,
      images,
      status: 'pending', // Reset to pending when updated
    }, { new: true });

    res.json({ success: true, item: updatedItem });
  } catch (err) {
    console.error('Error updating item:', err);
    res.status(500).json({ error: 'Failed to update item.' });
  }
});

// Get user's listed products (items they created)
router.get('/user/listed', protect, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const items = await Item.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const totalItems = await Item.countDocuments({ user: req.user.id });
    const totalPages = Math.ceil(totalItems / parseInt(limit));

    res.json({
      items,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    });
  } catch (err) {
    console.error('Error fetching user listed items:', err);
    res.status(500).json({ error: 'Failed to fetch listed items' });
  }
});

// Get user's bought products (completed transactions)
router.get('/user/bought', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Get completed transactions where user is the buyer
    const transactions = await Transaction.find({ 
      buyer: req.user.id,
      status: 'completed'
    })
    .populate('item', 'title images price coinReward category condition size brand')
    .populate('seller', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
    
    // Get total count
    const totalItems = await Transaction.countDocuments({ 
      buyer: req.user.id,
      status: 'completed'
    });
    
    const totalPages = Math.ceil(totalItems / limit);
    
    res.json({
      items: transactions.map(t => ({
        ...t.item.toObject(),
        transactionId: t._id,
        purchaseDate: t.createdAt,
        amount: t.offerAmount,
        seller: t.seller
      })),
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (err) {
    console.error('Error fetching user bought items:', err);
    res.status(500).json({ error: 'Failed to fetch bought items' });
  }
});

// Get user's sold products (completed transactions where user is seller)
router.get('/user/sold', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Get completed transactions where user is the seller
    const transactions = await Transaction.find({ 
      seller: req.user.id,
      status: 'completed'
    })
    .populate('item', 'title images price coinReward category condition size brand')
    .populate('buyer', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
    
    // Get total count
    const totalItems = await Transaction.countDocuments({ 
      seller: req.user.id,
      status: 'completed'
    });
    
    const totalPages = Math.ceil(totalItems / limit);
    
    res.json({
      items: transactions.map(t => ({
        ...t.item.toObject(),
        transactionId: t._id,
        saleDate: t.createdAt,
        amount: t.offerAmount,
        buyer: t.buyer
      })),
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (err) {
    console.error('Error fetching user sold items:', err);
    res.status(500).json({ error: 'Failed to fetch sold items' });
  }
});

// Buy an item (direct purchase)
router.post('/items/:id/buy', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { message = '' } = req.body;
    
    const item = await Item.findById(id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    if (item.user.toString() === req.user.id) {
      return res.status(400).json({ error: 'You cannot buy your own item' });
    }
    
    if (item.status !== 'approved') {
      return res.status(400).json({ error: 'Item is not available for purchase' });
    }
    
    // Create transaction
    const transaction = new Transaction({
      item: id,
      buyer: req.user.id,
      seller: item.user,
      offerAmount: item.price,
      coinReward: item.coinReward || 0,
      type: 'buy',
      message
    });
    
    await transaction.save();
    
    // Update item status to pending
    await Item.findByIdAndUpdate(id, { status: 'pending' });
    
    // Create notification for seller
    const Notification = require('../models/Notification');
    await Notification.create({
      recipient: item.user,
      sender: req.user.id,
      type: 'buy_request',
      title: 'Buy Request Received',
      message: `${req.user.name} wants to buy your item "${item.title}" for ₹${item.price}.`,
      relatedItem: id,
      relatedTransaction: transaction._id,
      actionRequired: 'deal'
    });
    
    res.json({ 
      success: true, 
      message: 'Purchase request sent to seller',
      transaction: transaction
    });
  } catch (err) {
    console.error('Error creating buy transaction:', err);
    res.status(500).json({ error: 'Failed to process purchase' });
  }
});

// Make an offer for an item
router.post('/items/:id/offer', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { offerAmount, message = '' } = req.body;
    
    if (!offerAmount || offerAmount <= 0) {
      return res.status(400).json({ error: 'Valid offer amount is required' });
    }
    
    const item = await Item.findById(id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    if (item.user.toString() === req.user.id) {
      return res.status(400).json({ error: 'You cannot offer on your own item' });
    }
    
    if (item.status !== 'approved') {
      return res.status(400).json({ error: 'Item is not available for offers' });
    }
    
    // Create transaction
    const transaction = new Transaction({
      item: id,
      buyer: req.user.id,
      seller: item.user,
      offerAmount,
      coinReward: item.coinReward || 0,
      type: 'offer',
      message
    });
    
    await transaction.save();
    
    // Create notification for seller
    const Notification = require('../models/Notification');
    await Notification.create({
      recipient: item.user,
      sender: req.user.id,
      type: 'offer_made',
      title: 'Offer Received',
      message: `${req.user.name} made an offer of ₹${offerAmount} for your item "${item.title}".`,
      relatedItem: id,
      relatedTransaction: transaction._id,
      actionRequired: 'deal'
    });
    
    res.json({ 
      success: true, 
      message: 'Offer sent to seller',
      transaction: transaction
    });
  } catch (err) {
    console.error('Error creating offer transaction:', err);
    res.status(500).json({ error: 'Failed to process offer' });
  }
});

// Get seller's pending transactions (notifications)
router.get('/seller/transactions', protect, async (req, res) => {
  try {
    const transactions = await Transaction.find({ 
      seller: req.user.id,
      status: 'pending'
    })
    .populate('item', 'title images points')
    .populate('buyer', 'name email')
    .sort({ createdAt: -1 });
    
    res.json({ transactions });
  } catch (err) {
    console.error('Error fetching seller transactions:', err);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Get buyer's transactions (purchases/offers)
router.get('/buyer/transactions', protect, async (req, res) => {
  try {
    const transactions = await Transaction.find({ 
      buyer: req.user.id
    })
    .populate('item', 'title images points status')
    .populate('seller', 'name email')
    .sort({ createdAt: -1 });
    
    res.json({ transactions });
  } catch (err) {
    console.error('Error fetching buyer transactions:', err);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Accept or reject a transaction
router.put('/transactions/:id/respond', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'accept' or 'reject'
    
    const transaction = await Transaction.findById(id);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    if (transaction.seller.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    if (transaction.status !== 'pending') {
      return res.status(400).json({ error: 'Transaction already processed' });
    }
    
    if (action === 'accept') {
      transaction.status = 'accepted';
      
      // Update item status to sold
      await Item.findByIdAndUpdate(transaction.item, { status: 'sold' });
      
      // Award coins to both buyer and seller
      const CoinTransaction = require('../models/CoinTransaction');
      
      // Award coins to buyer (5% of purchase amount)
      const buyerCoins = Math.floor(transaction.offerAmount * 0.05);
      if (buyerCoins > 0) {
        const buyer = await User.findById(transaction.buyer);
        if (buyer) {
          buyer.coinBalance += buyerCoins;
          await buyer.save();
          
          await CoinTransaction.create({
            user: transaction.buyer,
            type: 'earned',
            amount: buyerCoins,
            description: `Earned ${buyerCoins} coins from purchasing "${transaction.item.title || 'item'}"`,
            relatedTransaction: transaction._id,
            relatedItem: transaction.item,
            balanceAfter: buyer.coinBalance
          });
        }
      }
      
      // Award coins to seller (3% of sale amount)
      const sellerCoins = Math.floor(transaction.offerAmount * 0.03);
      if (sellerCoins > 0) {
        const seller = await User.findById(transaction.seller);
        if (seller) {
          seller.coinBalance += sellerCoins;
          await seller.save();
          
          await CoinTransaction.create({
            user: transaction.seller,
            type: 'earned',
            amount: sellerCoins,
            description: `Earned ${sellerCoins} coins from selling "${transaction.item.title || 'item'}"`,
            relatedTransaction: transaction._id,
            relatedItem: transaction.item,
            balanceAfter: seller.coinBalance
          });
        }
      }
    } else if (action === 'reject') {
      transaction.status = 'rejected';
      // Reset item status to approved if it was pending
      await Item.findByIdAndUpdate(transaction.item, { status: 'approved' });
    }
    
    await transaction.save();
    
    res.json({ 
      success: true, 
      message: `Transaction ${action}ed`,
      transaction
    });
  } catch (err) {
    console.error('Error responding to transaction:', err);
    res.status(500).json({ error: 'Failed to process response' });
  }
});

// Dummy data seeding endpoint (for development/testing only)
router.post('/seed', async (req, res) => {
  try {
    await Item.deleteMany({});
    await Item.insertMany([
      {
        title: 'Vintage Denim Jacket',
        description: 'Classic blue denim jacket with a vintage wash.',
        size: 'M',
        color: 'Blue',
        brand: 'Levi\'s',
        points: 120,
        status: 'approved',
        flagged: false,
        images: ['https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=400&h=400&fit=crop'],
        category: 'Outerwear',
        condition: 'Like New',
        user: '507f1f77bcf86cd799439011', // Dummy user ID
      },
      {
        title: 'Summer Floral Dress',
        description: 'Lightweight dress with a colorful floral pattern.',
        size: 'S',
        color: 'Multicolor',
        brand: 'H&M',
        points: 95,
        status: 'approved',
        flagged: false,
        images: ['https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=400&fit=crop'],
        category: 'Dresses',
        condition: 'Good',
        user: '507f1f77bcf86cd799439011', // Dummy user ID
      },
      {
        title: 'Designer Sneakers',
        description: 'Trendy white sneakers, gently used.',
        size: '9',
        color: 'White',
        brand: 'Nike',
        points: 150,
        status: 'swapped',
        flagged: false,
        images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop'],
        category: 'Shoes',
        condition: 'Like New',
        user: '507f1f77bcf86cd799439011', // Dummy user ID
      },
      {
        title: 'Wool Coat',
        description: 'Warm wool coat, perfect for winter.',
        size: 'L',
        color: 'Gray',
        brand: 'Zara',
        points: 110,
        status: 'pending',
        flagged: false,
        images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop'],
        category: 'Outerwear',
        condition: 'Good',
        user: '507f1f77bcf86cd799439011', // Dummy user ID
      },
      {
        title: 'Silk Blouse',
        description: 'Elegant black silk blouse, lightly worn.',
        size: 'M',
        color: 'Black',
        brand: 'Uniqlo',
        points: 80,
        status: 'pending',
        flagged: true,
        images: ['https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop'],
        category: 'Tops',
        condition: 'Fair',
        user: '507f1f77bcf86cd799439011', // Dummy user ID
      },
      {
        title: 'Flagged T-Shirt',
        description: 'Basic white tee, flagged for review.',
        size: 'S',
        color: 'White',
        brand: 'Gap',
        points: 60,
        status: 'approved',
        flagged: true,
        images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop'],
        category: 'Tops',
        condition: 'Good',
        user: '507f1f77bcf86cd799439011', // Dummy user ID
      },
      {
        title: 'Classic Trench',
        description: 'Timeless beige trench coat.',
        size: 'L',
        color: 'Beige',
        brand: 'Burberry',
        points: 130,
        status: 'swapped',
        flagged: false,
        images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop'],
        category: 'Outerwear',
        condition: 'Like New',
        user: '507f1f77bcf86cd799439011', // Dummy user ID
      },
      {
        title: 'Leather Handbag',
        description: 'Elegant brown leather handbag with gold hardware.',
        size: 'One Size',
        color: 'Brown',
        brand: 'Coach',
        points: 180,
        status: 'approved',
        flagged: false,
        images: ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=400&fit=crop'],
        category: 'Accessories',
        condition: 'Like New',
        user: '507f1f77bcf86cd799439011', // Dummy user ID
      },
      {
        title: 'Denim Jeans',
        description: 'Classic blue denim jeans with perfect fit.',
        size: '32x32',
        color: 'Blue',
        brand: 'Levi\'s',
        points: 85,
        status: 'approved',
        flagged: false,
        images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop'],
        category: 'Bottoms',
        condition: 'Good',
        user: '507f1f77bcf86cd799439011', // Dummy user ID
      },
      {
        title: 'Summer Hat',
        description: 'Straw hat perfect for beach days.',
        size: 'M',
        color: 'Beige',
        brand: 'H&M',
        points: 45,
        status: 'pending',
        flagged: false,
        images: ['https://images.unsplash.com/photo-1521369909029-2afed882baee?w=400&h=400&fit=crop'],
        category: 'Accessories',
        condition: 'New',
        user: '507f1f77bcf86cd799439011', // Dummy user ID
      },
      {
        title: 'Winter Scarf',
        description: 'Warm wool scarf in navy blue.',
        size: 'One Size',
        color: 'Navy',
        brand: 'Gap',
        points: 35,
        status: 'approved',
        flagged: false,
        images: ['https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400&h=400&fit=crop'],
        category: 'Accessories',
        condition: 'Good',
        user: '507f1f77bcf86cd799439011', // Dummy user ID
      },
      {
        title: 'Running Shoes',
        description: 'Comfortable running shoes for daily workouts.',
        size: '10',
        color: 'Black',
        brand: 'Adidas',
        points: 120,
        status: 'swapped',
        flagged: false,
        images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop'],
        category: 'Shoes',
        condition: 'Good',
        user: '507f1f77bcf86cd799439011', // Dummy user ID
      },
      {
        title: 'Evening Dress',
        description: 'Elegant black evening dress for special occasions.',
        size: 'M',
        color: 'Black',
        brand: 'Zara',
        points: 200,
        status: 'approved',
        flagged: false,
        images: ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=400&fit=crop'],
        category: 'Dresses',
        condition: 'Like New',
        user: '507f1f77bcf86cd799439011', // Dummy user ID
      },
      {
        title: 'Casual Sweater',
        description: 'Cozy knit sweater perfect for fall weather.',
        size: 'L',
        color: 'Gray',
        brand: 'Uniqlo',
        points: 75,
        status: 'pending',
        flagged: false,
        images: ['https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=400&fit=crop'],
        category: 'Tops',
        condition: 'Good',
        user: '507f1f77bcf86cd799439011', // Dummy user ID
      },
    ]);
    res.json({ success: true, message: 'Dummy items seeded.' });
  } catch (err) {
    res.status(500).json({ error: 'Seeding failed' });
  }
});

// Test endpoint to create sample items for testing buy/sell system
router.post('/test/setup-buy-sell', async (req, res) => {
  try {
    // First, let's create or find the test users
    let sellerUser = await User.findOne({ email: 'yashdhankecha8@gmail.com' });
    if (!sellerUser) {
      sellerUser = new User({
        name: 'Yash Dhankecha',
        email: 'yashdhankecha8@gmail.com',
        password: 'Test123!',
        isEmailVerified: true
      });
      await sellerUser.save();
    }
    
    // Create a test buyer user
    let buyerUser = await User.findOne({ email: 'testbuyer@example.com' });
    if (!buyerUser) {
      buyerUser = new User({
        name: 'Test Buyer',
        email: 'testbuyer@example.com',
        password: 'Test123!',
        isEmailVerified: true
      });
      await buyerUser.save();
    }
    
    // Create sample items for the seller
    const sampleItems = [
      {
        title: 'Vintage Denim Jacket',
        description: 'Classic blue denim jacket with a vintage wash, perfect for casual wear.',
        size: 'M',
        color: 'Blue',
        brand: 'Levi\'s',
        points: 120,
        status: 'approved',
        flagged: false,
        images: ['https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=400&h=400&fit=crop'],
        category: 'Outerwear',
        condition: 'Like New',
        user: sellerUser._id,
      },
      {
        title: 'Summer Floral Dress',
        description: 'Lightweight dress with a colorful floral pattern, perfect for summer.',
        size: 'S',
        color: 'Multicolor',
        brand: 'H&M',
        points: 95,
        status: 'approved',
        flagged: false,
        images: ['https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=400&fit=crop'],
        category: 'Dresses',
        condition: 'Good',
        user: sellerUser._id,
      },
      {
        title: 'Designer Sneakers',
        description: 'Trendy white sneakers, gently used but in excellent condition.',
        size: '9',
        color: 'White',
        brand: 'Nike',
        points: 150,
        status: 'approved',
        flagged: false,
        images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop'],
        category: 'Shoes',
        condition: 'Like New',
        user: sellerUser._id,
      }
    ];
    
    // Clear existing test items and add new ones
    await Item.deleteMany({ user: sellerUser._id });
    const createdItems = await Item.insertMany(sampleItems);
    
    res.json({ 
      success: true, 
      message: 'Test setup completed',
      seller: {
        email: sellerUser.email,
        name: sellerUser.name,
        id: sellerUser._id
      },
      buyer: {
        email: buyerUser.email,
        name: buyerUser.name,
        id: buyerUser._id
      },
      itemsCreated: sampleItems.length
    });
  } catch (err) {
    console.error('Error setting up test data:', err);
    res.status(500).json({ error: 'Failed to setup test data' });
  }
});

// Add sample buy/sell transaction data
router.post('/test/add-transaction-data', async (req, res) => {
  try {
    const Transaction = require('../models/Transaction');
    
    // Find the test users
    const sellerUser = await User.findOne({ email: 'yashdhankecha8@gmail.com' });
    const buyerUser = await User.findOne({ email: 'testbuyer@example.com' });
    
    if (!sellerUser || !buyerUser) {
      return res.status(400).json({ error: 'Test users not found. Please run setup first.' });
    }
    
    // Get items owned by the seller
    const sellerItems = await Item.find({ user: sellerUser._id });
    
    if (sellerItems.length === 0) {
      return res.status(400).json({ error: 'No items found for seller. Please run setup first.' });
    }
    
    // Create sample transactions
    const sampleTransactions = [
      {
        item: sellerItems[0]._id,
        buyer: buyerUser._id,
        seller: sellerUser._id,
        offerAmount: 110,
        status: 'pending',
        type: 'offer',
        message: 'Hi! I really like this jacket. Would you consider selling it for 110 points?',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      },
      {
        item: sellerItems[1]._id,
        buyer: buyerUser._id,
        seller: sellerUser._id,
        offerAmount: 90,
        status: 'accepted',
        type: 'offer',
        message: 'This dress is perfect for my summer vacation! Can I offer 90 points?',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
      },
      {
        item: sellerItems[2]._id,
        buyer: buyerUser._id,
        seller: sellerUser._id,
        offerAmount: 150,
        status: 'rejected',
        type: 'buy',
        message: 'I\'ll buy these sneakers for the full price!',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
      },
      {
        item: sellerItems[0]._id,
        buyer: buyerUser._id,
        seller: sellerUser._id,
        offerAmount: 125,
        status: 'completed',
        type: 'buy',
        message: 'I love this jacket! Buying it now.',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
      },
      {
        item: sellerItems[1]._id,
        buyer: buyerUser._id,
        seller: sellerUser._id,
        offerAmount: 85,
        status: 'pending',
        type: 'offer',
        message: 'Would you accept 85 points for the dress? I can pick it up today.',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      }
    ];
    
    // Clear existing test transactions and add new ones
    await Transaction.deleteMany({
      $or: [
        { buyer: buyerUser._id },
        { seller: sellerUser._id }
      ]
    });
    
    const createdTransactions = await Transaction.insertMany(sampleTransactions);
    
    res.json({ 
      success: true, 
      message: 'Transaction data added successfully',
      transactionsCreated: createdTransactions.length,
      transactions: createdTransactions.map(t => ({
        id: t._id,
        itemTitle: sellerItems.find(item => item._id.toString() === t.item.toString())?.title,
        status: t.status,
        type: t.type,
        offerAmount: t.offerAmount,
        message: t.message,
        createdAt: t.createdAt
      }))
    });
  } catch (err) {
    console.error('Error adding transaction data:', err);
    res.status(500).json({ error: 'Failed to add transaction data' });
  }
});

// Create additional test users and diverse transaction scenarios
router.post('/test/create-diverse-data', async (req, res) => {
  try {
    const Transaction = require('../models/Transaction');
    
    // Create additional test users
    const additionalUsers = [
      {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@example.com',
        password: 'Test123!',
        isEmailVerified: true
      },
      {
        name: 'Mike Chen',
        email: 'mike.chen@example.com',
        password: 'Test123!',
        isEmailVerified: true
      },
      {
        name: 'Emma Davis',
        email: 'emma.davis@example.com',
        password: 'Test123!',
        isEmailVerified: true
      }
    ];
    
    // Create or find these users
    const createdUsers = [];
    for (const userData of additionalUsers) {
      let user = await User.findOne({ email: userData.email });
      if (!user) {
        user = new User(userData);
        await user.save();
      }
      createdUsers.push(user);
    }
    
    // Create additional items for different users
    const additionalItems = [
      {
        title: 'Leather Handbag',
        description: 'Elegant brown leather handbag, perfect for professional settings.',
        size: 'One Size',
        color: 'Brown',
        brand: 'Coach',
        points: 180,
        status: 'approved',
        flagged: false,
        images: ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=400&fit=crop'],
        category: 'Accessories',
        condition: 'Like New',
        user: createdUsers[0]._id,
      },
      {
        title: 'Casual T-Shirt',
        description: 'Comfortable cotton t-shirt with a simple design.',
        size: 'L',
        color: 'White',
        brand: 'Uniqlo',
        points: 45,
        status: 'approved',
        flagged: false,
        images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop'],
        category: 'Tops',
        condition: 'Good',
        user: createdUsers[1]._id,
      },
      {
        title: 'Formal Blazer',
        description: 'Professional black blazer for business meetings.',
        size: 'M',
        color: 'Black',
        brand: 'Zara',
        points: 200,
        status: 'approved',
        flagged: false,
        images: ['https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop'],
        category: 'Outerwear',
        condition: 'New',
        user: createdUsers[2]._id,
      }
    ];
    
    // Add these items to the database
    const createdItems = await Item.insertMany(additionalItems);
    
    // Create diverse transaction scenarios
    const diverseTransactions = [
      // Transactions involving the original test users
      {
        item: createdItems[0]._id,
        buyer: createdUsers[1]._id,
        seller: createdUsers[0]._id,
        offerAmount: 170,
        status: 'pending',
        type: 'offer',
        message: 'This bag would be perfect for my work! Can we negotiate the price?',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        item: createdItems[1]._id,
        buyer: createdUsers[2]._id,
        seller: createdUsers[1]._id,
        offerAmount: 40,
        status: 'accepted',
        type: 'offer',
        message: 'I need a casual shirt for the weekend. Is 40 points okay?',
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
      },
      {
        item: createdItems[2]._id,
        buyer: createdUsers[0]._id,
        seller: createdUsers[2]._id,
        offerAmount: 200,
        status: 'completed',
        type: 'buy',
        message: 'Perfect for my job interview next week!',
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
      },
      // Cross-user transactions
      {
        item: createdItems[0]._id,
        buyer: createdUsers[2]._id,
        seller: createdUsers[0]._id,
        offerAmount: 175,
        status: 'rejected',
        type: 'offer',
        message: 'I love this bag! Would you consider 175 points?',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        item: createdItems[1]._id,
        buyer: createdUsers[0]._id,
        seller: createdUsers[1]._id,
        offerAmount: 50,
        status: 'pending',
        type: 'offer',
        message: 'This shirt looks great! Can I offer 50 points?',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      }
    ];
    
    // Add these transactions
    const createdTransactions = await Transaction.insertMany(diverseTransactions);
    
    res.json({ 
      success: true, 
      message: 'Diverse test data created successfully',
      usersCreated: createdUsers.length,
      itemsCreated: createdItems.length,
      transactionsCreated: createdTransactions.length,
      users: createdUsers.map(u => ({ name: u.name, email: u.email })),
      items: createdItems.map(i => ({ title: i.title, points: i.points })),
      transactions: createdTransactions.map(t => ({
        status: t.status,
        type: t.type,
        offerAmount: t.offerAmount
      }))
    });
  } catch (err) {
    console.error('Error creating diverse data:', err);
    res.status(500).json({ error: 'Failed to create diverse data' });
  }
});

// Add dummy bought products for yashdhankecha8@gmail.com
router.post('/test/add-bought-products', async (req, res) => {
  try {
    const Transaction = require('../models/Transaction');
    const sellerUser = await User.findOne({ email: 'yashdhankecha8@gmail.com' });
    if (!sellerUser) {
      return res.status(400).json({ error: 'Seller user not found.' });
    }

    // Find a few items NOT owned by yashdhankecha8@gmail.com
    const items = await Item.find({ user: { $ne: sellerUser._id } }).limit(3);
    if (items.length === 0) {
      return res.status(400).json({ error: 'No items found not owned by the user.' });
    }

    // For each item, create a transaction where yashdhankecha8@gmail.com is the buyer and status is accepted/completed
    const transactions = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const status = i % 2 === 0 ? 'accepted' : 'completed';
      const type = i % 2 === 0 ? 'buy' : 'offer';
      transactions.push({
        item: item._id,
        buyer: sellerUser._id,
        seller: item.user,
        offerAmount: item.points,
        status,
        type,
        message: `Test bought product #${i + 1}`,
        createdAt: new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000)
      });
    }

    // Insert transactions
    await Transaction.insertMany(transactions);

    res.json({
      success: true,
      message: 'Dummy bought products added for yashdhankecha8@gmail.com',
      transactionsCreated: transactions.length,
      items: items.map(item => ({ title: item.title, id: item._id }))
    });
  } catch (err) {
    console.error('Error adding bought products:', err);
    res.status(500).json({ error: 'Failed to add bought products' });
  }
});

module.exports = router;
