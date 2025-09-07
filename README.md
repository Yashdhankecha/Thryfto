Team name: NextGen

Team members:
Desai karansinh: karansinhdesai04@gmail.com
Yash ketanbhai Dhankecha: ydhankecha@gmail.com
Harsh vyas: harshvyas4567harsh@gmail.com
shubham vaghani :
srvaghani22@gmail.com

Problem Statement:
ReWear - community clothing exchange






## 🌟 Features

### Core Functionality
- **User Authentication** - Secure login/signup with email verification
- **Google OAuth Integration** - Social login support
- **Item Management** - List, browse, and manage clothing items
- **Buy/Sell System** - Complete marketplace with offers and direct purchases
- **Transaction Tracking** - Real-time transaction status updates
- **Notifications** - Seller notifications for incoming requests
- **User Profiles** - Editable profiles with purchase history
- **Responsive Design** - Modern UI with dark theme support

### Advanced Features
- **AI Assistant** - Interactive AI chat on dashboard
- **Typewriter Effects** - Dynamic text animations
- **Image Upload** - Drag-and-drop image handling
- **Search & Filtering** - Advanced item discovery
- **Pagination** - Efficient data loading
- **Real-time Updates** - Live transaction status changes

### Business & Analytics
- **Admin Dashboard** - Complete admin panel for user and order management
- **Owner Dashboard** - Advanced analytics, financial reports, and audit logs
- **Role-based Access** - Admin, Owner, and User role management
- **Financial Reports** - Revenue tracking and business insights
- **Audit Logs** - Complete activity tracking and system monitoring

### Payment & Rewards
- **Razorpay Integration** - Secure payment processing
- **Coin System** - Reward-based points system for transactions
- **Redemption System** - Convert coins to discounts and benefits
- **Transaction History** - Complete payment and coin transaction tracking

### AI & Machine Learning
- **Price Prediction** - ML-powered resale price estimation
- **Smart Recommendations** - AI-driven item suggestions
- **Usage Level Analysis** - Automated condition assessment

### Community Features
- **Community Thoughts** - Social sharing and interaction platform
- **User Engagement** - Community-driven content and discussions
- **Social Features** - Connect with other sustainable fashion enthusiasts

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI framework
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first styling
- **Axios** - HTTP client
- **React Router** - Client-side routing
- **React Hot Toast** - Notifications
- **Framer Motion** - Advanced animations and transitions
- **Recharts** - Interactive charts and data visualization

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **Passport.js** - Authentication middleware
- **bcryptjs** - Password hashing
- **Nodemailer** - Email service

### Payment & Integration
- **Razorpay** - Payment gateway integration
- **Crypto** - Payment signature verification
- **File-saver** - File download utilities
- **XLSX** - Excel export functionality

### Machine Learning
- **Flask** - ML model serving framework
- **scikit-learn** - Machine learning library
- **Pandas** - Data manipulation
- **Joblib** - Model serialization
- **Ridge Regression** - Price prediction model

### Authentication
- **JWT Tokens** - Stateless authentication
- **Google OAuth 2.0** - Social login
- **Email Verification** - Account validation
- **Password Reset** - Secure recovery

## 📁 Project Structure

```
Thryfto/
├── client/                 # Frontend React app
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── Owner/      # Owner dashboard components
│   │   │   ├── Footer/     # Footer component
│   │   │   └── Navbar/     # Navigation component
│   │   ├── pages/         # Page components
│   │   │   ├── Admin/      # Admin dashboard pages
│   │   │   └── Owner/      # Owner dashboard pages
│   │   ├── context/       # React context providers
│   │   ├── services/      # API services
│   │   └── assets/        # Static assets
│   └── public/            # Public assets
├── server/                # Backend Node.js app
│   ├── config/           # Configuration files
│   │   ├── passport.js   # OAuth configuration
│   │   └── razorpay.js   # Payment configuration
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Custom middleware
│   ├── models/          # Database models
│   │   ├── User.js      # User model with roles
│   │   ├── Item.js      # Item listing model
│   │   ├── Transaction.js # Transaction model
│   │   ├── CoinTransaction.js # Coin system model
│   │   ├── Notification.js # Notification model
│   │   ├── AuditLog.js  # Audit logging model
│   │   └── CommunityThought.js # Community model
│   ├── routes/          # API routes
│   │   ├── authRoutes.js # Authentication
│   │   ├── dashboardRoutes.js # Main dashboard
│   │   ├── adminRoutes.js # Admin features
│   │   ├── coinRoutes.js # Coin system
│   │   ├── paymentRoutes.js # Payment processing
│   │   ├── communityRoutes.js # Community features
│   │   └── notificationRoutes.js # Notifications
│   └── utils/           # Utility functions
└── model_price/         # ML price prediction service
    ├── app.py           # Flask ML server
    ├── model.py         # Model training script
    ├── ridge_model.pkl  # Trained model
    ├── clothes_with_resale_price.csv # Training data
    └── templates/       # ML web interface
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- Python 3.8+ (for ML model)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd ReWear
```

2. **Install dependencies**
```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install

# Install ML model dependencies
cd ../model_price
pip install -r requirements.txt
# Or install manually:
# pip install flask pandas scikit-learn joblib
```

3. **Environment Setup**
```bash
# Copy environment template
cd ../server
cp env-template.txt .env
```

4. **Configure environment variables**
```bash
# Edit .env file with your configuration
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
FRONTEND_URL=http://localhost:5173
```

5. **Start the development servers**
```bash
# Start ML model server (from model_price directory)
python app.py

# Start backend server (from server directory)
npm run dev

# Start frontend server (from client directory)
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- ML Model API: http://localhost:5001

## 🔧 Configuration

### MongoDB Setup
1. Create a MongoDB database
2. Update `MONGODB_URI` in your `.env` file
3. The application will automatically create collections

### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:5000/api/auth/google/callback`
   - `http://localhost:5173/google-callback`
6. Update `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env`

### Email Configuration
1. Set up SMTP email service (Gmail, SendGrid, etc.)
2. Update `EMAIL_USER` and `EMAIL_PASS` in `.env`
3. Configure email templates in `server/utils/emailService.js`

### Razorpay Configuration
1. Create a Razorpay account at [razorpay.com](https://razorpay.com)
2. Get your API keys from the dashboard
3. Update `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in `.env`
4. Configure webhook URLs for payment verification

### ML Model Setup
1. Navigate to `model_price` directory
2. Install Python dependencies: `pip install flask pandas scikit-learn joblib`
3. The trained model (`ridge_model.pkl`) is already included
4. Start the Flask server: `python app.py`
5. The model will be available at `http://localhost:5001`

## 🧪 Testing

### Test Data Setup
Navigate to `/test` page to set up test data:

1. **Setup Test Data** - Creates basic users and items
2. **Add Transaction Data** - Creates buy/sell transactions
3. **Create Diverse Data** - Adds multiple users and complex scenarios
4. **Add Bought Products** - Creates purchased items for yashdhankecha8@gmail.com

### Test Accounts
- **Seller**: `yashdhankecha8@gmail.com` / `Test123!`
- **Buyer**: `testbuyer@example.com` / `Test123!`
- **Additional Users** (if diverse data created):
  - `sarah.johnson@example.com` / `Test123!`
  - `mike.chen@example.com` / `Test123!`
  - `emma.davis@example.com` / `Test123!`

### Testing Flow
1. Login as buyer → Browse items → Make offers/purchases
2. Login as seller → Check notifications → Accept/reject requests
3. Test different transaction statuses and user interactions

## 📚 API Documentation

### Authentication Endpoints
```
POST /api/auth/register          # User registration
POST /api/auth/login            # User login
POST /api/auth/logout           # User logout
GET  /api/auth/profile          # Get user profile
PUT  /api/auth/profile          # Update user profile
POST /api/auth/forgot-password  # Password reset request
POST /api/auth/reset-password   # Reset password
GET  /api/auth/verify-email     # Email verification
```

### Item Management
```
GET    /api/dashboard/items           # Browse items with filters
GET    /api/dashboard/items/:id       # Get single item
POST   /api/dashboard/items           # Create new item
PUT    /api/dashboard/items/:id       # Update item
DELETE /api/dashboard/items/:id       # Delete item
GET    /api/dashboard/my-listings     # User's listed items
GET    /api/dashboard/user/bought     # User's bought items
```

### Buy/Sell System
```
POST /api/dashboard/items/:id/buy     # Direct purchase
POST /api/dashboard/items/:id/offer   # Make offer
GET  /api/dashboard/seller/transactions # Seller notifications
GET  /api/dashboard/buyer/transactions  # Buyer transactions
PUT  /api/dashboard/transactions/:id/respond # Accept/reject
```

### Admin & Owner Endpoints
```
GET  /api/admin/dashboard           # Admin dashboard stats
GET  /api/admin/users              # Get all users
PUT  /api/admin/users/:id          # Update user role/status
GET  /api/admin/orders             # Get all orders
GET  /api/owner/analytics          # Owner analytics
GET  /api/owner/financial-reports  # Financial reports
GET  /api/owner/audit-logs         # Audit logs
```

### Coin System
```
GET  /api/coins/balance            # Get user coin balance
GET  /api/coins/transactions       # Get coin transaction history
POST /api/coins/transfer           # Transfer coins between users
POST /api/coins/redeem             # Redeem coins for rewards
```

### Payment Processing
```
POST /api/payments/create-order    # Create Razorpay order
POST /api/payments/verify-payment  # Verify payment signature
GET  /api/payments/history         # Payment history
```

### Community Features
```
GET  /api/community/thoughts       # Get community thoughts
POST /api/community/thoughts       # Post new thought
GET  /api/community/stats          # Community statistics
```

### ML Price Prediction
```
POST /predict                      # Predict resale price (Flask API)
GET  /                            # ML model web interface
```

### Test Endpoints
```
POST /api/dashboard/test/setup-buy-sell      # Setup test data
POST /api/dashboard/test/add-transaction-data # Add transactions
POST /api/dashboard/test/create-diverse-data  # Create diverse data
POST /api/dashboard/test/add-bought-products  # Add bought products
```

## 🎨 UI Components

### Pages
- **Dashboard** - AI assistant, featured items, quick actions
- **Browse Items** - Advanced filtering, search, pagination
- **Product Detail** - Image zoom, buy/offer options
- **Profile** - User details, listed/bought products
- **List Item** - Drag-drop image upload, form validation
- **Notifications** - Transaction management for sellers
- **Community** - Social features with dark theme
- **About** - Project information and mission

### Components
- **Navbar** - Responsive navigation with user menu
- **Footer** - Site links and information
- **Loading** - Animated loading states
- **ProtectedRoute** - Authentication guards

## 🔒 Security Features

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcrypt encryption
- **Input Validation** - Server-side validation
- **CORS Protection** - Cross-origin security
- **Rate Limiting** - API protection
- **Email Verification** - Account validation

## 📱 Responsive Design

- **Mobile First** - Optimized for mobile devices
- **Dark Theme** - Modern dark UI design
- **Smooth Animations** - CSS transitions and effects
- **Accessibility** - ARIA labels and keyboard navigation

## 🚀 Deployment

### Frontend Deployment (Vercel/Netlify)
```bash
cd client
npm run build
# Deploy dist/ folder
```

### Backend Deployment (Heroku/Railway)
```bash
cd server
# Set environment variables
npm start
```

### Environment Variables for Production
```bash
NODE_ENV=production
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_production_jwt_secret
FRONTEND_URL=https://your-frontend-domain.com
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Unsplash** - High-quality product images
- **Tailwind CSS** - Utility-first CSS framework
- **React Community** - Excellent documentation and tools
- **MongoDB** - Flexible NoSQL database

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation in `/docs` folder

---

**ReWear** - Making sustainable fashion accessible to everyone! 🌱👕
