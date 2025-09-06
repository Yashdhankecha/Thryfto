import axios from 'axios';
import toast from 'react-hot-toast';

// Create axios instance
const api = axios.create({
  baseURL: 'http://localhost:5000/api/auth',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

console.log('API Configuration:', {
  baseURL: 'http://localhost:5000/api/auth',
  env: import.meta.env.VITE_API_URL,
  actualBaseURL: api.defaults.baseURL
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token to requests
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const message = error.response?.data?.message || 'An error occurred';
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      
      // Only show toast if it's not a login attempt
      if (!error.config.url.includes('/login')) {
        toast.error('Session expired. Please login again.');
        window.location.href = '/login';
      }
    } else if (error.response?.status === 403) {
      toast.error('Access denied. Insufficient permissions.');
    } else if (error.response?.status === 429) {
      toast.error('Too many requests. Please try again later.');
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    }
    
    return Promise.reject(error);
  }
);

// Auth API functions
export const authAPI = {
  // Signup
  signup: async (userData) => {
    const response = await api.post('/signup', userData);
    return response.data;
  },

  // Login
  login: async (credentials) => {
    const response = await api.post('/login', credentials);
    return response.data;
  },

  // Verify email
  verifyEmail: async (data) => {
    const response = await api.post('/verify-email', data);
    return response.data;
  },

  // Resend OTP
  resendOTP: async (email) => {
    const response = await api.post('/resend-otp', { email });
    return response.data;
  },

  // Forgot password
  forgotPassword: async (email) => {
    const response = await api.post('/forgot-password', { email });
    return response.data;
  },

  // Reset password
  resetPassword: async (data) => {
    const response = await api.post('/reset-password', data);
    return response.data;
  },

  // Get profile
  getProfile: async () => {
    const response = await api.get('/profile');
    return response.data;
  },

  // Update profile
  updateProfile: async (profileData) => {
    const response = await api.put('/profile', profileData);
    return response.data;
  },

  // Logout
  logout: async () => {
    const response = await api.post('/logout');
    return response.data;
  },

  // Owner: Get platform statistics
  getPlatformStats: async () => {
    const response = await api.get('/platform-stats');
    return response.data;
  },

  // Owner: Get detailed analytics
  getOwnerAnalytics: async () => {
    const response = await api.get('/owner-analytics');
    return response.data;
  },

  // Owner: Get analytics by custom date range
  getAnalyticsByDateRange: async (from, to) => {
    const response = await api.get(`/owner-analytics/date-range?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
    return response.data;
  },

  // Owner: Get retention/churn analytics
  getRetentionAnalytics: async () => {
    const response = await api.get('/owner-analytics/retention');
    return response.data;
  },

  // Owner: Get cohort analysis
  getCohortAnalytics: async () => {
    const response = await api.get('/owner-analytics/cohort');
    return response.data;
  },

  // Owner: Get funnel analysis
  getFunnelAnalytics: async () => {
    const response = await api.get('/owner-analytics/funnel');
    return response.data;
  },

  // Owner: Get all platform transactions
  getOwnerTransactions: async () => {
    const response = await api.get('/owner-transactions');
    return response.data;
  },

  // Owner: Get platform revenue/fees
  getOwnerRevenue: async () => {
    const response = await api.get('/owner-revenue');
    return response.data;
  },

  // Owner: Get platform payouts
  getOwnerPayouts: async () => {
    const response = await api.get('/owner-payouts');
    return response.data;
  },

  // Owner: Get platform refunds/disputes
  getOwnerRefunds: async () => {
    const response = await api.get('/owner-refunds');
    return response.data;
  },

  // Owner: Get audit logs
  getOwnerAuditLogs: async () => {
    const response = await api.get('/owner-audit-logs');
    return response.data;
  }
};

// Dashboard API functions
export const dashboardAPI = {
  // Get user's listed products
  getUserListedProducts: async (page = 1, limit = 10) => {
    const response = await axios.get(`http://localhost:5000/api/dashboard/user/listed?page=${page}&limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  },

  // Get user's bought products
  getUserBoughtProducts: async (page = 1, limit = 10) => {
    const response = await axios.get(`http://localhost:5000/api/dashboard/user/bought?page=${page}&limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  }
};

// User management API functions
export const userAPI = {
  // Get all users (admin only)
  getAllUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },
  // Update user role (admin only)
  updateUserRole: async (userId, role) => {
    const response = await api.put(`/user/${userId}/role`, { role });
    return response.data;
  }
};

// Utility functions
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('token', token);
  } else {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
  }
};

export const getAuthToken = () => {
  return localStorage.getItem('token');
};

export const isAuthenticated = () => {
  const token = getAuthToken();
  if (!token) return false;
  
  try {
    // Check if token is expired (basic check)
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp > currentTime;
  } catch (error) {
    return false;
  }
};

export default api;
