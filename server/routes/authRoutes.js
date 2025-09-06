const express = require('express');
const { body } = require('express-validator');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const {
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
  getOwnerRefunds,
  getOwnerTransactions,
  getOwnerRevenue,
  getOwnerPayouts
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const signupValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s\-'\.]+$/)
    .withMessage('Name can only contain letters, spaces, hyphens, apostrophes, and periods'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const emailValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address')
];

const otpValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('otp')
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('OTP must be a 6-digit number')
];

const resetPasswordValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('otp')
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('OTP must be a 6-digit number'),
  
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
];

const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s\-'\.]+$/)
    .withMessage('Name can only contain letters, spaces, hyphens, apostrophes, and periods'),
  
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address')
];

// Public routes
router.post('/signup', signupValidation, signup);
router.post('/login', loginValidation, login);
router.post('/verify-email', otpValidation, verifyEmail);
router.post('/resend-otp', emailValidation, resendOTP);
router.post('/forgot-password', emailValidation, forgotPassword);
router.post('/reset-password', resetPasswordValidation, resetPassword);

// Test route for debugging
router.get('/test-google-setup', (req, res) => {
  res.json({
    success: true,
    message: 'Google OAuth setup test',
    environment: {
      googleClientId: process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Not set',
      googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Not set',
      googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL || 'Using default',
      jwtSecret: process.env.JWT_SECRET ? 'Set' : 'Not set',
      clientUrl: process.env.CLIENT_URL || 'Using default'
    },
    routes: {
      googleAuth: '/api/auth/google',
      googleCallback: '/api/auth/google/callback'
    }
  });
});

// Google OAuth routes
router.get('/google', (req, res, next) => {
  console.log('🔍 Google OAuth route accessed');
  console.log('📋 Environment variables:');
  console.log('- GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Not set');
  console.log('- GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Not set');
  console.log('- GOOGLE_CALLBACK_URL:', process.env.GOOGLE_CALLBACK_URL || 'Using default');
  
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(500).json({
      success: false,
      message: 'Google OAuth not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your .env file.'
    });
  }
  
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

router.get('/google/callback', 
  (req, res, next) => {
    console.log('🔍 Google OAuth callback accessed');
    console.log('📋 Query params:', req.query);
    
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/login?error=google_oauth_not_configured`);
    }
    
    passport.authenticate('google', { session: false, failureRedirect: '/login' })(req, res, next);
  },
  (req, res) => {
    try {
      console.log('✅ Google OAuth successful, user:', req.user ? req.user.email : 'No user');
      
      const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d'
      });
      
      console.log('🎫 JWT token generated');
      
      // Redirect to frontend with token
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173'; // Default to Vite port
      const redirectUrl = `${clientUrl}/auth/google-callback?token=${token}`;
      console.log('🔄 Redirecting to:', redirectUrl);
      
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('❌ Google OAuth callback error:', error);
      res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/login?error=google_auth_failed`);
    }
  }
);

// Protected routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfileValidation, updateProfile);
router.post('/logout', protect, logout);

// Admin: Update user role
router.put('/user/:id/role', protect, authorize('admin'), updateUserRole);

// Admin: Get all users
router.get('/users', protect, authorize('admin'), getAllUsers);

// Owner: Get platform statistics
router.get('/platform-stats', protect, authorize('owner'), getPlatformStats);

// Owner: Get detailed analytics
router.get('/owner-analytics', protect, authorize('owner'), getOwnerAnalytics);

// Owner: Get analytics by custom date range
router.get('/owner-analytics/date-range', protect, authorize('owner'), getAnalyticsByDateRange);
// Owner: Get retention/churn analytics
router.get('/owner-analytics/retention', protect, authorize('owner'), getRetentionAnalytics);
// Owner: Get cohort analysis
router.get('/owner-analytics/cohort', protect, authorize('owner'), getCohortAnalytics);
// Owner: Get funnel analysis
router.get('/owner-analytics/funnel', protect, authorize('owner'), getFunnelAnalytics);

// Owner: Get audit logs
router.get('/owner-audit-logs', protect, authorize('owner'), getOwnerAuditLogs);

// Owner: Get all platform transactions
router.get('/owner-transactions', protect, authorize('owner'), getOwnerTransactions);
// Owner: Get platform revenue/fees
router.get('/owner-revenue', protect, authorize('owner'), getOwnerRevenue);
// Owner: Get platform payouts
router.get('/owner-payouts', protect, authorize('owner'), getOwnerPayouts);
// Owner: Get platform refunds/disputes
router.get('/owner-refunds', protect, authorize('owner'), getOwnerRefunds);

// DEV ONLY: Insert dummy users and list all users
if (process.env.NODE_ENV === 'development') {
  const DevDatabase = require('../dev-db');
  router.post('/dev/seed', async (req, res) => {
    try {
      const users = [
        { name: 'Alice Example', email: 'alice@example.com', password: 'Alice123' },
        { name: 'Bob Example', email: 'bob@example.com', password: 'Bob12345' },
        { name: 'Charlie Example', email: 'charlie@example.com', password: 'Charlie123' }
      ];
      const results = [];
      for (const user of users) {
        try {
          const result = await global.devDb.createUser(user);
          // Mark users as verified for development
          await global.devDb.updateUser(result.userId, {
            isEmailVerified: 1
          });
          results.push({ ...user, id: result.userId, verified: true });
        } catch (e) {
          results.push({ ...user, error: e.message });
        }
      }
      res.json({ success: true, users: results });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  router.get('/dev/users', (req, res) => {
    try {
      const stmt = global.devDb.db.prepare('SELECT id, name, email, isEmailVerified, role, createdAt FROM users');
      const users = stmt.all();
      res.json({ success: true, users });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Get OTP for a user (dev only)
  router.get('/dev/otp/:email', (req, res) => {
    try {
      const { email } = req.params;
      const stmt = global.devDb.db.prepare('SELECT id, name, email, otpCode, otpExpires, isEmailVerified FROM users WHERE email = ?');
      const user = stmt.get(email);
      
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      
      res.json({ 
        success: true, 
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          otpCode: user.otpCode,
          otpExpires: user.otpExpires,
          isEmailVerified: user.isEmailVerified
        }
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });
}

module.exports = router;
