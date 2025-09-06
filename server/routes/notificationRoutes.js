const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Notification = require('../models/Notification');
const Transaction = require('../models/Transaction');
const Item = require('../models/Item');
const User = require('../models/User');
const CoinTransaction = require('../models/CoinTransaction');

// Create a new notification
router.post('/', protect, async (req, res) => {
  try {
    const { recipient, sender, type, title, message, relatedItem, relatedTransaction, actionRequired } = req.body;
    
    const notification = await Notification.create({
      recipient,
      sender,
      type,
      title,
      message,
      relatedItem,
      relatedTransaction,
      actionRequired,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    });
    
    res.json({ success: true, notification });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's notifications
router.get('/', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ 
      recipient: req.user.id,
      expiresAt: { $gt: new Date() }
    })
    .populate('sender', 'name')
    .populate('relatedItem', 'title images')
    .populate('relatedTransaction')
    .sort({ createdAt: -1 })
    .limit(50);

    res.json({ notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark notification as read
router.put('/:id/read', protect, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    if (notification.recipient.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    notification.isRead = true;
    await notification.save();
    
    res.json({ success: true, notification });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark all notifications as read
router.put('/read-all', protect, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, isRead: false },
      { isRead: true }
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get unread notification count
router.get('/unread-count', protect, async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user.id,
      isRead: false,
      expiresAt: { $gt: new Date() }
    });
    
    res.json({ count });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Handle deal response (deal, make_offer, no_deal)
router.post('/:id/respond', protect, async (req, res) => {
  try {
    const { action, counterOfferAmount, message } = req.body;
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    if (notification.recipient.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const transaction = await Transaction.findById(notification.relatedTransaction);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    let newNotification;
    
    switch (action) {
      case 'deal':
        // Accept the deal
        transaction.status = 'accepted';
        await transaction.save();
        
        // Update item status to sold
        await Item.findByIdAndUpdate(transaction.item, { status: 'sold' });
        
        // Notify buyer that payment is required
        newNotification = await Notification.create({
          recipient: transaction.buyer,
          sender: req.user.id,
          type: 'payment_required',
          title: 'Payment Required',
          message: `Your deal for "${transaction.item}" has been accepted. Please complete the payment to finalize the transaction.`,
          relatedItem: transaction.item,
          relatedTransaction: transaction._id,
          actionRequired: 'pay'
        });
        
        break;
        
      case 'make_offer':
        // Create counter offer
        if (!counterOfferAmount || counterOfferAmount <= 0) {
          return res.status(400).json({ message: 'Valid counter offer amount is required' });
        }
        
        const counterTransaction = new Transaction({
          item: transaction.item,
          buyer: req.user.id,
          seller: transaction.buyer,
          offerAmount: counterOfferAmount,
          coinReward: transaction.coinReward,
          type: 'offer',
          message: message || 'Counter offer from seller'
        });
        
        await counterTransaction.save();
        
        // Notify original buyer about counter offer
        newNotification = await Notification.create({
          recipient: transaction.buyer,
          sender: req.user.id,
          type: 'counter_offer',
          title: 'Counter Offer Received',
          message: `Seller made a counter offer of ₹${counterOfferAmount} for "${transaction.item}".`,
          relatedItem: transaction.item,
          relatedTransaction: counterTransaction._id,
          actionRequired: 'respond_to_offer'
        });
        
        break;
        
      case 'no_deal':
        // Reject the deal
        transaction.status = 'rejected';
        await transaction.save();
        
        // Reset item status
        await Item.findByIdAndUpdate(transaction.item, { status: 'approved' });
        
        // Notify buyer about rejection
        newNotification = await Notification.create({
          recipient: transaction.buyer,
          sender: req.user.id,
          type: 'deal_rejected',
          title: 'Deal Rejected',
          message: `Your deal for "${transaction.item}" has been rejected by the seller.`,
          relatedItem: transaction.item,
          relatedTransaction: transaction._id
        });
        
        break;
        
      default:
        return res.status(400).json({ message: 'Invalid action' });
    }
    
    // Mark original notification as read
    notification.isRead = true;
    await notification.save();
    
    res.json({ 
      success: true, 
      message: `Deal ${action === 'deal' ? 'accepted' : action === 'no_deal' ? 'rejected' : 'counter offer sent'}`,
      notification: newNotification
    });
    
  } catch (error) {
    console.error('Error responding to deal:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Handle payment completion
router.post('/:id/complete-payment', protect, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    if (notification.recipient.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const transaction = await Transaction.findById(notification.relatedTransaction);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    if (transaction.status !== 'accepted') {
      return res.status(400).json({ message: 'Transaction is not in accepted state' });
    }
    
    // Mark transaction as completed
    transaction.status = 'completed';
    await transaction.save();
    
    // Award coins to buyer after payment completion
    if (transaction.coinReward > 0) {
      const buyer = await User.findById(transaction.buyer);
      if (buyer) {
        buyer.coinBalance += transaction.coinReward;
        await buyer.save();
        
        await CoinTransaction.create({
          user: transaction.buyer,
          type: 'earned',
          amount: transaction.coinReward,
          description: `Earned coins from purchasing: ${transaction.item}`,
          relatedTransaction: transaction._id,
          balanceAfter: buyer.coinBalance
        });
      }
    }
    
    // Notify seller about payment completion
    await Notification.create({
      recipient: transaction.seller,
      sender: req.user.id,
      type: 'deal_accepted',
      title: 'Payment Completed',
      message: `Payment for "${transaction.item}" has been completed. The item is now sold!`,
      relatedItem: transaction.item,
      relatedTransaction: transaction._id
    });
    
    // Mark notification as read
    notification.isRead = true;
    await notification.save();
    
    res.json({ 
      success: true, 
      message: 'Payment completed successfully. Coins have been awarded!' 
    });
    
  } catch (error) {
    console.error('Error completing payment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 