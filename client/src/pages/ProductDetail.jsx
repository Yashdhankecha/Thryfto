import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

// Create axios instance for dashboard API calls
const dashboardAPI = axios.create({
  baseURL: 'http://localhost:5000/api/dashboard',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include auth token
dashboardAPI.interceptors.request.use(
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

// Create axios instance for notifications API calls
const notificationAPI = axios.create({
  baseURL: 'http://localhost:5000/api/notifications',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include auth token
notificationAPI.interceptors.request.use(
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

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isImageZoomed, setIsImageZoomed] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');
  const [buyMessage, setBuyMessage] = useState('');
  const [offerMessage, setOfferMessage] = useState('');
  const [coinBalance, setCoinBalance] = useState(0);
  const [useCoins, setUseCoins] = useState(false);
  const [coinsToRedeem, setCoinsToRedeem] = useState(0);
  const [finalPrice, setFinalPrice] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);

  // Role-based redirect: only 'user' role allowed
  if (isAuthenticated && user?.role !== 'user') {
    if (user?.role === 'admin') {
      navigate('/admin/dashboard', { replace: true });
      return null;
    }
    return null;
  }

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        console.log('Fetching product with ID:', id);
        const response = await dashboardAPI.get(`/items/${id}`);
        console.log('Product response:', response.data);
        setProduct(response.data.data);
        setFinalPrice(response.data.data.price);
      } catch (err) {
        console.error('Error fetching product:', err.response || err);
        toast.error('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    const fetchCoinBalance = async () => {
      if (isAuthenticated && user) {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch('http://localhost:5000/api/coins/balance', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          if (response.ok) {
            const data = await response.json();
            setCoinBalance(data.coinBalance || 0);
          }
        } catch (error) {
          console.error('Error fetching coin balance:', error);
        }
      }
    };

    if (id) {
      fetchProduct();
      fetchCoinBalance();
    }
  }, [id, isAuthenticated, user]);

  const handleBuy = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setFinalPrice(product.price);
    setCoinsToRedeem(0);
    setDiscountAmount(0);
    setUseCoins(false);
    setShowBuyModal(true);
  };

  const handleCoinToggle = (checked) => {
    setUseCoins(checked);
    if (!checked) {
      setCoinsToRedeem(0);
      setDiscountAmount(0);
      setFinalPrice(product.price);
    } else {
      const maxCoins = Math.min(coinBalance, Math.floor(product.price * 0.5)); // Max 50% of price
      setCoinsToRedeem(maxCoins);
      setDiscountAmount(maxCoins);
      setFinalPrice(product.price - maxCoins);
    }
  };

  const handleCoinsChange = (value) => {
    const maxCoins = Math.min(coinBalance, Math.floor(product.price * 0.5)); // Max 50% of price
    const coins = Math.min(Math.max(0, parseInt(value) || 0), maxCoins);
    setCoinsToRedeem(coins);
    setDiscountAmount(coins);
    setFinalPrice(product.price - coins);
  };

  const handleSell = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setShowSellModal(true);
  };

  const confirmBuy = async () => {
    try {
      // First, redeem coins if user chose to use them
      if (useCoins && coinsToRedeem > 0) {
        try {
          const token = localStorage.getItem('token');
          const coinResponse = await fetch('http://localhost:5000/api/coins/redeem-coins', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              coinsToRedeem: coinsToRedeem,
              orderAmount: product.price
            })
          });

          if (!coinResponse.ok) {
            const errorData = await coinResponse.json();
            toast.error(errorData.message || 'Failed to redeem coins');
            return;
          }

          const coinData = await coinResponse.json();
          setCoinBalance(coinData.coinBalance);
          
          // Dispatch event to update navbar
          window.dispatchEvent(new CustomEvent('coinBalanceUpdated', {
            detail: { coinBalance: coinData.coinBalance }
          }));
          
          toast.success(`Redeemed ${coinsToRedeem} coins for ₹${coinData.discountAmount} discount!`);
        } catch (coinErr) {
          console.error('Error redeeming coins:', coinErr);
          toast.error('Failed to redeem coins');
          return;
        }
      }

      // Then proceed with the purchase
      const response = await dashboardAPI.post(`/items/${id}/buy`, {
        message: buyMessage
      });
      setShowBuyModal(false);
      toast.success('Purchase request sent to seller! You will be notified when the seller responds.');
      
      // Add notification for the buyer
      try {
        await notificationAPI.post('', {
          recipient: user.id,
          sender: user.id,
          type: 'purchase_sent',
          title: 'Purchase Request Sent',
          message: `Your purchase request for "${product.title}" has been sent to the seller.`,
          relatedItem: id,
          relatedTransaction: response.data.transaction._id
        });
      } catch (notifErr) {
        console.error('Failed to create notification:', notifErr);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to process purchase');
    }
  };

  const confirmSell = async () => {
    try {
      if (!offerAmount || offerAmount <= 0) {
        toast.error('Please enter a valid offer amount');
        return;
      }
      
      const response = await dashboardAPI.post(`/items/${id}/offer`, {
        offerAmount: parseInt(offerAmount),
        message: offerMessage
      });
      setShowSellModal(false);
      toast.success('Offer sent to seller! You will be notified when the seller responds.');
      
      // Add notification for the buyer
      try {
        await notificationAPI.post('', {
          recipient: user.id,
          sender: user.id,
          type: 'offer_sent',
          title: 'Offer Sent',
          message: `Your offer of ₹${offerAmount} for "${product.title}" has been sent to the seller.`,
          relatedItem: id,
          relatedTransaction: response.data.transaction._id
        });
      } catch (notifErr) {
        console.error('Failed to create notification:', notifErr);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to process offer');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h3 className="text-2xl font-semibold text-white mb-2">Product Not Found</h3>
          <p className="text-slate-400 mb-6">The product you are looking for does not exist.</p>
          <button
            onClick={() => navigate('/browse')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300"
          >
            Back to Browse
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100vw', minHeight: '100vh', overflowX: 'hidden' }}>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-300 hover:text-white mb-8 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Image Section */}
            <div className="space-y-6">
              {/* Main Image */}
              <div className="relative">
                <div
                  className={`relative overflow-hidden rounded-2xl bg-slate-800 ${
                    isImageZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'
                  }`}
                  onClick={() => setIsImageZoomed(!isImageZoomed)}
                >
                  <img
                    src={product.images[selectedImage] || 'https://via.placeholder.com/600x600?text=No+Image'}
                    alt={product.title}
                    className={`w-full h-96 lg:h-[500px] object-cover transition-all duration-300 ${
                      isImageZoomed ? 'scale-150' : 'hover:scale-105'
                    }`}
                  />
                  {isImageZoomed && (
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <span className="text-white text-sm bg-black/50 px-3 py-1 rounded">
                        Click to zoom out
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Thumbnail Images */}
              {product.images.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === index
                          ? 'border-blue-500 scale-110'
                          : 'border-slate-600 hover:border-slate-400'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.title} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="space-y-8">
              {/* Title and Status */}
              <div>
                <h1 className="text-4xl font-bold text-white mb-4">{product.title}</h1>
                <div className="flex items-center gap-4 mb-6">
                  <span className="bg-green-500 text-white text-sm px-3 py-1 rounded-full">
                    {product.status === 'approved' ? 'Available' : product.status}
                  </span>
                  <span className="text-slate-400">Listed by {product.user?.name || 'Anonymous'}</span>
                </div>
              </div>

              {/* Price and Coin Reward */}
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-600">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-3xl font-bold text-green-400 mb-1">₹{product.price}</div>
                    <div className="text-slate-400">Price</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-yellow-400 mb-1">+{product.coinReward || 0}</div>
                    <div className="text-slate-400 text-sm">Coins earned</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-slate-300 text-sm">
                  <span>💡</span>
                  <span>Earn coins on this purchase to redeem for discount coupons!</span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Description</h3>
                <p className="text-slate-300 leading-relaxed">{product.description}</p>
              </div>

              {/* Product Details */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-semibold text-slate-400 mb-2">BRAND</h4>
                  <p className="text-white">{product.brand || 'Not specified'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-400 mb-2">SIZE</h4>
                  <p className="text-white">{product.size}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-400 mb-2">COLOR</h4>
                  <p className="text-white">{product.color || 'Not specified'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-400 mb-2">CONDITION</h4>
                  <p className="text-white">{product.condition}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-400 mb-2">CATEGORY</h4>
                  <p className="text-white">{product.category}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-400 mb-2">LISTED</h4>
                  <p className="text-white">
                    {new Date(product.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Coin Reward System Info */}
              <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 backdrop-blur-sm rounded-xl p-6 border border-yellow-500/30">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">🪙</span>
                  <h3 className="text-lg font-semibold text-white">Coin Reward System</h3>
                </div>
                <div className="space-y-2 text-sm text-slate-300">
                  <p>• Earn <span className="text-yellow-400 font-semibold">{product.coinReward || 0} coins</span> on this purchase</p>
                  <p>• Redeem coins for discount coupons in the Redemption section</p>
                  <p>• Coins can be used for 10% off, 20% off, or fixed ₹100/₹200 discounts</p>
                </div>
                <button
                  onClick={() => navigate('/redemption')}
                  className="mt-4 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105"
                >
                  View Redemption Options →
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6">
                <button
                  onClick={handleBuy}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Buy Now
                </button>
                <button
                  onClick={handleSell}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Make Offer
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Buy Modal */}
        {showBuyModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-2xl p-8 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-2xl font-bold text-white mb-4">Confirm Purchase</h3>
              
              {/* Coin Balance Display */}
              <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 rounded-lg p-4 mb-4 border border-yellow-500/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🪙</span>
                    <span className="text-white font-semibold">Your Coins: {coinBalance}</span>
                  </div>
                  <span className="text-yellow-400 text-sm">1 coin = ₹1 discount</span>
                </div>
              </div>

              {/* Coin Redemption Section */}
              {coinBalance > 0 && (
                <div className="bg-slate-700/50 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <input
                      type="checkbox"
                      id="useCoins"
                      checked={useCoins}
                      onChange={(e) => handleCoinToggle(e.target.checked)}
                      className="w-4 h-4 text-yellow-600 bg-slate-600 border-slate-500 rounded focus:ring-yellow-500"
                    />
                    <label htmlFor="useCoins" className="text-white font-semibold">
                      Use coins for discount
                    </label>
                  </div>
                  
                  {useCoins && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm text-slate-300 mb-2">
                          Coins to redeem (max: {Math.min(coinBalance, Math.floor(product.price * 0.5))})
                        </label>
                        <input
                          type="number"
                          min="0"
                          max={Math.min(coinBalance, Math.floor(product.price * 0.5))}
                          value={coinsToRedeem}
                          onChange={(e) => handleCoinsChange(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-600 text-white border border-slate-500 rounded-lg focus:ring-2 focus:ring-yellow-500"
                        />
                      </div>
                      <div className="text-xs text-slate-400">
                        Maximum 50% of order can be paid with coins
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Price Breakdown */}
              <div className="bg-slate-700/50 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-300">Original Price:</span>
                  <span className="text-slate-300">₹{product.price}</span>
                </div>
                {useCoins && discountAmount > 0 && (
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-yellow-400">Coin Discount:</span>
                    <span className="text-yellow-400">-₹{discountAmount}</span>
                  </div>
                )}
                <div className="border-t border-slate-600 pt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-semibold">Final Price:</span>
                    <span className="text-green-400 font-bold text-lg">₹{finalPrice}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-slate-300">Coins earned:</span>
                  <span className="text-yellow-400 font-bold">+{Math.floor(finalPrice * 0.05)}</span>
                </div>
                <div className="text-xs text-slate-400 mt-2">
                  💡 You'll earn 5% of final price as coins!
                </div>
              </div>

              <p className="text-slate-300 mb-4">
                Are you sure you want to buy "{product.title}" for ₹{finalPrice}?
              </p>
              
              <textarea
                placeholder="Add a message to the seller (optional)"
                value={buyMessage}
                onChange={(e) => setBuyMessage(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-slate-700 text-white border border-slate-600 focus:ring-2 focus:ring-blue-500 mb-6 resize-none"
                rows="3"
              />
              
              <div className="flex gap-4">
                <button
                  onClick={() => setShowBuyModal(false)}
                  className="flex-1 bg-slate-600 hover:bg-slate-700 text-white font-semibold py-3 px-6 rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmBuy}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all"
                >
                  Confirm Buy
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Sell Modal */}
        {showSellModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-2xl p-8 max-w-md w-full mx-4">
              <h3 className="text-2xl font-bold text-white mb-4">Make an Offer</h3>
              <div className="bg-slate-700/50 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-300">Current price:</span>
                  <span className="text-green-400 font-bold">₹{product.price}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Coins earned:</span>
                  <span className="text-yellow-400 font-bold">+{product.coinReward || 0}</span>
                </div>
              </div>
              <p className="text-slate-300 mb-4">
                Enter your offer for "{product.title}" (current price: ₹{product.price})
              </p>
              <input
                type="number"
                placeholder="Your offer in ₹"
                value={offerAmount}
                onChange={(e) => setOfferAmount(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-slate-700 text-white border border-slate-600 focus:ring-2 focus:ring-blue-500 mb-4"
              />
              <textarea
                placeholder="Add a message to the seller (optional)"
                value={offerMessage}
                onChange={(e) => setOfferMessage(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-slate-700 text-white border border-slate-600 focus:ring-2 focus:ring-blue-500 mb-6 resize-none"
                rows="3"
              />
              <div className="flex gap-4">
                <button
                  onClick={() => setShowSellModal(false)}
                  className="flex-1 bg-slate-600 hover:bg-slate-700 text-white font-semibold py-3 px-6 rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmSell}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-all"
                >
                  Send Offer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail; 