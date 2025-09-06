import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
// import RazorpayPayment from '../components/RazorpayPayment'; // Temporarily disabled
import toast from 'react-hot-toast';

const BrowseItems = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: '',
    condition: '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    status: 'approved',
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [availableFilters, setAvailableFilters] = useState({
    categories: [],
    conditions: []
  });
  const [showFilters, setShowFilters] = useState(false);
  // const [showPayment, setShowPayment] = useState(false); // Temporarily disabled
  // const [paymentData, setPaymentData] = useState(null); // Temporarily disabled
  // const [loadingPayment, setLoadingPayment] = useState(false); // Temporarily disabled

  // Role-based redirect: only 'user' role allowed
  if (isAuthenticated && user?.role !== 'user') {
    if (user?.role === 'admin') {
      window.location.replace('/admin/dashboard');
      return null;
    }
    return null;
  }

  const fetchItems = async (page = 1) => {
    setLoading(true);
    try {
      // Get all items first to determine pagination
      const allItemsParams = new URLSearchParams({
        page: 1,
        limit: 1000, // Get a large number to ensure we get all items
        status: 'approved', // Only show approved items
        ...filters
      });

      console.log('Fetching items with params:', allItemsParams.toString());
      const allItemsResponse = await axios.get(`http://localhost:5000/api/dashboard/items?${allItemsParams}`);
      console.log('API Response:', allItemsResponse.data);
      
      let allItems = allItemsResponse.data.items || [];
      
      // Filter out user's own items if logged in
      if (user && (user._id || user.id)) {
        const userId = user._id || user.id;
        allItems = allItems.filter(item => {
          // Check if the item belongs to the current user
          const itemUserId = item.user || item.seller || item.owner || item.createdBy || item.listedBy;
          return itemUserId && itemUserId.toString() !== userId.toString();
        });
      }

      // Apply client-side filtering for search
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        allItems = allItems.filter(item => 
          item.title?.toLowerCase().includes(searchTerm) ||
          item.description?.toLowerCase().includes(searchTerm) ||
          item.brand?.toLowerCase().includes(searchTerm) ||
          item.category?.toLowerCase().includes(searchTerm)
        );
      }

      // Apply client-side filtering for price range
      if (filters.minPrice) {
        allItems = allItems.filter(item => item.price >= parseInt(filters.minPrice));
      }
      if (filters.maxPrice) {
        allItems = allItems.filter(item => item.price <= parseInt(filters.maxPrice));
      }

      // Apply client-side filtering for category
      if (filters.category) {
        allItems = allItems.filter(item => item.category === filters.category);
      }

      // Apply client-side filtering for condition
      if (filters.condition) {
        allItems = allItems.filter(item => item.condition === filters.condition);
      }

      // Apply sorting
      allItems.sort((a, b) => {
        let aValue, bValue;
        switch (filters.sortBy) {
          case 'price':
            aValue = a.price || 0;
            bValue = b.price || 0;
            break;
          case 'title':
            aValue = a.title || '';
            bValue = b.title || '';
            break;
          case 'createdAt':
          default:
            aValue = new Date(a.createdAt || 0);
            bValue = new Date(b.createdAt || 0);
            break;
        }

        if (filters.sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });

      // Calculate pagination based on 12 items per page
      const itemsPerPage = 12;
      const totalItems = allItems.length;
      const totalPages = Math.ceil(totalItems / itemsPerPage);
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const currentPageItems = allItems.slice(startIndex, endIndex);

      console.log('Filtered items:', currentPageItems.length, 'out of', allItems.length);

      setItems(currentPageItems);
      setPagination({
        currentPage: page,
        totalPages: totalPages,
        totalItems: totalItems,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      });
      setAvailableFilters(allItemsResponse.data.filters || { categories: [], conditions: [] });
      setError(null);
    } catch (err) {
      console.error('Error fetching items:', err);
      setError(`Failed to load items: ${err.response?.data?.error || err.message}`);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (page) => {
    fetchItems(page);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      condition: '',
      minPrice: '',
      maxPrice: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
      status: 'approved',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'swapped': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'approved': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getConditionColor = (condition) => {
    switch (condition) {
      case 'New': return 'text-green-400';
      case 'Like New': return 'text-blue-400';
      case 'Good': return 'text-yellow-400';
      case 'Fair': return 'text-orange-400';
      default: return 'text-gray-400';
    }
  };

  // Temporarily disabled payment functionality
  // const handleBuyNow = async (item, event) => {
  //   event.stopPropagation(); // Prevent card click navigation
  //   toast.info('Payment functionality temporarily disabled');
  // };

  if (loading && items.length === 0) {
    return (
      <div className="min-h-screen w-screen overflow-x-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-green-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading items...</p>
          <p className="text-slate-400 text-sm mt-2">Please wait while we fetch the latest items...</p>
        </div>
      </div>
    );
  }

  // Show a basic page even if there's an error
  if (error && items.length === 0) {
    return (
      <div className="min-h-screen w-screen overflow-x-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-green-900">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">Browse Items</h1>
            <div className="bg-red-900/50 border border-red-500 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-red-200 mb-4">{error}</p>
              <button 
                onClick={() => fetchItems()}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-screen overflow-x-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-green-900">
      {/* Header Section */}
      <div className="relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
        
        <div className="relative container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              Discover Amazing Items
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Explore our community's collection of sustainable fashion pieces
            </p>
          </div>
          
          {/* Enhanced Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative group">
              <input
                type="text"
                placeholder="Search for items, brands, or categories..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full px-6 py-4 pl-14 bg-white/10 backdrop-blur-xl border-2 border-white/20 rounded-2xl text-white placeholder-slate-300 focus:outline-none focus:ring-4 focus:ring-green-500/30 focus:border-green-400 transition-all duration-300 text-lg"
              />
              <svg className="absolute left-5 top-1/2 transform -translate-y-1/2 w-6 h-6 text-slate-400 group-focus-within:text-green-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Modern Filter Toggle */}
          <div className="flex justify-center mb-8">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-3 px-6 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all duration-300 group"
            >
              <svg className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
              </svg>
              <span className="font-medium">Advanced Filters</span>
              <svg className={`w-4 h-4 transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Redesigned Filter Bar */}
      {showFilters && (
        <div className="container mx-auto px-4 mb-8">
          <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 md:p-6">
            {/* Category */}
            <div className="flex flex-col w-full md:w-72">
              <label className="text-xs font-semibold text-white mb-1">Category</label>
                          <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all duration-300"
            >
              <option value="" className="bg-slate-800 text-white">All Categories</option>
              {availableFilters.categories.map(category => (
                <option key={category} value={category} className="bg-slate-800 text-white">{category}</option>
              ))}
            </select>
            </div>
            {/* Condition */}
            <div className="flex flex-col w-full md:w-72">
              <label className="text-xs font-semibold text-white mb-1">Condition</label>
                          <select
              value={filters.condition}
              onChange={(e) => handleFilterChange('condition', e.target.value)}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all duration-300"
            >
              <option value="" className="bg-slate-800 text-white">All Conditions</option>
              {availableFilters.conditions.map(condition => (
                <option key={condition} value={condition} className="bg-slate-800 text-white">{condition}</option>
              ))}
            </select>
            </div>
            {/* Sort By */}
            <div className="flex flex-col w-full md:w-60">
              <label className="text-xs font-semibold text-white mb-1">Sort By</label>
                          <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all duration-300"
            >
              <option value="createdAt" className="bg-slate-800 text-white">Date Added</option>
              <option value="price" className="bg-slate-800 text-white">Price</option>
              <option value="title" className="bg-slate-800 text-white">Title</option>
            </select>
            </div>
            {/* Min Price */}
            <div className="flex flex-col w-full md:w-56">
              <label className="text-xs font-semibold text-white mb-1">Min Price</label>
              <input
                type="number"
                placeholder="Min"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-400 transition-all duration-300"
              />
            </div>
            {/* Max Price */}
            <div className="flex flex-col w-full md:w-56">
              <label className="text-xs font-semibold text-white mb-1">Max Price</label>
              <input
                type="number"
                placeholder="Max"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-400 transition-all duration-300"
              />
            </div>
            {/* Clear Button */}
            <div className="flex flex-col justify-end w-full md:w-auto">
              <button
                onClick={clearFilters}
                className="px-6 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 rounded-xl transition-all duration-300 font-medium mt-2 md:mt-0"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results Info */}
      <div className="container mx-auto px-4 mb-8">
        <div className="flex items-center justify-between">
          <p className="text-slate-300">
            Showing {items.length} of {pagination.totalItems} items
          </p>
          <div className="flex items-center space-x-3">
            <span className="text-slate-300">Sort:</span>
            <button
              onClick={() => handleFilterChange('sortOrder', filters.sortOrder === 'desc' ? 'asc' : 'desc')}
              className="flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all duration-300"
            >
              <span>{filters.sortOrder === 'desc' ? 'Newest' : 'Oldest'}</span>
              <svg className={`w-4 h-4 transform ${filters.sortOrder === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="container mx-auto px-4 mb-8">
          <div className="bg-red-900/50 border border-red-500 rounded-xl p-6">
            <p className="text-red-200">{error}</p>
          </div>
        </div>
      )}

      {/* Modern Items Grid */}
      <div className="container mx-auto px-4 pb-12">
        {items.length === 0 && !loading ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 text-slate-400">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-white mb-3">No items found</h3>
            <p className="text-slate-400">Try adjusting your filters or search terms</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item, idx) => (
              <div
                key={item._id || item.id || idx}
                onClick={() => {
                  const itemId = item._id || item.id;
                  if (itemId) {
                    navigate(`/product/${itemId}`);
                  } else {
                    console.error('No ID found for item:', item);
                  }
                }}
                className="group relative bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl hover:shadow-green-500/25 transition-all duration-500 hover:scale-105 cursor-pointer transform hover:-translate-y-3 animate-fade-in-up"
              >
                {/* Background Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Image Container */}
                <div className="relative h-72 overflow-hidden">
                  {item.images && item.images[0] ? (
                    <img 
                      src={item.images[0]} 
                      alt={item.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-600">
                      <svg className="w-20 h-20 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Top Badges */}
                  <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                    {/* Flagged Badge */}
                    {item.flagged && (
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-500/90 backdrop-blur-sm text-white shadow-lg border border-red-400/30">
                        Flagged
                      </span>
                    )}
                    
                    {/* Price Badge */}
                    <div className="px-4 py-2 bg-gradient-to-r from-green-600/90 to-emerald-600/90 backdrop-blur-sm rounded-full text-white text-sm font-bold shadow-lg border border-green-400/30">
                      ₹{item.price}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="relative p-6">
                  {/* Title */}
                  <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-green-300 transition-colors duration-300">
                    {item.title}
                  </h3>
                  
                  {/* Essential Info */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-slate-300 text-sm">{item.brand || 'Unknown'}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-300 text-sm">{item.size}</span>
                    </div>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getConditionColor(item.condition)}`}>
                      {item.condition}
                    </span>
                  </div>

                  {/* Price Display */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                        ₹{item.price}
                      </span>
                      <span className="text-slate-400 text-sm">+{Math.floor(item.price * 0.05)} coins</span>
                    </div>
                    <div className="text-slate-400 text-sm">
                      View Details →
                    </div>
                  </div>

                  {/* Buy Now Button - Temporarily disabled */}
                  <button
                    onClick={() => toast.info('Payment functionality coming soon!')}
                    className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 cursor-not-allowed shadow-lg opacity-75"
                  >
                    Coming Soon
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modern Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center mt-12 space-x-3">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPrevPage}
              className="px-6 py-3 bg-white/10 backdrop-blur-xl border border-white/20 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-all duration-300"
            >
              Previous
            </button>
            
            <div className="flex space-x-2">
              {(() => {
                const totalPages = pagination.totalPages;
                const currentPage = pagination.currentPage;
                const maxVisible = 7;
                
                let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
                let endPage = Math.min(totalPages, startPage + maxVisible - 1);
                
                if (endPage - startPage + 1 < maxVisible) {
                  startPage = Math.max(1, endPage - maxVisible + 1);
                }
                
                const pages = [];
                for (let i = startPage; i <= endPage; i++) {
                  pages.push(i);
                }
                
                return pages.map(page => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-4 py-3 rounded-xl transition-all duration-300 ${
                      page === currentPage
                        ? 'bg-green-600 text-white'
                        : 'bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-white/20'
                    }`}
                  >
                    {page}
                  </button>
                ));
              })()}
            </div>

            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNextPage}
              className="px-6 py-3 bg-white/10 backdrop-blur-xl border border-white/20 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-all duration-300"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Payment Modal temporarily disabled */}
    </div>
  );
};

export default BrowseItems; 