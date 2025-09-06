import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

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

const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDealModal, setShowDealModal] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [counterOfferAmount, setCounterOfferAmount] = useState('');
  const [counterOfferMessage, setCounterOfferMessage] = useState('');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationAPI.get('/');
      setNotifications(response.data.notifications || []);
    } catch (err) {
      toast.error('Failed to load notifications');
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDealResponse = async (action) => {
    try {
      const response = await notificationAPI.post(`/${selectedNotification._id}/respond`, {
        action
      });
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => 
          n._id === selectedNotification._id 
            ? { ...n, isRead: true }
            : n
        )
      );
      
      setShowDealModal(false);
      setSelectedNotification(null);
      
      // Show success message
      toast.success(response.data.message);
      
      // Refresh notifications
      fetchNotifications();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process response');
    }
  };

  const handleMakeOffer = async () => {
    try {
      const response = await notificationAPI.post(`/${selectedNotification._id}/respond`, {
        action: 'make_offer',
        counterOfferAmount: parseInt(counterOfferAmount),
        message: counterOfferMessage
      });
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => 
          n._id === selectedNotification._id 
            ? { ...n, isRead: true }
            : n
        )
      );
      
      setShowOfferModal(false);
      setSelectedNotification(null);
      setCounterOfferAmount('');
      setCounterOfferMessage('');
      
      // Show success message
      toast.success('Counter offer sent successfully!');
      
      // Refresh notifications
      fetchNotifications();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send counter offer');
    }
  };

  const handlePaymentCompletion = async (notificationId) => {
    try {
      const response = await notificationAPI.post(`/${notificationId}/complete-payment`);
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => 
          n._id === notificationId 
            ? { ...n, isRead: true }
            : n
        )
      );
      
      toast.success('Payment completed successfully!');
      
      // Refresh notifications
      fetchNotifications();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete payment');
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await notificationAPI.put(`/${notificationId}/read`);
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => 
          n._id === notificationId 
            ? { ...n, isRead: true }
            : n
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      'buy_request': '🛒',
      'offer_made': '💰',
      'deal_accepted': '✅',
      'deal_rejected': '❌',
      'counter_offer': '🔄',
      'payment_required': '💳'
    };
    return icons[type] || '🔔';
  };

  const getNotificationColor = (type) => {
    const colors = {
      'buy_request': 'border-blue-500 bg-blue-500/10',
      'offer_made': 'border-green-500 bg-green-500/10',
      'deal_accepted': 'border-green-500 bg-green-500/10',
      'deal_rejected': 'border-red-500 bg-red-500/10',
      'counter_offer': 'border-yellow-500 bg-yellow-500/10',
      'payment_required': 'border-purple-500 bg-purple-500/10'
    };
    return colors[type] || 'border-slate-500 bg-slate-500/10';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-green-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100vw', minHeight: '100vh', overflowX: 'hidden' }}>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-green-900 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">Notifications</h1>
            <p className="text-slate-300 text-lg">
              Manage your deals, offers, and transactions
            </p>
          </div>



          {/* Notifications List */}
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔔</div>
              <h3 className="text-2xl font-semibold text-white mb-2">No Notifications</h3>
              <p className="text-slate-400">
                You don't have any notifications at the moment.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`backdrop-blur-sm rounded-xl p-6 border ${getNotificationColor(notification.type)} ${
                    !notification.isRead ? 'ring-2 ring-green-500' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Notification Icon */}
                    <div className="flex-shrink-0">
                      <div className="text-3xl">
                        {getNotificationIcon(notification.type)}
                      </div>
                    </div>

                    {/* Notification Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-semibold text-white mb-1">
                            {notification.title}
                          </h3>
                          <p className="text-slate-300 mb-2">
                            {notification.message}
                          </p>
                          <p className="text-sm text-slate-400">
                            From: {notification.sender?.name || 'Unknown'}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-slate-400">
                            {new Date(notification.createdAt).toLocaleDateString()}
                          </div>
                          {!notification.isRead && (
                            <div className="w-3 h-3 bg-green-500 rounded-full mt-2"></div>
                          )}
                        </div>
                      </div>

                      {/* Item Preview */}
                      {notification.relatedItem && (
                        <div className="flex items-center gap-3 mb-4 p-3 bg-slate-800/50 rounded-lg">
                          <img
                            src={notification.relatedItem.images?.[0] || 'https://via.placeholder.com/60x60?text=No+Image'}
                            alt={notification.relatedItem.title}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                          <div>
                            <p className="text-white font-medium">{notification.relatedItem.title}</p>
                            <p className="text-slate-400 text-sm">
                              {notification.relatedTransaction?.offerAmount ? 
                                `₹${notification.relatedTransaction.offerAmount}` : 
                                'Price not specified'
                              }
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      {notification.actionRequired && !notification.isRead && (
                        <div className="flex gap-3 mt-4">
                          {notification.actionRequired === 'deal' && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedNotification(notification);
                                  setShowDealModal(true);
                                }}
                                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-300"
                              >
                                Deal
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedNotification(notification);
                                  setShowOfferModal(true);
                                }}
                                className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-300"
                              >
                                Make Offer
                              </button>
                              <button
                                onClick={() => handleDealResponse('no_deal')}
                                className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-300"
                              >
                                No Deal
                              </button>
                            </>
                          )}
                          
                          {notification.actionRequired === 'pay' && (
                            <button
                              onClick={() => handlePaymentCompletion(notification._id)}
                              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-300"
                            >
                              Complete Payment
                            </button>
                          )}
                          
                          {notification.actionRequired === 'respond_to_offer' && (
                            <button
                              onClick={() => {
                                setSelectedNotification(notification);
                                setShowDealModal(true);
                              }}
                                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-300"
                            >
                              Respond to Offer
                            </button>
                          )}
                        </div>
                      )}

                      {/* Mark as Read Button */}
                      {!notification.isRead && (
                        <button
                          onClick={() => markAsRead(notification._id)}
                          className="text-slate-400 hover:text-white text-sm mt-3 transition-colors"
                        >
                          Mark as Read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Deal Modal */}
      {showDealModal && selectedNotification && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-2xl p-8 max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold text-white mb-4">Confirm Deal</h3>
            <p className="text-slate-300 mb-6">
              Are you sure you want to accept this deal? This will mark the transaction as completed.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowDealModal(false)}
                className="flex-1 bg-slate-600 hover:bg-slate-700 text-white font-semibold py-3 px-6 rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDealResponse('deal')}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-all"
              >
                Accept Deal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Make Offer Modal */}
      {showOfferModal && selectedNotification && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-2xl p-8 max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold text-white mb-4">Make Counter Offer</h3>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Counter Offer Amount (₹)
                </label>
                <input
                  type="number"
                  value={counterOfferAmount}
                  onChange={(e) => setCounterOfferAmount(e.target.value)}
                  placeholder="Enter your counter offer"
                  className="w-full px-4 py-3 rounded-lg bg-slate-700 text-white border border-slate-600 focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Message (Optional)
                </label>
                <textarea
                  value={counterOfferMessage}
                  onChange={(e) => setCounterOfferMessage(e.target.value)}
                  placeholder="Add a message to your counter offer"
                  className="w-full px-4 py-3 rounded-lg bg-slate-700 text-white border border-slate-600 focus:ring-2 focus:ring-green-500 resize-none"
                  rows="3"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowOfferModal(false)}
                className="flex-1 bg-slate-600 hover:bg-slate-700 text-white font-semibold py-3 px-6 rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleMakeOffer}
                disabled={!counterOfferAmount}
                className="flex-1 bg-yellow-600 hover:bg-yellow-700 disabled:bg-slate-600 text-white font-semibold py-3 px-6 rounded-lg transition-all"
              >
                Send Counter Offer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications; 