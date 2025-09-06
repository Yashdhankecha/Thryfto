import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';


const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [stats, setStats] = useState([
    { label: 'Total Users', value: 0, icon: '👥', color: 'from-emerald-500 to-emerald-700', hover: 'hover:from-emerald-600 hover:to-emerald-800' },
    { label: 'Total Items', value: 0, icon: '📦', color: 'from-green-500 to-green-700', hover: 'hover:from-green-600 hover:to-green-800' },
    { label: 'Pending Items', value: 0, icon: '⏳', color: 'from-blue-500 to-blue-700', hover: 'hover:from-blue-600 hover:to-blue-800' },
  ]);
  const [recentItems, setRecentItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Role-based redirect: only 'admin' role allowed
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, user?.role, navigate]);

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Fetch admin statistics
      const statsResponse = await axios.get('http://localhost:5000/api/admin/stats', { headers });
      const { stats, recentItems, recentUsers } = statsResponse.data;

      setStats([
        { label: 'Total Users', value: stats.totalUsers, icon: '👥', color: 'from-emerald-500 to-emerald-700', hover: 'hover:from-emerald-600 hover:to-emerald-800' },
        { label: 'Total Items', value: stats.totalItems, icon: '📦', color: 'from-green-500 to-green-700', hover: 'hover:from-green-600 hover:to-green-800' },
        { label: 'Pending Items', value: stats.pendingItems, icon: '⏳', color: 'from-blue-500 to-blue-700', hover: 'hover:from-blue-600 hover:to-blue-800' },
      ]);

      // Set recent items (pending items for approval)
      setRecentItems(recentItems);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleApproveItem = async (itemId) => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const response = await axios.put(`http://localhost:5000/api/admin/items/${itemId}/approve`, {}, { headers });
      toast.success('Item approved successfully!');
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error approving item:', error);
      toast.error(error.response?.data?.error || 'Failed to approve item');
    }
  };

  const handleRejectItem = async (itemId) => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const response = await axios.put(`http://localhost:5000/api/admin/items/${itemId}/reject`, {}, { headers });
      toast.success('Item rejected successfully!');
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error rejecting item:', error);
      toast.error(error.response?.data?.error || 'Failed to reject item');
    }
  };


  return (
    <div className="min-h-screen w-screen overflow-x-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-green-900">
      {/* Full-width header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="px-6 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          </div>
        </div>
      </div>

      {/* Main content - full width */}
      <div className="p-6">
        {/* Stat Cards - Full width grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className={`rounded-2xl shadow-lg p-6 flex flex-col items-center bg-gradient-to-br ${stat.color} text-white transition-all duration-300 ${stat.hover} cursor-pointer group hover:scale-105`}>
              <div className="text-4xl mb-2 group-hover:scale-110 transition-transform duration-200">{stat.icon}</div>
              <div className="text-3xl font-bold group-hover:text-yellow-200 transition-colors duration-200">{stat.value}</div>
              <div className="text-lg mt-2 group-hover:underline">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Recent Items for Approval */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <span>📦</span> Recent Items - Pending Approval
          </h2>
          {loading ? (
            <div className="text-white/70 text-center py-8">Loading items...</div>
          ) : recentItems.length === 0 ? (
            <div className="text-white/70 text-center py-8">No items found.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentItems.map((item) => (
                <div key={item._id} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-bold text-white line-clamp-2">{item.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      item.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                      item.status === 'approved' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                      'bg-red-500/20 text-red-300 border border-red-500/30'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <p className="text-white/80 text-sm mb-4 line-clamp-2">{item.description}</p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-white font-semibold">₹{item.price}</span>
                    <span className="text-white/70 text-sm">{item.category}</span>
                  </div>
                  {item.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApproveItem(item._id)}
                        className="flex-1 bg-gradient-to-r from-green-600 to-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:from-green-700 hover:to-green-600 transition-all duration-300"
                      >
                        ✅ Approve
                      </button>
                      <button
                        onClick={() => handleRejectItem(item._id)}
                        className="flex-1 bg-gradient-to-r from-red-600 to-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:from-red-700 hover:to-red-600 transition-all duration-300"
                      >
                        ❌ Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>



      </div>
    </div>
  );
};

export default AdminDashboard; 