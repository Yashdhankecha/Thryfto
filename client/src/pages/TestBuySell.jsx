import React, { useState } from 'react';
import axios from 'axios';

const TestBuySell = () => {
  const [setupStatus, setSetupStatus] = useState('');
  const [transactionStatus, setTransactionStatus] = useState('');
  const [diverseStatus, setDiverseStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [transactionLoading, setTransactionLoading] = useState(false);
  const [diverseLoading, setDiverseLoading] = useState(false);

  const setupTestData = async () => {
    try {
      setLoading(true);
      const response = await axios.post('http://localhost:5000/api/dashboard/test/setup-buy-sell');
      setSetupStatus(`✅ Setup completed! Created ${response.data.itemsCreated} items for testing.`);
    } catch (err) {
      setSetupStatus(`❌ Setup failed: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const addTransactionData = async () => {
    try {
      setTransactionLoading(true);
      const response = await axios.post('http://localhost:5000/api/dashboard/test/add-transaction-data');
      setTransactionStatus(`✅ Transaction data added! Created ${response.data.transactionsCreated} transactions.`);
    } catch (err) {
      setTransactionStatus(`❌ Failed to add transaction data: ${err.response?.data?.error || err.message}`);
    } finally {
      setTransactionLoading(false);
    }
  };

  const createDiverseData = async () => {
    try {
      setDiverseLoading(true);
      const response = await axios.post('http://localhost:5000/api/dashboard/test/create-diverse-data');
      setDiverseStatus(`✅ Diverse data created! ${response.data.usersCreated} users, ${response.data.itemsCreated} items, ${response.data.transactionsCreated} transactions.`);
    } catch (err) {
      setDiverseStatus(`❌ Failed to create diverse data: ${err.response?.data?.error || err.message}`);
    } finally {
      setDiverseLoading(false);
    }
  };

  return (
    <div style={{ width: '100vw', minHeight: '100vh', overflowX: 'hidden' }}>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">Buy/Sell System Test</h1>
            <p className="text-slate-300 text-lg">
              Set up test data and instructions for testing the buy/sell system
            </p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-slate-600 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">Step 1: Setup Test Data</h2>
            <p className="text-slate-300 mb-6">
              This will create test users and sample items for testing the buy/sell system.
            </p>
            
            <button
              onClick={setupTestData}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300 disabled:opacity-50 mr-4"
            >
              {loading ? 'Setting up...' : 'Setup Test Data'}
            </button>
            
            {setupStatus && (
              <div className="mt-4 p-4 rounded-lg bg-slate-700">
                <p className="text-white">{setupStatus}</p>
              </div>
            )}
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-slate-600 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">Step 2: Add Transaction Data</h2>
            <p className="text-slate-300 mb-6">
              This will create sample buy/sell transactions with different statuses (pending, accepted, rejected, completed).
            </p>
            
            <button
              onClick={addTransactionData}
              disabled={transactionLoading}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300 disabled:opacity-50 mr-4"
            >
              {transactionLoading ? 'Adding...' : 'Add Transaction Data'}
            </button>
            
            {transactionStatus && (
              <div className="mt-4 p-4 rounded-lg bg-slate-700">
                <p className="text-white">{transactionStatus}</p>
              </div>
            )}
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-slate-600 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">Step 3: Create Diverse Data (Optional)</h2>
            <p className="text-slate-300 mb-6">
              This will create additional test users and diverse transaction scenarios with multiple buyers and sellers.
            </p>
            
            <button
              onClick={createDiverseData}
              disabled={diverseLoading}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300 disabled:opacity-50"
            >
              {diverseLoading ? 'Creating...' : 'Create Diverse Data'}
            </button>
            
            {diverseStatus && (
              <div className="mt-4 p-4 rounded-lg bg-slate-700">
                <p className="text-white">{diverseStatus}</p>
              </div>
            )}
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-slate-600 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">Step 4: Test Instructions</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Seller Account (yashdhankecha8@gmail.com)</h3>
                <div className="text-slate-300 space-y-2">
                  <p>• Email: <span className="text-blue-400">yashdhankecha8@gmail.com</span></p>
                  <p>• Password: <span className="text-blue-400">Test123!</span></p>
                  <p>• This account will receive buy/offer notifications</p>
                  <p>• Go to "Notifications" to see incoming requests</p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Buyer Account (testbuyer@example.com)</h3>
                <div className="text-slate-300 space-y-2">
                  <p>• Email: <span className="text-blue-400">testbuyer@example.com</span></p>
                  <p>• Password: <span className="text-blue-400">Test123!</span></p>
                  <p>• This account will send buy/offer requests</p>
                  <p>• Go to "Browse Items" to find items to buy</p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Additional Test Users (if diverse data created)</h3>
                <div className="text-slate-300 space-y-2">
                  <p>• <span className="text-blue-400">sarah.johnson@example.com</span> / Test123!</p>
                  <p>• <span className="text-blue-400">mike.chen@example.com</span> / Test123!</p>
                  <p>• <span className="text-blue-400">emma.davis@example.com</span> / Test123!</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-slate-600">
            <h2 className="text-2xl font-bold text-white mb-6">Step 5: Testing Process</h2>
            
            <div className="space-y-4 text-slate-300">
              <div className="flex items-start gap-3">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</span>
                <div>
                  <p className="font-semibold">Login as Buyer</p>
                  <p>Use testbuyer@example.com / Test123!</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</span>
                <div>
                  <p className="font-semibold">Browse and Buy</p>
                  <p>Go to "Browse Items" → Click on any item → Click "Buy Now" or "Make Offer"</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</span>
                <div>
                  <p className="font-semibold">Login as Seller</p>
                  <p>Use yashdhankecha8@gmail.com / Test123!</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">4</span>
                <div>
                  <p className="font-semibold">Check Notifications</p>
                  <p>Go to "Notifications" → See pending requests → Click "Accept" or "Reject"</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestBuySell; 