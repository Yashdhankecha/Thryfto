# Google OAuth Setup Guide

This guide will help you set up Google OAuth authentication for your ReWear application.

## Prerequisites

1. A Google account
2. Access to Google Cloud Console

## Step 1: Create Google OAuth Credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:5000/api/auth/google/callback` (for development)
     - `https://yourdomain.com/api/auth/google/callback` (for production)

## Step 2: Configure Environment Variables

Create a `.env` file in the `server` directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/mern-auth-app

# Email Configuration (for production)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Client URL (for OAuth redirects)
CLIENT_URL=http://localhost:3000
```

Replace the following values:
- `your-google-client-id`: The Client ID from Google Cloud Console
- `your-google-client-secret`: The Client Secret from Google Cloud Console
- `your-super-secret-jwt-key-change-this-in-production`: A strong secret key for JWT tokens

## Step 3: Install Dependencies

Make sure you have the required dependencies installed:

```bash
cd server
npm install passport passport-google-oauth20
```

## Step 4: Test the Setup

1. Start the server:
   ```bash
   cd server
   npm run dev
   ```

2. Start the client:
   ```bash
   cd client
   npm run dev
   ```

3. Navigate to `http://localhost:3000/login`
4. Click the "Continue with Google" button
5. Complete the Google OAuth flow

## Features

### What's Included

1. **Google OAuth Integration**: Users can sign in with their Google account
2. **Account Linking**: If a user signs up with email/password and later uses Google with the same email, the accounts are linked
3. **Automatic Email Verification**: Google accounts are automatically verified
4. **Profile Information**: Google profile data (name, email, avatar) is stored
5. **JWT Token Generation**: Successful Google login generates a JWT token

### User Flow

1. User clicks "Continue with Google" button
2. User is redirected to Google OAuth consent screen
3. After authorization, user is redirected back to the application
4. A JWT token is generated and stored
5. User is redirected to the dashboard

### Database Schema Updates

The User model has been updated to include:
- `googleId`: Google's unique user ID
- `googleEmail`: Google email address
- `avatar`: User's profile picture URL
- Password is now optional (only required for non-Google users)

## Security Considerations

1. **Environment Variables**: Never commit your `.env` file to version control
2. **JWT Secret**: Use a strong, random secret for JWT tokens
3. **HTTPS**: Use HTTPS in production for secure OAuth redirects
4. **Client Secrets**: Keep your Google client secret secure

## Troubleshooting

### Common Issues

1. **"Invalid redirect URI"**: Make sure the redirect URI in Google Cloud Console matches exactly
2. **"Client ID not found"**: Verify your Google Client ID is correct
3. **"CORS errors"**: Ensure your client URL is properly configured
4. **"Token not found"**: Check that the JWT_SECRET is set correctly

### Development vs Production

- **Development**: Use `http://localhost:5000/api/auth/google/callback`
- **Production**: Use `https://yourdomain.com/api/auth/google/callback`

Remember to update the authorized redirect URIs in Google Cloud Console when deploying to production. 