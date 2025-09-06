# 🔐 MERN Stack Authentication System

A complete, production-ready authentication system built with the MERN stack (MongoDB, Express.js, React.js, Node.js) featuring modern UI design and comprehensive security features.

## ✨ Features

### 🔐 Authentication
- **User Registration** with email verification (OTP)
- **User Login** with email/password
- **Google OAuth** integration for seamless sign-in
- **JWT-based authentication** with secure token storage
- **Password reset** via email with secure tokens

### 🛡️ Security
- **Bcrypt password hashing** with salt rounds
- **Email verification** required for account activation
- **Secure password reset** with time-limited tokens
- **Protected routes** with authentication middleware
- **Input validation** and sanitization

### 📧 Email Services
- **OTP verification emails** for new registrations
- **Password reset emails** with secure links
- **Professional email templates** with responsive design
- **Nodemailer integration** for reliable delivery

### 🎨 Modern UI/UX
- **Responsive design** with TailwindCSS
- **Professional components** with smooth animations
- **Toast notifications** for user feedback
- **Form validation** with real-time error handling
- **Loading states** and disabled states

### 🚀 Technical Features
- **Concurrent development** with hot reloading
- **API interceptors** for automatic token handling
- **Error handling** with user-friendly messages
- **Route protection** with automatic redirects
- **State management** with React Context

## 🏗️ Project Structure

```
CGC/
├── client/                 # React frontend
│   ├── public/            # Static files
│   ├── src/               # Source code
│   │   ├── components/    # Reusable components
│   │   ├── contexts/      # React contexts
│   │   ├── pages/         # Page components
│   │   ├── utils/         # Utility functions
│   │   ├── App.js         # Main app component
│   │   └── index.js       # Entry point
│   ├── package.json       # Frontend dependencies
│   └── tailwind.config.js # TailwindCSS configuration
├── server/                 # Express backend
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── utils/             # Utility functions
│   ├── server.js          # Main server file
│   ├── package.json       # Backend dependencies
│   └── env.example        # Environment variables template
├── package.json            # Root package.json with scripts
└── README.md              # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Gmail account for email services
- Google OAuth credentials

### 1. Clone and Install
```bash
# Clone the repository
git clone <your-repo-url>
cd CGC

# Install all dependencies (root, server, and client)
npm run install:all
```

### 2. Environment Setup

#### Server Environment
```bash
cd server
cp env.example .env
```

Edit `.env` with your configuration:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/mern-auth

# JWT Secret (generate a strong random string)
JWT_SECRET=your-super-secret-jwt-key-here

# Google OAuth (get from Google Cloud Console)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email Configuration (Gmail with App Password)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com

# Frontend URL
CLIENT_URL=http://localhost:3000
```

#### Client Environment
```bash
cd client
```

Create `.env` file:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
```

### 3. Start Development Servers
```bash
# From root directory
npm run dev

# This will start both server (port 5000) and client (port 3000)
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health

## 🔧 Configuration

### MongoDB Setup
1. Install MongoDB locally or use MongoDB Atlas
2. Create a database named `mern-auth`
3. Update `MONGODB_URI` in your `.env` file

### Gmail Setup (for email services)
1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password
3. Use the App Password in `EMAIL_PASS`

### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized origins: `http://localhost:3000`
6. Add authorized redirect URIs: `http://localhost:3000`

## 📱 Available Scripts

### Root Directory
```bash
npm run start          # Start production servers
npm run dev            # Start development servers
npm run install:all    # Install all dependencies
npm run build          # Build client for production
```

### Server Directory
```bash
npm run start          # Start production server
npm run dev            # Start development server with nodemon
```

### Client Directory
```bash
npm run start          # Start React development server
npm run build          # Build for production
npm run test           # Run tests
```

## 🗄️ API Endpoints

### Authentication Routes (`/api/auth`)
- `POST /register` - User registration
- `POST /verify-otp` - Email verification
- `POST /login` - User login
- `POST /google` - Google OAuth
- `POST /forgot-password` - Send reset email
- `POST /reset-password` - Reset password
- `POST /logout` - User logout
- `GET /me` - Get current user

### User Routes (`/api/user`)
- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile
- `PUT /change-password` - Change password
- `DELETE /account` - Delete account

## 🎨 UI Components

### Pages
- **Home** - Landing page with features showcase
- **Login** - Authentication form with Google OAuth
- **Register** - User registration with validation
- **VerifyOTP** - Email verification interface
- **ForgotPassword** - Password reset request
- **ResetPassword** - New password setup
- **Profile** - User profile management

### Components
- **Navbar** - Responsive navigation with auth states
- **PrivateRoute** - Route protection component
- **Toast** - User feedback notifications

## 🔒 Security Features

- **JWT Tokens** stored in HttpOnly cookies
- **Password Hashing** with bcrypt (12 salt rounds)
- **Email Verification** required for account activation
- **Rate Limiting** on sensitive endpoints
- **Input Validation** with express-validator
- **CORS Configuration** for secure cross-origin requests
- **Environment Variables** for sensitive data

## 🚀 Deployment

### Production Build
```bash
# Build client
cd client
npm run build

# Start production server
cd ../server
npm start
```

### Environment Variables
Ensure all production environment variables are set:
- Strong JWT secret
- Production MongoDB URI
- Production email credentials
- Production Google OAuth credentials
- Production client URL

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:
1. Check the console for error messages
2. Verify environment variables are set correctly
3. Ensure MongoDB is running
4. Check email credentials and Google OAuth setup

## 🔮 Future Enhancements

- [ ] Two-factor authentication (2FA)
- [ ] Social media login (Facebook, Twitter)
- [ ] Role-based access control
- [ ] User activity logging
- [ ] Advanced profile customization
- [ ] File upload for profile pictures
- [ ] Email templates customization
- [ ] Multi-language support

---

**Built with ❤️ using the MERN Stack**
