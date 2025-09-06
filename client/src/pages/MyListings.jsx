import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const MyListings = () => {
  const { user, isAuthenticated } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Role-based redirect: only 'user' role allowed
  if (isAuthenticated && user?.role !== 'user') {
    if (user?.role === 'admin') {
      window.location.replace('/admin/dashboard');
      return null;
    }
    return null;
  }

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/dashboard/my-listings');
        setListings(response.data.data || []);
      } catch (err) {
        setError('Failed to load your listings');
        console.error('Error fetching listings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  const handleDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    
    try {
      await axios.delete(`/api/dashboard/items/${itemId}`);
      setListings(listings.filter(item => item._id !== itemId));
    } catch (err) {
      setError('Failed to delete item');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-500', text: 'Pending' },
      approved: { color: 'bg-green-500', text: 'Approved' },
      rejected: { color: 'bg-red-500', text: 'Rejected' },
      sold: { color: 'bg-blue-500', text: 'Sold' }
    };
    
    const config = statusConfig[status] || { color: 'bg-gray-500', text: 'Unknown' };
    
    return (
      <span className={`${config.color} text-white text-xs px-2 py-1 rounded-full`}>
        {config.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading your listings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">My Listings</h1>
          <p className="text-slate-300 text-lg">
            Manage your listed items and track their status
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-600 text-white p-4 rounded-lg mb-6 text-center">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 text-center border border-slate-600">
            <div className="text-3xl font-bold text-white mb-2">{listings.length}</div>
            <div className="text-slate-400">Total Items</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 text-center border border-slate-600">
            <div className="text-3xl font-bold text-white mb-2">
              {listings.filter(item => item.status === 'approved').length}
            </div>
            <div className="text-slate-400">Approved</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 text-center border border-slate-600">
            <div className="text-3xl font-bold text-white mb-2">
              {listings.filter(item => item.status === 'pending').length}
            </div>
            <div className="text-slate-400">Pending</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 text-center border border-slate-600">
            <div className="text-3xl font-bold text-white mb-2">
              {listings.filter(item => item.status === 'sold').length}
            </div>
            <div className="text-slate-400">Sold</div>
          </div>
        </div>

        {/* Listings Grid */}
        {listings.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-2xl font-semibold text-white mb-2">No Listings Yet</h3>
            <p className="text-slate-400 mb-6">
              Start by listing your first item to join the community!
            </p>
            <a
              href="/list"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300"
            >
              List Your First Item
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {listings.map((item) => (
              <div
                key={item._id}
                className="bg-slate-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-slate-600 hover:border-blue-500 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
              >
                {/* Image */}
                <div className="h-48 overflow-hidden">
                  <img
                    src={item.images[0] || 'https://via.placeholder.com/300x200?text=No+Image'}
                    alt={item.title}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                  />
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-white truncate flex-1">
                      {item.title}
                    </h3>
                    {getStatusBadge(item.status)}
                  </div>

                  <p className="text-slate-400 text-sm mb-3 line-clamp-2">
                    {item.description}
                  </p>

                  <div className="flex items-center justify-between text-sm text-slate-300 mb-4">
                    <span>{item.brand || 'No Brand'}</span>
                    <span>{item.size}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-blue-400 font-semibold">
                      {item.points} points
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyListings; 