import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

// Create axios instance for coin API calls
const coinAPI = axios.create({
  baseURL: 'http://localhost:5000/api/coins',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include auth token
coinAPI.interceptors.request.use(
  (config) => {
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

const howItWorks = [
  {
    icon: '🛍️',
    title: 'Shop & Swap',
    desc: 'Buy or swap items to earn coins with every transaction.'
  },
  {
    icon: '🪙',
    title: 'Earn Coins',
    desc: 'Get rewarded for sustainable choices and community engagement.'
  },
  {
    icon: '🎁',
    title: 'Redeem Rewards',
    desc: 'Exchange coins for exclusive discount coupons and offers.'
  }
];

const Redemption = () => {
  const { user, isAuthenticated } = useAuth();
  const [coinBalance, setCoinBalance] = useState(0);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [userCoupons, setUserCoupons] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [redeeming, setRedeeming] = useState(false);

  // Role-based redirect: only 'user' role allowed
  if (isAuthenticated && user?.role !== 'user') {
    if (user?.role === 'admin') {
      window.location.replace('/admin/dashboard');
      return null;
    }
    return null;
  }

  useEffect(() => {
    if (user) {
      fetchCoinData();
    }
  }, [user]);

  const fetchCoinData = async () => {
    try {
      setLoading(true);
      console.log('Fetching coin data...');
      console.log('User:', user);
      console.log('Token:', localStorage.getItem('token'));
      
      const [balanceRes, availableRes, userCouponsRes, transactionsRes] = await Promise.all([
        coinAPI.get('/balance'),
        coinAPI.get('/available-coupons'),
        coinAPI.get('/redemption-coupons'),
        coinAPI.get('/transactions')
      ]);

      console.log('Coin data responses:', {
        balance: balanceRes.data,
        available: availableRes.data,
        userCoupons: userCouponsRes.data,
        transactions: transactionsRes.data
      });

      setCoinBalance(balanceRes.data.coinBalance);
      setAvailableCoupons(availableRes.data.availableCoupons);
      setUserCoupons(userCouponsRes.data);
      setTransactions(transactionsRes.data);
    } catch (err) {
      console.error('Error fetching coin data:', err);
      console.error('Error response:', err.response?.data);
      setError(`Failed to load coin data: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeemCoupon = async (couponId) => {
    try {
      setRedeeming(true);
      const response = await coinAPI.post('/create-coupon', { couponId });
      
      // Update local state
      setCoinBalance(response.data.coinBalance);
      setUserCoupons(prev => [response.data.coupon, ...prev]);
      
      // Refresh available coupons
      const availableRes = await coinAPI.get('/available-coupons');
      setAvailableCoupons(availableRes.data.availableCoupons);
      
      // Refresh transaction history
      const transactionsRes = await coinAPI.get('/transactions');
      setTransactions(transactionsRes.data);
      
      toast.success('Coupon created successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create coupon');
    } finally {
      setRedeeming(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-screen overflow-x-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading coin data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-screen overflow-x-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900">
      {/* Subtle pattern overlay */}
      <div className="pointer-events-none absolute inset-0 z-0 opacity-20" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Ccircle cx=\'20\' cy=\'20\' r=\'1.5\' fill=\'%23fbbf24\'/%3E%3C/svg%3E")', backgroundRepeat: 'repeat'}}></div>
      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Hero Section */}
        <div className="flex flex-col items-center mb-16">
          <div className="relative mb-6">
            {/* Animated coin glow */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-40 h-40 rounded-full bg-gradient-to-br from-yellow-400/40 to-orange-400/30 blur-2xl animate-pulse"></div>
            </div>
            <div className="relative w-32 h-32 flex items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 shadow-2xl border-8 border-yellow-200/30">
              <span className="text-7xl">🪙</span>
            </div>
          </div>
          <h1 className="text-5xl font-extrabold text-white mb-2 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent drop-shadow-lg">Coin Rewards</h1>
          <p className="text-xl text-slate-200 max-w-2xl text-center mb-2">Earn coins for every sustainable swap or purchase. Redeem them for exclusive discounts and rewards. Fashion that gives back!</p>
        </div>

        {/* Coin Balance Card */}
        <div className="flex flex-col items-center mb-12">
          <div className="relative w-full max-w-md">
            <div className="absolute -inset-1 bg-gradient-to-br from-yellow-400/30 to-orange-400/20 rounded-3xl blur-xl"></div>
            <div className="relative bg-white/10 backdrop-blur-2xl border border-yellow-400/30 rounded-3xl p-8 shadow-xl flex flex-col items-center">
              <div className="flex items-center gap-4 mb-2">
                <span className="text-4xl">🪙</span>
                <span className="text-4xl font-bold text-yellow-300 drop-shadow">{coinBalance}</span>
              </div>
              <p className="text-yellow-200 text-lg font-medium tracking-wide">Coins Available</p>
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">How It Works</h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            {howItWorks.map((step, idx) => (
              <div key={step.title} className="flex flex-col items-center bg-white/10 backdrop-blur-xl border border-slate-400/20 rounded-2xl p-8 w-72 shadow-lg hover:scale-105 transition-transform duration-300">
                <div className="text-5xl mb-4">{step.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                <p className="text-slate-300 text-center">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Available Coupons */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8">Available Coupons</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {availableCoupons.map((coupon) => (
              <div
                key={coupon.id}
                className={`relative bg-gradient-to-br from-yellow-400/10 to-orange-400/10 backdrop-blur-xl border rounded-2xl p-6 shadow-lg transition-all duration-300 ${
                  coupon.canRedeem
                    ? 'border-green-400/40 hover:border-green-400/80 hover:scale-105'
                    : 'border-slate-500/30 opacity-60'
                }`}
              >
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-2xl">🎫</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2 mt-4">{coupon.title}</h3>
                <p className="text-slate-300 text-sm mb-4">{coupon.description}</p>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Min Purchase:</span>
                    <span className="text-white">₹{coupon.minPurchaseAmount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Coins Required:</span>
                    <span className="text-yellow-400 font-bold">{coupon.coinsRequired}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Valid For:</span>
                    <span className="text-white">{coupon.validFor} days</span>
                  </div>
                </div>
                <button
                  onClick={() => handleRedeemCoupon(coupon.id)}
                  disabled={!coupon.canRedeem || redeeming}
                  className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 mt-2 ${
                    coupon.canRedeem
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white hover:scale-105 shadow-md'
                      : 'bg-slate-600 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {redeeming ? 'Creating...' : coupon.canRedeem ? 'Redeem Now' : 'Insufficient Coins'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* User's Coupons */}
        {userCoupons.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-white mb-8">Your Coupons</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {userCoupons.map((coupon) => (
                <div
                  key={coupon._id}
                  className={`relative bg-gradient-to-br from-blue-400/10 to-purple-400/10 backdrop-blur-xl border rounded-2xl p-6 shadow-lg ${
                    coupon.usedAt ? 'border-red-400/30 opacity-60' : 'border-blue-400/40'
                  }`}
                >
                  <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-2xl">🎫</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 mt-4">{coupon.title}</h3>
                  <p className="text-slate-300 text-sm mb-4">{coupon.description}</p>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Discount:</span>
                      <span className="text-white">
                        {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Min Purchase:</span>
                      <span className="text-white">₹{coupon.minPurchaseAmount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Expires:</span>
                      <span className="text-white">
                        {new Date(coupon.expiresAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className={`px-4 py-2 rounded-lg text-sm font-semibold text-center mt-2 ${
                    coupon.usedAt
                      ? 'bg-red-500/20 text-red-300'
                      : 'bg-green-500/20 text-green-300'
                  }`}>
                    {coupon.usedAt ? 'Used' : 'Active'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Transaction History */}
        {transactions.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-white mb-8">Transaction History</h2>
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-lg">
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div
                    key={transaction._id}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-xl shadow-sm"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        transaction.type === 'earned' ? 'bg-green-500/20' : 'bg-red-500/20'
                      }`}>
                        <span className="text-lg">
                          {transaction.type === 'earned' ? '➕' : '➖'}
                        </span>
                      </div>
                      <div>
                        <p className="text-white font-medium">{transaction.description}</p>
                        <p className="text-slate-400 text-sm">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${
                        transaction.type === 'earned' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {transaction.type === 'earned' ? '+' : ''}{transaction.amount} coins
                      </p>
                      <p className="text-slate-400 text-sm">
                        Balance: {transaction.balanceAfter}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Redemption; 