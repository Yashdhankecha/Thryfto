import React from 'react';
import { Link } from 'react-router-dom';

const PointsSystem = () => {
  return (
    <div className="min-h-screen w-screen overflow-x-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-white mb-6 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              ReWear Coin System
            </h1>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Earn coins for every sustainable choice you make! Our reward system incentivizes eco-friendly fashion while helping you save money.
            </p>
          </div>

          {/* Hero Section */}
          <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 backdrop-blur-xl border border-yellow-500/20 rounded-2xl p-8 md:p-12 mb-16">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">How Coins Work</h2>
              <p className="text-yellow-100 text-lg max-w-2xl mx-auto">
                Coins are our platform's reward currency. Earn them by participating in sustainable fashion and spend them on discounts, exclusive items, and special perks.
              </p>
            </div>
          </div>

          {/* Earning Coins Section */}
          <div className="mb-16">
            <h2 className="text-4xl font-bold text-white text-center mb-12">How to Earn Coins</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Selling Items</h3>
                <p className="text-slate-300 mb-4">Earn coins for every item you successfully sell on the platform.</p>
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                  <p className="text-green-300 text-sm font-medium">+10-50 coins per sale</p>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Making Purchases</h3>
                <p className="text-slate-300 mb-4">Earn coins for every purchase you make on the platform.</p>
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                  <p className="text-blue-300 text-sm font-medium">+5-25 coins per purchase</p>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Leaving Reviews</h3>
                <p className="text-slate-300 mb-4">Get rewarded for helping other users with honest feedback.</p>
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                  <p className="text-purple-300 text-sm font-medium">+2-5 coins per review</p>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Daily Login</h3>
                <p className="text-slate-300 mb-4">Earn bonus coins just for being active on the platform.</p>
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                  <p className="text-yellow-300 text-sm font-medium">+1-3 coins daily</p>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Refer Friends</h3>
                <p className="text-slate-300 mb-4">Invite friends to join and earn bonus coins when they sign up.</p>
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  <p className="text-red-300 text-sm font-medium">+20 coins per referral</p>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Special Events</h3>
                <p className="text-slate-300 mb-4">Participate in platform events and challenges for bonus rewards.</p>
                <div className="bg-teal-500/10 border border-teal-500/20 rounded-lg p-3">
                  <p className="text-teal-300 text-sm font-medium">+10-100 coins per event</p>
                </div>
              </div>
            </div>
          </div>

          {/* Coin Values and Tiers */}
          <div className="mb-16">
            <h2 className="text-4xl font-bold text-white text-center mb-12">Coin Values & Tiers</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-gradient-to-br from-bronze-500/20 to-amber-600/20 backdrop-blur-xl border border-amber-500/30 rounded-2xl p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-amber-600 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Bronze Tier</h3>
                <p className="text-amber-200 mb-4">0-499 coins</p>
                <ul className="text-slate-300 space-y-2 text-left">
                  <li>• 5% discount on purchases</li>
                  <li>• Basic customer support</li>
                  <li>• Standard shipping rates</li>
                  <li>• Access to community features</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-silver-500/20 to-gray-400/20 backdrop-blur-xl border border-gray-400/30 rounded-2xl p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-gray-400 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Silver Tier</h3>
                <p className="text-gray-200 mb-4">500-1499 coins</p>
                <ul className="text-slate-300 space-y-2 text-left">
                  <li>• 10% discount on purchases</li>
                  <li>• Priority customer support</li>
                  <li>• Free shipping on orders</li>
                  <li>• Early access to new features</li>
                  <li>• Exclusive marketplace events</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-gold-500/20 to-yellow-400/20 backdrop-blur-xl border border-yellow-400/30 rounded-2xl p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-yellow-300 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Gold Tier</h3>
                <p className="text-yellow-200 mb-4">1500+ coins</p>
                <ul className="text-slate-300 space-y-2 text-left">
                  <li>• 15% discount on purchases</li>
                  <li>• VIP customer support</li>
                  <li>• Free express shipping</li>
                  <li>• Beta feature access</li>
                  <li>• Exclusive partner discounts</li>
                  <li>• Personal account manager</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Spending Coins Section */}
          <div className="mb-16">
            <h2 className="text-4xl font-bold text-white text-center mb-12">How to Spend Your Coins</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-white mb-6">Purchase Discounts</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <span className="text-white font-medium">50 coins</span>
                    <span className="text-green-300">5% off next purchase</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <span className="text-white font-medium">100 coins</span>
                    <span className="text-blue-300">10% off next purchase</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                    <span className="text-white font-medium">200 coins</span>
                    <span className="text-purple-300">20% off next purchase</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-white mb-6">Premium Features</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <span className="text-white font-medium">25 coins</span>
                    <span className="text-yellow-300">Featured listing (24h)</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <span className="text-white font-medium">50 coins</span>
                    <span className="text-red-300">Priority customer support</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                    <span className="text-white font-medium">75 coins</span>
                    <span className="text-indigo-300">Advanced analytics</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Coin Calculation Examples */}
          <div className="mb-16">
            <h2 className="text-4xl font-bold text-white text-center mb-12">Coin Calculation Examples</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-white mb-6">Selling Example</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <p className="text-white font-medium mb-2">Selling a Designer Jacket</p>
                    <p className="text-slate-300 text-sm">Sale Price: ₹2,500</p>
                    <p className="text-green-300 font-medium">Earned: 35 coins</p>
                  </div>
                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <p className="text-white font-medium mb-2">Selling a Casual T-Shirt</p>
                    <p className="text-slate-300 text-sm">Sale Price: ₹800</p>
                    <p className="text-blue-300 font-medium">Earned: 15 coins</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-white mb-6">Buying Example</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                    <p className="text-white font-medium mb-2">Buying a Vintage Dress</p>
                    <p className="text-slate-300 text-sm">Purchase Price: ₹1,200</p>
                    <p className="text-purple-300 font-medium">Earned: 20 coins</p>
                  </div>
                  <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                    <p className="text-white font-medium mb-2">Buying Accessories</p>
                    <p className="text-slate-300 text-sm">Purchase Price: ₹500</p>
                    <p className="text-orange-300 font-medium">Earned: 10 coins</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tips and Best Practices */}
          <div className="mb-16">
            <h2 className="text-4xl font-bold text-white text-center mb-12">Tips to Maximize Your Coins</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">List High-Quality Items</h3>
                    <p className="text-slate-300">Better items attract more buyers and earn more coins per sale.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Be Active Daily</h3>
                    <p className="text-slate-300">Log in daily to earn bonus coins and stay engaged with the community.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Leave Honest Reviews</h3>
                    <p className="text-slate-300">Help other users and earn coins by providing detailed, honest feedback.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Participate in Events</h3>
                    <p className="text-slate-300">Join platform events and challenges for bonus coin opportunities.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Refer Friends</h3>
                    <p className="text-slate-300">Invite friends to join ReWear and earn bonus coins for each successful referral.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Use Coins Strategically</h3>
                    <p className="text-slate-300">Save coins for larger purchases to maximize your discount benefits.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <div className="bg-gradient-to-r from-yellow-600 to-orange-600 rounded-2xl p-8 md:p-12">
              <h2 className="text-3xl font-bold text-white mb-4">Start Earning Coins Today!</h2>
              <p className="text-yellow-100 mb-8 text-lg">
                Join the sustainable fashion community and start earning rewards for your eco-friendly choices
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/browse"
                  className="px-8 py-3 bg-white text-orange-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
                >
                  Browse Items
                </Link>
                <Link
                  to="/list"
                  className="px-8 py-3 bg-transparent border-2 border-white text-white font-semibold rounded-xl hover:bg-white hover:text-orange-600 transition-colors"
                >
                  List an Item
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PointsSystem; 