import React, { useState } from 'react';
import { loadScript } from 'razorpay';
import toast from 'react-hot-toast';

const RazorpayPayment = ({ 
  isOpen, 
  onClose, 
  orderData, 
  onSuccess, 
  onError 
}) => {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (!orderData) return;

    setLoading(true);
    try {
      // Load Razorpay script
      const script = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
      
      if (!script) {
        throw new Error('Failed to load Razorpay script');
      }

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_1DP5mmOlF5G5ag', // Test key
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: 'EcoFinds Marketplace',
        description: `Purchase: ${orderData.product.title}`,
        image: 'https://via.placeholder.com/150x150/10b981/ffffff?text=EF', // Your logo
        order_id: orderData.order.id,
        prefill: {
          name: orderData.buyer.name,
          email: orderData.buyer.email,
          contact: orderData.buyer.phone || ''
        },
        theme: {
          color: '#10b981' // EcoFinds green theme
        },
        handler: async function (response) {
          try {
            // Verify payment on backend
            const verifyResponse = await fetch('http://localhost:5000/api/payments/verify-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });

            const verifyData = await verifyResponse.json();

            if (verifyData.success) {
              // Dispatch coin balance update event
              window.dispatchEvent(new CustomEvent('coinBalanceUpdated', {
                detail: { coinBalance: verifyData.buyer.coinBalance }
              }));

              toast.success('Payment Successful! 🎉');
              onSuccess(verifyData);
              onClose();
            } else {
              throw new Error(verifyData.error || 'Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            toast.error('Payment verification failed');
            onError(error);
          }
        },
        modal: {
          ondismiss: function() {
            toast.error('Payment cancelled');
            onClose();
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
      onError(error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !orderData) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🛒</span>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Complete Purchase
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            Secure payment powered by Razorpay
          </p>
        </div>

        {/* Product Details */}
        <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4 mb-6">
          <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
            {orderData.product.title}
          </h4>
          <div className="flex justify-between items-center">
            <span className="text-slate-600 dark:text-slate-400">
              Seller: {orderData.product.seller.name}
            </span>
            <span className="text-xl font-bold text-green-600">
              ₹{orderData.product.price}
            </span>
          </div>
        </div>

        {/* Payment Button */}
        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold py-3 px-6 rounded-xl transition-all hover:bg-slate-300 dark:hover:bg-slate-500"
          >
            Cancel
          </button>
          <button
            onClick={handlePayment}
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Pay Now'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RazorpayPayment;
