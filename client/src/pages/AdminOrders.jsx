import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

// API for fetching pending items
const fetchPendingItems = async (query = '', status = '', page = 1, limit = 8) => {
  try {
    const token = localStorage.getItem('token');
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    const params = new URLSearchParams({
      page: page,
      limit: limit,
      status: 'pending',
      ...(query && { search: query })
    });

    const response = await fetch(`http://localhost:5000/api/admin/items?${params}`, { headers });
    const data = await response.json();
    return { items: data.items || [], total: data.total || 0 };
  } catch (error) {
    console.error('Error fetching pending items:', error);
    return { items: [], total: 0 };
  }
};

const AdminOrders = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const limit = 8;

  // Role-based redirect: only 'admin' role allowed
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, user?.role, navigate]);

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  const fetchItemsData = async () => {
    setLoading(true);
    setError('');
    try {
      const { items, total } = await fetchPendingItems(search, statusFilter, page, limit);
      setItems(items);
      setTotal(total);
    } catch (err) {
      setError('Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItemsData();
    // eslint-disable-next-line
  }, [search, statusFilter, page]);

  const handleApproveItem = async (itemId) => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const response = await fetch(`http://localhost:5000/api/admin/items/${itemId}/approve`, {
        method: 'PUT',
        headers
      });

      if (response.ok) {
        toast.success('Item approved successfully!');
        fetchItemsData(); // Refresh the list
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to approve item');
      }
    } catch (error) {
      console.error('Error approving item:', error);
      toast.error('Failed to approve item');
    }
  };

  const handleRejectItem = async (itemId) => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const response = await fetch(`http://localhost:5000/api/admin/items/${itemId}/reject`, {
        method: 'PUT',
        headers
      });

      if (response.ok) {
        toast.success('Item rejected successfully!');
        fetchItemsData(); // Refresh the list
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to reject item');
      }
    } catch (error) {
      console.error('Error rejecting item:', error);
      toast.error('Failed to reject item');
    }
  };

  const handleView = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleExportData = () => {
    // Create CSV data
    const csvData = [
      ['Item ID', 'Title', 'Category', 'Price', 'Status', 'Seller', 'Date'],
      ...items.map(item => [
        item._id || item.id,
        item.title,
        item.category,
        `₹${item.price}`,
        item.status,
        item.seller?.name || 'N/A',
        item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'
      ])
    ];

    // Convert to CSV string
    const csvString = csvData.map(row => row.join(',')).join('\n');

    // Create and download file
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `pending_items_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Data exported successfully!');
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
        {/* Search & Filter Bar */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-6 border border-white/20">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col md:flex-row gap-4 flex-1">
              <input
                type="text"
                placeholder="Search by item title, category, or seller..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="w-full md:w-72 px-4 py-3 rounded-xl border border-emerald-200 focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none transition-all duration-300"
              />
              <div className="flex gap-2">
                <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="px-4 py-3 rounded-xl border border-emerald-200 focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none transition-all duration-300">
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleExportData}
              className="bg-gradient-to-r from-green-600 to-green-400 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition-all duration-300 hover:shadow-xl flex items-center gap-2"
            >
              <span>📊</span> Export Data
            </motion.button>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <span>📦</span> Item Management
          </h2>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-8">
              {[...Array(6)].map((_, i) => (
                <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} className="h-20 bg-white/20 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="text-red-300 text-center py-8">{error}</div>
          ) : items.length === 0 ? (
            <div className="text-white/70 text-center py-8">No pending items found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-emerald-100">
                <thead>
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Item ID</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Title</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Category</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Price</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <AnimatePresence initial={false}>
                  <tbody className="bg-white/5 divide-y divide-white/10">
                    {items.map((item) => (
                      <motion.tr
                        key={item._id || item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="hover:bg-white/10 transition-all duration-300"
                      >
                        <td className="px-6 py-4 whitespace-nowrap font-semibold text-white">{item._id?.slice(-8) || item.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-white/90 max-w-xs truncate">{item.title}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-white/90">{item.category}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-white/90">₹{item.price}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${item.status === 'approved' ? 'bg-green-500/20 text-green-300 border border-green-500/30' : item.status === 'rejected' ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-orange-500/20 text-orange-300 border border-orange-500/30'}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 shadow transition-all duration-300"
                            onClick={() => handleView(item)}
                          >
                            View
                          </motion.button>
                          {item.status === 'pending' && (
                            <>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 shadow transition-all duration-300"
                                onClick={() => handleApproveItem(item._id || item.id)}
                              >
                                Approve
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 shadow transition-all duration-300"
                                onClick={() => handleRejectItem(item._id || item.id)}
                              >
                                Reject
                              </motion.button>
                            </>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </AnimatePresence>
              </table>
            </div>
          )}
          {/* Pagination */}
          <div className="flex justify-between items-center mt-8">
            <div className="text-emerald-400 text-sm">Page {page} of {Math.ceil(total / limit) || 1}</div>
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="px-6 py-3 rounded-xl bg-emerald-100 text-emerald-700 font-bold disabled:opacity-50 transition-all duration-300"
              >
                Previous
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={page * limit >= total}
                onClick={() => setPage(page + 1)}
                className="px-6 py-3 rounded-xl bg-emerald-100 text-emerald-700 font-bold disabled:opacity-50 transition-all duration-300"
              >
                Next
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Item Details Modal */}
      {showModal && selectedItem && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-2xl p-8 w-full max-w-2xl relative border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="absolute top-4 right-4 text-white hover:text-white/70 text-2xl transition-colors duration-300" onClick={() => setShowModal(false)}>&times;</button>
            
            <div className="space-y-6">
              {/* Header */}
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">Item Details</h2>
                <div className="w-16 h-1 bg-gradient-to-r from-emerald-400 to-green-400 mx-auto rounded-full"></div>
              </div>

              {/* Item Image */}
              {selectedItem.images && selectedItem.images.length > 0 && (
                <div className="flex justify-center">
                  <img 
                    src={selectedItem.images[0]} 
                    alt={selectedItem.title}
                    className="w-32 h-32 object-cover rounded-xl shadow-lg"
                  />
                </div>
              )}

              {/* Item Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-white/70 text-sm font-medium">Item Title</label>
                    <p className="text-white font-semibold text-lg">{selectedItem.title}</p>
                  </div>
                  
                  <div>
                    <label className="text-white/70 text-sm font-medium">Category</label>
                    <p className="text-white">{selectedItem.category}</p>
                  </div>
                  
                  <div>
                    <label className="text-white/70 text-sm font-medium">Price</label>
                    <p className="text-white font-bold text-xl">₹{selectedItem.price}</p>
                  </div>
                  
                  <div>
                    <label className="text-white/70 text-sm font-medium">Condition</label>
                    <p className="text-white capitalize">{selectedItem.condition || 'N/A'}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-white/70 text-sm font-medium">Status</label>
                    <div className="mt-1">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${selectedItem.status === 'approved' ? 'bg-green-500/20 text-green-300 border border-green-500/30' : selectedItem.status === 'rejected' ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-orange-500/20 text-orange-300 border border-orange-500/30'}`}>
                        {selectedItem.status}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-white/70 text-sm font-medium">Seller</label>
                    <p className="text-white">{selectedItem.seller?.name || selectedItem.sellerName || 'N/A'}</p>
                  </div>
                  
                  <div>
                    <label className="text-white/70 text-sm font-medium">Item ID</label>
                    <p className="text-white font-mono text-sm">{selectedItem._id || selectedItem.id}</p>
                  </div>
                  
                  <div>
                    <label className="text-white/70 text-sm font-medium">Created Date</label>
                    <p className="text-white">{selectedItem.createdAt ? new Date(selectedItem.createdAt).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              {selectedItem.description && (
                <div>
                  <label className="text-white/70 text-sm font-medium">Description</label>
                  <p className="text-white mt-1 bg-white/5 p-4 rounded-xl border border-white/10">
                    {selectedItem.description}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              {selectedItem.status === 'pending' && (
                <div className="flex gap-4 justify-center pt-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-green-500 text-white px-6 py-3 rounded-xl hover:bg-green-600 shadow-lg transition-all duration-300"
                    onClick={() => { handleApproveItem(selectedItem._id || selectedItem.id); setShowModal(false); }}
                  >
                    Approve Item
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-red-500 text-white px-6 py-3 rounded-xl hover:bg-red-600 shadow-lg transition-all duration-300"
                    onClick={() => { handleRejectItem(selectedItem._id || selectedItem.id); setShowModal(false); }}
                  >
                    Reject Item
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default AdminOrders; 