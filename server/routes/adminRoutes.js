const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// Middleware to check if user is admin
const adminAuth = [protect, authorize('admin')];

// Get all items for admin approval
router.get('/items', adminAuth, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const filter = {};
    if (status) {
      filter.status = status;
    }
    
    const items = await Item.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Item.countDocuments(filter);
    
    res.json({
      success: true,
      items,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching items for admin:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

// Approve an item
router.put('/items/:id/approve', adminAuth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    item.status = 'approved';
    await item.save();
    
    res.json({
      success: true,
      message: 'Item approved successfully',
      item
    });
  } catch (error) {
    console.error('Error approving item:', error);
    res.status(500).json({ error: 'Failed to approve item' });
  }
});

// Reject an item
router.put('/items/:id/reject', adminAuth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    item.status = 'rejected';
    await item.save();
    
    res.json({
      success: true,
      message: 'Item rejected successfully',
      item
    });
  } catch (error) {
    console.error('Error rejecting item:', error);
    res.status(500).json({ error: 'Failed to reject item' });
  }
});

// Get all users for admin management
router.get('/users', adminAuth, async (req, res) => {
  try {
    const { role, status, page = 1, limit = 10, search } = req.query;
    
    const filter = {};
    if (role) filter.role = role;
    if (status) filter.isActive = status === 'Active';
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await User.countDocuments(filter);
    
    res.json({
      success: true,
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching users for admin:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Update user role
router.put('/users/:id/role', adminAuth, async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    user.role = role;
    await user.save();
    
    res.json({
      success: true,
      message: 'User role updated successfully',
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

// Ban/Unban user
router.put('/users/:id/status', adminAuth, async (req, res) => {
  try {
    const { isActive } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    user.isActive = isActive;
    await user.save();
    
    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'banned'} successfully`,
      user: { id: user._id, name: user.name, email: user.email, isActive: user.isActive }
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
});

// Get admin dashboard statistics
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalItems = await Item.countDocuments();
    const pendingItems = await Item.countDocuments({ status: 'pending' });
    const approvedItems = await Item.countDocuments({ status: 'approved' });
    const flaggedItems = await Item.countDocuments({ flagged: true });
    const activeUsers = await User.countDocuments({ isActive: true });
    
    // Recent items (last 5)
    const recentItems = await Item.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);
    
    // Recent users (last 5)
    const recentUsers = await User.find()
      .select('name email role isActive createdAt')
      .sort({ createdAt: -1 })
      .limit(5);
    
    res.json({
      success: true,
      stats: {
        totalUsers,
        totalItems,
        pendingItems,
        approvedItems,
        flaggedItems,
        activeUsers
      },
      recentItems,
      recentUsers
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Failed to fetch admin statistics' });
  }
});

module.exports = router;
