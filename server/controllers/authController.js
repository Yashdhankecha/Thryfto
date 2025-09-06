const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const emailService = require('../utils/emailService');
const Item = require('../models/Item');
const Transaction = require('../models/Transaction');
const CoinTransaction = require('../models/CoinTransaction');
const RedemptionCoupon = require('../models/RedemptionCoupon');
const Notification = require('../models/Notification');
const CommunityThought = require('../models/CommunityThought');
const AuditLog = require('../models/AuditLog');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @desc    Register user
// @route   POST /api/auth/signup
// @access  Public
const signup = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, password } = req.body;

    // Use development database if available
    if (global.devDb) {
      try {
        // Check if user already exists
        const existingUser = await global.devDb.findUserByEmail(email);
        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: 'User already exists with this email'
          });
        }

        // Create user
        const result = await global.devDb.createUser({ name, email, password });
        
        // Generate OTP for development
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Update user with OTP
        await global.devDb.updateUser(result.userId, {
          otpCode: otp,
          otpExpires: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes
        });

        console.log('=== DEVELOPMENT MODE ===');
        console.log('OTP for email verification:', otp);
        console.log('Email:', email);
        console.log('=== END DEVELOPMENT MODE ===');

        res.status(201).json({
          success: true,
          message: 'User registered successfully. Please check your email for OTP verification.',
          data: {
            userId: result.userId,
            email: email,
            name: name
          }
        });
        return;
      } catch (error) {
        console.error('Development database error:', error);
        return res.status(500).json({
          success: false,
          message: error.message || 'Server error during registration'
        });
      }
    }

    // MongoDB flow (original code)
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password
    });

    // Generate OTP
    const otp = user.generateOTP();
    await user.save();

    // Send OTP email
    try {
      await emailService.sendOTPEmail(email, otp, 'verification');
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError);
      
      // For development, if email is not configured, just log the OTP
      if (process.env.NODE_ENV === 'development') {
        console.log('=== DEVELOPMENT MODE ===');
        console.log('OTP for email verification:', otp);
        console.log('Email:', email);
        console.log('=== END DEVELOPMENT MODE ===');
      } else {
        // Delete user if email fails in production
        await User.findByIdAndDelete(user._id);
        return res.status(500).json({
          success: false,
          message: 'Failed to send verification email. Please try again.'
        });
      }
    }

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email for OTP verification.',
      data: {
        userId: user._id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

// @desc    Verify email with OTP
// @route   POST /api/auth/verify-email
// @access  Public
const verifyEmail = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, otp } = req.body;

    // Use development database if available
    if (global.devDb) {
      try {
        // Find user
        const user = await global.devDb.findUserByEmail(email);
        if (!user) {
          return res.status(404).json({
            success: false,
            message: 'User not found'
          });
        }

        // Check if already verified
        if (user.isEmailVerified) {
          return res.status(400).json({
            success: false,
            message: 'Email is already verified'
          });
        }

        // Check OTP attempts
        if (user.otpAttempts >= 5) {
          return res.status(429).json({
            success: false,
            message: 'Too many failed attempts. Please request a new OTP.'
          });
        }

        // Verify OTP
        if (!user.otpCode || user.otpCode !== otp || new Date(user.otpExpires) < new Date()) {
          await global.devDb.updateUser(user.id, {
            otpAttempts: user.otpAttempts + 1
          });
          
          return res.status(400).json({
            success: false,
            message: 'Invalid or expired OTP',
            attemptsLeft: 5 - (user.otpAttempts + 1)
          });
        }

        // Mark email as verified and clear OTP
        await global.devDb.updateUser(user.id, {
          isEmailVerified: 1,
          otpCode: null,
          otpExpires: null,
          otpAttempts: 0
        });

        // Generate token
        const token = global.devDb.generateToken(user.id);

        res.status(200).json({
          success: true,
          message: 'Email verified successfully',
          data: {
            token,
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              isEmailVerified: 1,
              role: user.role
            }
          }
        });
        return;
      } catch (error) {
        console.error('Development database verification error:', error);
        return res.status(500).json({
          success: false,
          message: 'Server error during email verification'
        });
      }
    }

    // MongoDB flow (original code)
    // Find user
    const user = await User.findOne({ email }).select('+otpCode +otpExpires +otpAttempts');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if already verified
    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    // Check OTP attempts
    if (user.otpAttempts >= 5) {
      return res.status(429).json({
        success: false,
        message: 'Too many failed attempts. Please request a new OTP.'
      });
    }

    // Verify OTP
    if (!user.verifyOTP(otp)) {
      user.otpAttempts += 1;
      await user.save();
      
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP',
        attemptsLeft: 5 - user.otpAttempts
      });
    }

    // Mark email as verified and clear OTP
    user.isEmailVerified = true;
    user.clearOTP();
    await user.save();

    // Send welcome email
    try {
      await emailService.sendWelcomeEmail(user.email, user.name);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail the verification if welcome email fails
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isEmailVerified: user.isEmailVerified,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during email verification'
    });
  }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
const resendOTP = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email } = req.body;

    const user = await User.findOne({ email }).select('+lastOtpRequest');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    // Check rate limiting (1 minute between requests)
    if (user.lastOtpRequest && Date.now() - user.lastOtpRequest < 60000) {
      return res.status(429).json({
        success: false,
        message: 'Please wait 1 minute before requesting another OTP'
      });
    }

    // Generate new OTP
    const otp = user.generateOTP();
    user.otpAttempts = 0; // Reset attempts
    await user.save();

    // Send OTP email
    await emailService.sendOTPEmail(email, otp, 'verification');

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully to your email'
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP. Please try again.'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Use development database if available
    if (global.devDb) {
      try {
        // Find user
        const user = await global.devDb.findUserByEmail(email);
        console.log('Dev DB - Found user:', user ? { id: user.id, email: user.email, isVerified: user.isEmailVerified } : 'Not found');
        
        if (!user) {
          return res.status(401).json({
            success: false,
            message: 'Invalid credentials'
          });
        }

        // Check if email is verified
        if (!user.isEmailVerified) {
          return res.status(401).json({
            success: false,
            message: 'Please verify your email before logging in'
          });
        }

        // Verify password
        const isPasswordValid = await global.devDb.verifyPassword(user, password);
        console.log('Dev DB - Password verification:', { providedPassword: password, isValid: isPasswordValid });
        
        if (!isPasswordValid) {
          return res.status(401).json({
            success: false,
            message: 'Invalid credentials'
          });
        }

        // Update last login
        await global.devDb.updateUser(user.id, {
          lastLogin: new Date().toISOString()
        });

        // Generate token
        const token = global.devDb.generateToken(user.id);

        res.status(200).json({
          success: true,
          message: 'Login successful',
          data: {
            token,
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              isEmailVerified: user.isEmailVerified,
              role: user.role
            }
          }
        });
        return;
      } catch (error) {
        console.error('Development database login error:', error);
        return res.status(500).json({
          success: false,
          message: 'Server error during login'
        });
      }
    }

    // MongoDB flow (original code)
    // Find user and include password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(401).json({
        success: false,
        message: 'Please verify your email before logging in'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isEmailVerified: user.isEmailVerified,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email } = req.body;

    const user = await User.findOne({ email }).select('+lastOtpRequest');
    if (!user) {
      // Don't reveal if user exists or not for security
      return res.status(200).json({
        success: true,
        message: 'If an account with that email exists, we have sent a password reset OTP'
      });
    }

    if (!user.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
    }

    // Check rate limiting (1 minute between requests)
    if (user.lastOtpRequest && Date.now() - user.lastOtpRequest < 60000) {
      return res.status(429).json({
        success: false,
        message: 'Please wait 1 minute before requesting another OTP'
      });
    }

    // Generate OTP for password reset
    const otp = user.generateOTP();
    await user.save();

    // Send password reset OTP email
    try {
      await emailService.sendOTPEmail(email, otp, 'reset');
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Failed to send password reset email. Please try again.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Password reset OTP sent to your email'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password reset request'
    });
  }
};

// @desc    Reset password with OTP
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, otp, newPassword } = req.body;

    // Find user
    const user = await User.findOne({ email }).select('+otpCode +otpExpires +otpAttempts');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check OTP attempts
    if (user.otpAttempts >= 5) {
      return res.status(429).json({
        success: false,
        message: 'Too many failed attempts. Please request a new OTP.'
      });
    }

    // Verify OTP
    if (!user.verifyOTP(otp)) {
      user.otpAttempts += 1;
      await user.save();

      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP',
        attemptsLeft: 5 - user.otpAttempts
      });
    }

    // Update password and clear OTP
    user.password = newPassword;
    user.clearOTP();
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully. Please login with your new password.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password reset'
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isEmailVerified: user.isEmailVerified,
          role: user.role,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile'
    });
  }
};

// @desc    Update current user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email } = req.body;
    const userId = req.user.id;

    // Check if email is being changed and if it's already taken
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email is already taken by another user'
        });
      }
    }

    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        name: name || undefined,
        email: email || undefined
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          isEmailVerified: updatedUser.isEmailVerified,
          role: updatedUser.role,
          lastLogin: updatedUser.lastLogin,
          createdAt: updatedUser.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile'
    });
  }
};

// @desc    Logout user (client-side token removal)
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout'
    });
  }
};

// @desc    Update user role (admin only)
// @route   PUT /api/auth/user/:id/role
// @access  Admin
const updateUserRole = async (req, res) => {
  try {
    // Only admins can update roles
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admins only.'
      });
    }

    const { id } = req.params;
    const { role } = req.body;
    const allowedRoles = ['user', 'admin', 'owner'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role.'
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    user.role = role;
    await user.save();

    res.json({
      success: true,
      message: `User role updated to ${role}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating user role.'
    });
  }
};

// @desc    Get all users (admin only)
// @route   GET /api/auth/users
// @access  Admin
const getAllUsers = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admins only.'
      });
    }
    const users = await User.find({}, 'name email role isActive createdAt').lean();
    const formatted = users.map(u => ({
      id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      status: u.isActive ? 'Active' : 'Suspended',
      createdAt: u.createdAt
    }));
    res.json({ success: true, users: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching users.' });
  }
};

// @desc    Get platform statistics (owner only)
// @route   GET /api/auth/platform-stats
// @access  Owner
const getPlatformStats = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'owner') {
      return res.status(403).json({ success: false, message: 'Access denied. Owners only.' });
    }
    // User stats
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const adminCount = await User.countDocuments({ role: 'admin' });
    const ownerCount = await User.countDocuments({ role: 'owner' });
    // Item stats
    const totalItems = await Item.countDocuments();
    const pendingItems = await Item.countDocuments({ status: 'pending' });
    const approvedItems = await Item.countDocuments({ status: 'approved' });
    const swappedItems = await Item.countDocuments({ status: 'swapped' });
    // Transaction stats
    const totalTransactions = await Transaction.countDocuments();
    const completedTransactions = await Transaction.countDocuments({ status: 'completed' });
    // Coin stats
    const totalCoins = await User.aggregate([{ $group: { _id: null, total: { $sum: '$coinBalance' } } }]);
    // Coupon stats
    const totalCoupons = await RedemptionCoupon.countDocuments();
    const activeCoupons = await RedemptionCoupon.countDocuments({ isActive: true });
    // Notification stats
    const totalNotifications = await Notification.countDocuments();
    // Community
    const totalCommunityPosts = await CommunityThought.countDocuments();
    // Compose summary
    const summary = {
      users: { total: totalUsers, active: activeUsers, admins: adminCount, owners: ownerCount },
      items: { total: totalItems, pending: pendingItems, approved: approvedItems, swapped: swappedItems },
      transactions: { total: totalTransactions, completed: completedTransactions },
      coins: { total: totalCoins[0]?.total || 0 },
      coupons: { total: totalCoupons, active: activeCoupons },
      notifications: { total: totalNotifications },
      community: { totalPosts: totalCommunityPosts }
    };
    res.json({ success: true, summary });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching platform stats.' });
  }
};

// @desc    Get detailed owner analytics (owner only)
// @route   GET /api/auth/owner-analytics
// @access  Owner
const getOwnerAnalytics = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'owner') {
      return res.status(403).json({ success: false, message: 'Access denied. Owners only.' });
    }
    // User growth by month (last 12 months)
    const userGrowth = await User.aggregate([
      { $match: {} },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
        count: { $sum: 1 }
      } },
      { $sort: { _id: 1 } }
    ]);
    // Active vs inactive
    const activeUsers = await User.countDocuments({ isActive: true });
    const inactiveUsers = await User.countDocuments({ isActive: false });
    // Email verified
    const emailVerified = await User.countDocuments({ isEmailVerified: true });
    const emailNotVerified = await User.countDocuments({ isEmailVerified: false });
    // Items by category
    const itemsByCategory = await Item.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    // Items added by month (last 12 months)
    const itemsByMonth = await Item.aggregate([
      { $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
        count: { $sum: 1 }
      } },
      { $sort: { _id: 1 } }
    ]);
    // Top brands
    const topBrands = await Item.aggregate([
      { $group: { _id: '$brand', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    // Transactions by month (last 12 months)
    const transactionsByMonth = await Transaction.aggregate([
      { $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
        count: { $sum: 1 },
        avgValue: { $avg: '$offerAmount' }
      } },
      { $sort: { _id: 1 } }
    ]);
    // Top buyers
    const topBuyers = await Transaction.aggregate([
      { $group: { _id: '$buyer', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    // Top sellers
    const topSellers = await Transaction.aggregate([
      { $group: { _id: '$seller', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    // Coins earned/redeemed by month (last 12 months)
    const coinsByMonth = await CoinTransaction.aggregate([
      { $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
        earned: { $sum: { $cond: [{ $eq: ['$type', 'earned'] }, '$amount', 0] } },
        redeemed: { $sum: { $cond: [{ $eq: ['$type', 'redeemed'] }, '$amount', 0] } }
      } },
      { $sort: { _id: 1 } }
    ]);
    res.json({
      success: true,
      analytics: {
        userGrowth,
        activeUsers,
        inactiveUsers,
        emailVerified,
        emailNotVerified,
        itemsByCategory,
        itemsByMonth,
        topBrands,
        transactionsByMonth,
        topBuyers,
        topSellers,
        coinsByMonth
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching owner analytics.' });
  }
};

// @desc    Get analytics by custom date range (owner only)
// @route   GET /api/auth/owner-analytics/date-range
// @access  Owner
const getAnalyticsByDateRange = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'owner') {
      return res.status(403).json({ success: false, message: 'Access denied. Owners only.' });
    }
    const { from, to } = req.query;
    if (!from || !to) {
      return res.status(400).json({ success: false, message: 'Missing from/to date.' });
    }
    const start = new Date(from);
    const end = new Date(to);
    // Example: Transactions per day in range
    const data = await Transaction.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
        totalAmount: { $sum: '$offerAmount' }
      } },
      { $sort: { _id: 1 } }
    ]);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching date range analytics.' });
  }
};

// @desc    Get retention/churn analytics (owner only)
// @route   GET /api/auth/owner-analytics/retention
// @access  Owner
const getRetentionAnalytics = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'owner') {
      return res.status(403).json({ success: false, message: 'Access denied. Owners only.' });
    }
    // Retention: users who logged in in the last 10 days, churn: users who did not
    const days = 10;
    const today = new Date();
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const day = new Date(today);
      day.setDate(today.getDate() - i);
      const nextDay = new Date(day);
      nextDay.setDate(day.getDate() + 1);
      const retained = await User.countDocuments({ lastLogin: { $gte: day, $lt: nextDay } });
      const churned = await User.countDocuments({ lastLogin: { $lt: day } });
      data.push({ date: day.toISOString().slice(0, 10), retained, churned });
    }
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching retention analytics.' });
  }
};

// @desc    Get cohort analysis (owner only)
// @route   GET /api/auth/owner-analytics/cohort
// @access  Owner
const getCohortAnalytics = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'owner') {
      return res.status(403).json({ success: false, message: 'Access denied. Owners only.' });
    }
    // Cohort: users grouped by signup month, retention = % logged in last 30 days
    const cohorts = await User.aggregate([
      { $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
        users: { $push: '$_id' },
        count: { $sum: 1 }
      } },
      { $sort: { _id: 1 } }
    ]);
    const now = new Date();
    const last30 = new Date(now);
    last30.setDate(now.getDate() - 30);
    const data = await Promise.all(cohorts.map(async cohort => {
      const retained = await User.countDocuments({ _id: { $in: cohort.users }, lastLogin: { $gte: last30 } });
      return {
        cohort: cohort._id,
        retention: cohort.count ? Math.round((retained / cohort.count) * 100) : 0
      };
    }));
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching cohort analytics.' });
  }
};

// @desc    Get funnel analysis (owner only)
// @route   GET /api/auth/owner-analytics/funnel
// @access  Owner
const getFunnelAnalytics = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'owner') {
      return res.status(403).json({ success: false, message: 'Access denied. Owners only.' });
    }
    // Funnel: Visited (all users), Signed Up (users), Listed Item (users with items), Completed Transaction (users with completed sales)
    const visited = await User.countDocuments();
    const signedUp = visited;
    const listedItem = await Item.distinct('user');
    const completedTransaction = await Transaction.distinct('seller', { status: 'completed' });
    const data = [
      { stage: 'Visited', value: visited },
      { stage: 'Signed Up', value: signedUp },
      { stage: 'Listed Item', value: listedItem.length },
      { stage: 'Completed Transaction', value: completedTransaction.length }
    ];
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching funnel analytics.' });
  }
};

// @desc    Get owner audit logs (latest 50)
// @route   GET /api/auth/owner-audit-logs
// @access  Owner
const getOwnerAuditLogs = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'owner') {
      return res.status(403).json({ success: false, message: 'Access denied. Owners only.' });
    }
    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(50).populate('user', 'name');
    res.json({ success: true, logs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching audit logs.' });
  }
};

// @desc    Get all platform transactions (owner only)
// @route   GET /api/auth/owner-transactions
// @access  Owner
const getOwnerTransactions = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'owner') {
      return res.status(403).json({ success: false, message: 'Access denied. Owners only.' });
    }
    // Return all transactions, most recent first
    const transactions = await Transaction.find({})
      .populate('buyer', 'name email')
      .populate('seller', 'name email')
      .populate('item', 'title price brand')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json({ success: true, data: transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching transactions.' });
  }
};

// @desc    Get platform revenue/fees (owner only)
// @route   GET /api/auth/owner-revenue
// @access  Owner
const getOwnerRevenue = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'owner') {
      return res.status(403).json({ success: false, message: 'Access denied. Owners only.' });
    }
    // Revenue/fees by month for last 12 months
    const now = new Date();
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        start: new Date(d.getFullYear(), d.getMonth(), 1),
        end: new Date(d.getFullYear(), d.getMonth() + 1, 0),
        label: `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`
      });
    }
    const data = await Promise.all(months.map(async m => {
      const revenue = await Transaction.aggregate([
        { $match: { createdAt: { $gte: m.start, $lte: m.end }, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$offerAmount' } } }
      ]);
      // Example: 10% fee
      const fees = revenue[0] ? Math.round(revenue[0].total * 0.1) : 0;
      return {
        date: m.label,
        revenue: revenue[0]?.total || 0,
        fees
      };
    }));
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching revenue.' });
  }
};

// @desc    Get platform payouts (owner only)
// @route   GET /api/auth/owner-payouts
// @access  Owner
const getOwnerPayouts = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'owner') {
      return res.status(403).json({ success: false, message: 'Access denied. Owners only.' });
    }
    // Example: payouts = completed transactions grouped by seller
    const payouts = await Transaction.aggregate([
      { $match: { status: 'completed' } },
      { $group: {
        _id: '$seller',
        total: { $sum: '$offerAmount' },
        count: { $sum: 1 },
        lastPayout: { $max: '$createdAt' }
      } },
      { $sort: { total: -1 } },
      { $limit: 20 }
    ]);
    // Populate seller info
    const sellers = await User.find({ _id: { $in: payouts.map(p => p._id) } }, 'name email');
    const data = payouts.map(p => ({
      seller: sellers.find(s => s._id.equals(p._id)),
      amount: p.total,
      count: p.count,
      lastPayout: p.lastPayout
    }));
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching payouts.' });
  }
};

// @desc    Get platform refunds/disputes (owner only)
// @route   GET /api/auth/owner-refunds
// @access  Owner
const getOwnerRefunds = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'owner') {
      return res.status(403).json({ success: false, message: 'Access denied. Owners only.' });
    }
    // Example: refunds = transactions with status 'refunded' (if such status exists)
    const refunds = await Transaction.find({ status: 'refunded' })
      .populate('buyer', 'name email')
      .populate('seller', 'name email')
      .populate('item', 'title price brand')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ success: true, data: refunds });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching refunds.' });
  }
};

module.exports = {
  signup,
  verifyEmail,
  resendOTP,
  login,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
  logout,
  updateUserRole,
  getAllUsers,
  getPlatformStats,
  getOwnerAnalytics,
  getAnalyticsByDateRange,
  getRetentionAnalytics,
  getCohortAnalytics,
  getFunnelAnalytics,
  getOwnerAuditLogs,
  getOwnerTransactions,
  getOwnerRevenue,
  getOwnerPayouts,
  getOwnerRefunds
};
