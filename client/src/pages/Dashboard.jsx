import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ListItemModal from './ListItem';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import CoinAnimation from '../components/CoinAnimation';

const stats = [
  { label: 'Total Items Listed', value: '1,247' },
  { label: 'Sales Completed', value: '342' },
  { label: 'Items Awaiting Approval', value: '12' },
  { label: 'Flagged Items', value: '3' },
];

// Static featured items as fallback
const fallbackFeaturedItems = [
  { 
    id: 'vintage-denim-jacket',
    title: 'Vintage Denim Jacket', 
    subtitle: 'Size M • ₹1,200',
    image: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=400&h=400&fit=crop',
    searchTerm: 'Vintage Denim Jacket'
  },
  { 
    id: 'summer-floral-dress',
    title: 'Summer Floral Dress', 
    subtitle: 'Size S • ₹950',
    image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=400&fit=crop',
    searchTerm: 'Summer Floral Dress'
  },
  { 
    id: 'designer-sneakers',
    title: 'Designer Sneakers', 
    subtitle: 'Size 9 • ₹1,500',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
    searchTerm: 'Designer Sneakers'
  },
  { 
    id: 'wool-coat',
    title: 'Wool Coat', 
    subtitle: 'Size L • ₹1,100',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop',
    searchTerm: 'Wool Coat'
  },
  { 
    id: 'silk-blouse',
    title: 'Silk Blouse', 
    subtitle: 'Size M • ₹800',
    image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop',
    searchTerm: 'Silk Blouse'
  },
];

const phrases = [
  "Buy. Sell. Sustain.",
  "Quality with Purpose.",
  "Sustainable Shopping.",
  "Thryfto the Future."
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [featuredItems, setFeaturedItems] = useState([]);
  const [personalizedItems, setPersonalizedItems] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [loadingPersonalized, setLoadingPersonalized] = useState(true);
  const [activeTab, setActiveTab] = useState('recommended');
  const [purchasedItems, setPurchasedItems] = useState([]);
  const [soldItems, setSoldItems] = useState([]);
  const [loadingPurchased, setLoadingPurchased] = useState(false);
  const [loadingSold, setLoadingSold] = useState(false);
  const [showCoinAnimation, setShowCoinAnimation] = useState(false);
  const [coinsEarned, setCoinsEarned] = useState(0);

  // Role-based redirect: only 'user' role allowed
  useEffect(() => {
    if (isAuthenticated && user?.role !== 'user') {
      if (user?.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, user?.role, navigate]);

  if (isAuthenticated && user?.role !== 'user') {
    return null;
  }

  // Helper to get a sessionStorage key unique to the user
  const getPersonalizedKey = () => {
    if (!isAuthenticated || !user?.id) return 'personalizedItems_guest';
    return `personalizedItems_${user.id}`;
  };

  useEffect(() => {
    let typingSpeed = 100;
    let pause = 1200;
    const currentPhrase = phrases[currentPhraseIndex];

    if (!isDeleting && charIndex <= currentPhrase.length) {
      if (charIndex === currentPhrase.length) {
        typingSpeed = pause;
        setTimeout(() => setIsDeleting(true), pause);
      } else {
        setTimeout(() => {
          setDisplayText(currentPhrase.slice(0, charIndex + 1));
          setCharIndex(charIndex + 1);
        }, typingSpeed);
      }
    } else if (isDeleting && charIndex >= 0) {
      if (charIndex === 0) {
        setIsDeleting(false);
        setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
      } else {
        setTimeout(() => {
          setDisplayText(currentPhrase.slice(0, charIndex - 1));
          setCharIndex(charIndex - 1);
        }, 50);
      }
    }
    // eslint-disable-next-line
  }, [charIndex, isDeleting, currentPhraseIndex]);

  useEffect(() => {
    // Reset charIndex when phrase changes
    if (!isDeleting) setCharIndex(0);
    // eslint-disable-next-line
  }, [currentPhraseIndex]);

  // Fetch trending items (for guests)
  const fetchTrendingItems = async () => {
    try {
      setLoadingFeatured(true);
      const response = await axios.get('http://localhost:5000/api/dashboard/items', {
        params: {
          limit: 5,
          status: 'approved',
          sortBy: 'views',
          sortOrder: 'desc'
        }
      });
      if (response.data.items && response.data.items.length > 0) {
        const trendingItems = response.data.items.map(item => ({
          id: item._id || item.id,
          title: item.title,
          subtitle: `Size ${item.size} • ₹${item.price}`,
          image: item.images && item.images[0] ? item.images[0] : 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=400&h=400&fit=crop',
          searchTerm: item.title
        }));
        setFeaturedItems(trendingItems);
      } else {
        setFeaturedItems(fallbackFeaturedItems);
      }
    } catch (error) {
      setFeaturedItems(fallbackFeaturedItems);
    } finally {
      setLoadingFeatured(false);
    }
  };

      // Fetch personalized recommendations based on user interests
  const fetchPersonalizedItems = async () => {
    try {
      setLoadingPersonalized(true);
      const interestCategories = [
        'Electronics',
        'Fashion', 
        'Home & Garden',
        'Sports & Outdoors',
        'Books & Media',
        'Automotive'
      ];
      const selectedCategories = interestCategories
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.floor(Math.random() * 2) + 2);
      const personalizedItems = [];
      for (const category of selectedCategories) {
        try {
          const response = await axios.get('http://localhost:5000/api/dashboard/items', {
            params: {
              limit: 3,
              status: 'approved',
              category: category,
              sortBy: 'createdAt',
              sortOrder: 'desc'
            }
          });
          if (response.data.items && response.data.items.length > 0) {
            const categoryItems = response.data.items.map(item => ({
              id: item._id || item.id,
              title: item.title,
              subtitle: `Size ${item.size} • ₹${item.price}`,
              image: item.images && item.images[0] ? item.images[0] : 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=400&h=400&fit=crop',
              searchTerm: item.title,
              category: item.category
            }));
            personalizedItems.push(...categoryItems);
          }
        } catch (error) {
          // Ignore category fetch error
        }
      }
      const shuffledItems = personalizedItems.sort(() => 0.5 - Math.random()).slice(0, 6);
      setPersonalizedItems(shuffledItems);
      // Save to sessionStorage for this user
      sessionStorage.setItem(getPersonalizedKey(), JSON.stringify(shuffledItems));
    } catch (error) {
      setPersonalizedItems([]);
    } finally {
      setLoadingPersonalized(false);
    }
  };

  const fetchPurchasedItems = async () => {
    if (!isAuthenticated || !user) return;
    
    setLoadingPurchased(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/dashboard/user/bought?page=1&limit=20`);
      setPurchasedItems(response.data.items || []);
    } catch (error) {
      console.error('Error fetching purchased items:', error);
      setPurchasedItems([]);
    } finally {
      setLoadingPurchased(false);
    }
  };

  const fetchSoldItems = async () => {
    if (!isAuthenticated || !user) return;
    
    setLoadingSold(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/dashboard/user/sold?page=1&limit=20`);
      setSoldItems(response.data.items || []);
    } catch (error) {
      console.error('Error fetching sold items:', error);
      setSoldItems([]);
    } finally {
      setLoadingSold(false);
    }
  };

  // On mount or when user changes, load recommendations from sessionStorage or fetch if not present
  useEffect(() => {
    fetchTrendingItems();
    if (isAuthenticated) {
      const key = getPersonalizedKey();
      const stored = sessionStorage.getItem(key);
      if (stored) {
        setPersonalizedItems(JSON.parse(stored));
        setLoadingPersonalized(false);
      } else {
        fetchPersonalizedItems();
      }
      // Fetch purchased and sold items
      fetchPurchasedItems();
      fetchSoldItems();
    } else {
      // If user logs out, clear all personalized recommendations from sessionStorage
      Object.keys(sessionStorage).forEach(k => {
        if (k.startsWith('personalizedItems_')) sessionStorage.removeItem(k);
      });
      setPersonalizedItems([]);
      setLoadingPersonalized(false);
    }
  }, [isAuthenticated, user?.id]);

  // Listen for coin balance updates
  useEffect(() => {
    const handleCoinUpdate = (event) => {
      if (event.detail && typeof event.detail.coinBalance === 'number') {
        setCoinsEarned(10); // Show animation for any coin update
        setShowCoinAnimation(true);
        setTimeout(() => setShowCoinAnimation(false), 2000);
      }
    };

    window.addEventListener('coinBalanceUpdated', handleCoinUpdate);
    return () => window.removeEventListener('coinBalanceUpdated', handleCoinUpdate);
  }, []);

  return (
    <div style={{ width: '100vw', minHeight: '100vh', overflowX: 'hidden' }} className="bg-gradient-to-br from-slate-900 via-slate-800 to-green-900">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-6">
        {/* Hero Section */}
        <div className="flex flex-col md:flex-row items-center gap-8 py-8">
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white mb-4">
              {displayText}
              <span className={`inline-block w-1 h-12 bg-green-600 ml-1 ${!isDeleting ? 'animate-pulse' : 'opacity-0'}`}></span>
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 max-w-xl">
              Thryfto your items, not the planet. Join our marketplace of conscious buyers and sellers trading pre-owned goods.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold px-8 py-3 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105">
                Start Shopping →
              </button>
              <button 
                onClick={() => navigate('/browse')}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold px-6 py-3 rounded-lg shadow-sm transition-all hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                Browse Items
              </button>
              <button
                onClick={() => navigate('/list')}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold px-6 py-3 rounded-lg shadow-sm transition-all hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                List an Item
              </button>
            </div>
          </div>
          <div className="flex-1 w-full flex justify-center">
            <div className="w-full max-w-md h-80 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-slate-800 dark:to-green-800 rounded-2xl overflow-hidden shadow-xl">
              <img 
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&h=400&fit=crop" 
                alt="Sustainable Fashion" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Dashboard Tabs for Logged-in Users */}
      {isAuthenticated && (
        <div className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Tab Navigation */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex space-x-1 bg-slate-800/50 p-1 rounded-xl">
                <button
                  onClick={() => setActiveTab('recommended')}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                    activeTab === 'recommended'
                      ? 'bg-green-600 text-white shadow-lg'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  Recommended
                </button>
                <button
                  onClick={() => setActiveTab('purchased')}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                    activeTab === 'purchased'
                      ? 'bg-green-600 text-white shadow-lg'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  My Purchases
                </button>
                <button
                  onClick={() => setActiveTab('sold')}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                    activeTab === 'sold'
                      ? 'bg-green-600 text-white shadow-lg'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  Sold Items
                </button>
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {activeTab === 'recommended' && 'Based on your interests'}
                {activeTab === 'purchased' && 'Items you\'ve purchased'}
                {activeTab === 'sold' && 'Items you\'ve sold'}
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'recommended' && (
              <>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">
                  Recommended for You
                </h2>
            {loadingPersonalized ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-slate-600 dark:text-slate-400">Finding perfect items for you...</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
                {personalizedItems.map((item, index) => (
                  <div
                    key={item.id}
                    onClick={() => navigate(`/browse?search=${encodeURIComponent(item.searchTerm)}`)}
                    className="group rounded-xl bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer"
                  >
                    <div className="h-32 overflow-hidden">
                      <img 
                        src={item.image} 
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4">
                      <div className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
                        {item.title}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {item.subtitle}
                      </div>
                      <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                        {item.category}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
              </>
            )}

            {/* Purchased Items Tab */}
            {activeTab === 'purchased' && (
              <>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">
                  My Purchases
                </h2>
                {loadingPurchased ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="text-center">
                      <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-slate-600 dark:text-slate-400">Loading your purchases...</p>
                    </div>
                  </div>
                ) : purchasedItems.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
                    {purchasedItems.map((item, index) => (
                      <div
                        key={item.id || index}
                        className="group rounded-xl bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer"
                      >
                        <div className="h-32 overflow-hidden">
                          <img 
                            src={item.images?.[0] || 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=400&h=400&fit=crop'} 
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                        <div className="p-4">
                          <div className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
                            {item.title}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            Purchased for ₹{item.amount || item.price}
                          </div>
                          <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                            {new Date(item.purchaseDate || item.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 mx-auto mb-6 text-slate-400">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No purchases yet</h3>
                    <p className="text-slate-600 dark:text-slate-400">Start shopping to see your purchases here</p>
                  </div>
                )}
              </>
            )}

            {/* Sold Items Tab */}
            {activeTab === 'sold' && (
              <>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">
                  Sold Items
                </h2>
                {loadingSold ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="text-center">
                      <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-slate-600 dark:text-slate-400">Loading your sold items...</p>
                    </div>
                  </div>
                ) : soldItems.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
                    {soldItems.map((item, index) => (
                      <div
                        key={item.id || index}
                        className="group rounded-xl bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer"
                      >
                        <div className="h-32 overflow-hidden">
                          <img 
                            src={item.images?.[0] || 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=400&h=400&fit=crop'} 
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                        <div className="p-4">
                          <div className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
                            {item.title}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            Sold for ₹{item.amount || item.price}
                          </div>
                          <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                            {new Date(item.soldDate || item.updatedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 mx-auto mb-6 text-slate-400">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No sales yet</h3>
                    <p className="text-slate-600 dark:text-slate-400">List items to start selling</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Popular Items for Guest Users */}
      {!isAuthenticated && (
        <div className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                Popular Items
              </h2>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Discover what's trending
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
              {featuredItems.slice(0, 6).map((item, index) => (
                <div
                  key={item.id}
                  onClick={() => navigate(`/browse?search=${encodeURIComponent(item.searchTerm)}`)}
                  className="group rounded-xl bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer"
                >
                  <div className="h-32 overflow-hidden">
                    <img 
                      src={item.image} 
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <div className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
                      {item.title}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {item.subtitle}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Trending Items */}
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8 text-center">
            Trending Items
          </h2>
          {loadingFeatured ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-600 dark:text-slate-400">Loading trending items...</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
              {featuredItems.map((item, index) => (
                <div
                  key={item.id}
                  onClick={() => navigate(`/browse?search=${encodeURIComponent(item.searchTerm)}`)}
                  className="group rounded-xl bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer"
                >
                  <div className="h-32 overflow-hidden">
                    <img 
                      src={item.image} 
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <div className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
                      {item.title}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {item.subtitle}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Coin Animation */}
      <CoinAnimation 
        show={showCoinAnimation} 
        coins={coinsEarned}
        onComplete={() => setShowCoinAnimation(false)}
      />
    </div>
  );
};

export default Dashboard;
