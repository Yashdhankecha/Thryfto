import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { userAPI } from '../services/api';

// Mock API for demonstration
const mockFetchUsers = async (query = '', role = '', status = '', page = 1, limit = 8) => {
  // Simulate network delay
  await new Promise(res => setTimeout(res, 500));
  // Mock data
  const allUsers = [
    { id: 'USR001', name: 'Alice', email: 'alice@example.com', role: 'user', status: 'Active' },
    { id: 'USR002', name: 'Bob', email: 'bob@example.com', role: 'admin', status: 'Active' },
    { id: 'USR003', name: 'Charlie', email: 'charlie@example.com', role: 'user', status: 'Suspended' },
    { id: 'USR004', name: 'Diana', email: 'diana@example.com', role: 'user', status: 'Active' },
    { id: 'USR005', name: 'Eve', email: 'eve@example.com', role: 'user', status: 'Active' },
    { id: 'USR006', name: 'Frank', email: 'frank@example.com', role: 'user', status: 'Suspended' },
    { id: 'USR007', name: 'Grace', email: 'grace@example.com', role: 'user', status: 'Active' },
    { id: 'USR008', name: 'Henry', email: 'henry@example.com', role: 'user', status: 'Active' },
    { id: 'USR009', name: 'Ivy', email: 'ivy@example.com', role: 'user', status: 'Active' },
    { id: 'USR010', name: 'Jack', email: 'jack@example.com', role: 'user', status: 'Active' },
  ];
  let filtered = allUsers.filter(u =>
    (!query || u.name.toLowerCase().includes(query.toLowerCase()) || u.email.toLowerCase().includes(query.toLowerCase())) &&
    (!role || u.role === role) &&
    (!status || u.status === status)
  );
  const total = filtered.length;
  filtered = filtered.slice((page - 1) * limit, page * limit);
  return { users: filtered, total };
};

const AdminUsers = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', email: '', role: 'user', status: 'Active' });
  const [addLoading, setAddLoading] = useState(false);
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

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const params = new URLSearchParams({
        page: page,
        limit: limit,
        ...(search && { search }),
        ...(roleFilter && { role: roleFilter }),
        ...(statusFilter && { status: statusFilter })
      });

      const response = await axios.get(`http://localhost:5000/api/admin/users?${params}`, { headers });
      setUsers(response.data.users);
      setTotal(response.data.total);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, [search, roleFilter, statusFilter, page]);

  const handleBan = async (user) => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      await axios.put(`http://localhost:5000/api/admin/users/${user.id || user._id}/status`, 
        { isActive: false }, { headers });
      toast.success(`${user.name} has been banned`);
      fetchUsers();
    } catch (error) {
      console.error('Error banning user:', error);
      toast.error('Failed to ban user');
    }
  };

  const handleReactivate = async (user) => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      await axios.put(`http://localhost:5000/api/admin/users/${user.id || user._id}/status`, 
        { isActive: true }, { headers });
      toast.success(`${user.name} has been reactivated`);
      fetchUsers();
    } catch (error) {
      console.error('Error reactivating user:', error);
      toast.error('Failed to reactivate user');
    }
  };
  const handleView = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setAddLoading(true);
    await new Promise(res => setTimeout(res, 800));
    toast.success(`${addForm.name} added (mock)`);
    setShowAddModal(false);
    setAddForm({ name: '', email: '', role: 'user', status: 'Active' });
    setAddLoading(false);
    fetchUsers();
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      await axios.put(`http://localhost:5000/api/admin/users/${userId}/role`, 
        { role: newRole }, { headers });
      toast.success('Role updated');
      fetchUsers();
      if (selectedUser && (selectedUser.id === userId || selectedUser._id === userId)) {
        setSelectedUser({ ...selectedUser, role: newRole });
      }
    } catch (err) {
      console.error('Error updating role:', err);
      toast.error(err.response?.data?.error || 'Failed to update role');
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
        {/* Search & Filter Bar */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-6 border border-white/20">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col md:flex-row gap-4 flex-1">
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="w-full md:w-72 px-4 py-3 rounded-xl border border-emerald-200 focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none transition-all duration-300"
              />
              <div className="flex gap-2">
                <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }} className="px-4 py-3 rounded-xl border border-emerald-200 focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none transition-all duration-300">
                  <option value="">All Roles</option>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
                <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="px-4 py-3 rounded-xl border border-emerald-200 focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none transition-all duration-300">
                  <option value="">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <span>👥</span> User Management
          </h2>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-8">
              {[...Array(6)].map((_, i) => (
                <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} className="h-20 bg-white/20 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="text-red-300 text-center py-8">{error}</div>
          ) : users.length === 0 ? (
            <div className="text-white/70 text-center py-8">No users found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-emerald-100">
                <thead>
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">User ID</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Name</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Role</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <AnimatePresence initial={false}>
                  <tbody className="bg-white/5 divide-y divide-white/10">
                    {users.map((u) => (
                      <motion.tr
                        key={u.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="hover:bg-white/10 transition-all duration-300"
                      >
                        <td className="px-6 py-4 whitespace-nowrap font-semibold text-white">{u.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-white/90">{u.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-white/90">{u.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${u.role === 'admin' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${u.isActive ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}`}>
                            {u.isActive ? 'Active' : 'Banned'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 shadow transition-all duration-300"
                            onClick={() => handleView(u)}
                          >
                            View
                          </motion.button>
                          {u.isActive ? (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 shadow transition-all duration-300"
                              onClick={() => handleBan(u)}
                            >
                              Ban
                            </motion.button>
                          ) : (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 shadow transition-all duration-300"
                              onClick={() => handleReactivate(u)}
                            >
                              Reactivate
                            </motion.button>
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
            <div className="text-white/70 text-sm">Page {page} of {Math.ceil(total / limit) || 1}</div>
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="px-6 py-3 rounded-xl bg-white/10 text-white font-bold disabled:opacity-50 transition-all duration-300 border border-white/20"
              >
                Previous
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={page * limit >= total}
                onClick={() => setPage(page + 1)}
                className="px-6 py-3 rounded-xl bg-white/10 text-white font-bold disabled:opacity-50 transition-all duration-300 border border-white/20"
              >
                Next
              </motion.button>
            </div>
          </div>
        </div>
      </div>


      {/* User Modal */}
      {showModal && selectedUser && (
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
            className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-2xl p-8 w-full max-w-md relative border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="absolute top-4 right-4 text-white/70 hover:text-white text-2xl transition-colors duration-300" onClick={() => setShowModal(false)}>&times;</button>
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white font-bold text-3xl shadow-lg">
                {selectedUser.name[0].toUpperCase()}
              </div>
              <div className="text-xl font-bold text-white">{selectedUser.name}</div>
              <div className="text-white/80 font-medium">{selectedUser.email}</div>
              <div className="flex gap-2 mt-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${selectedUser.role === 'admin' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : selectedUser.role === 'owner' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}`}>
                  {selectedUser.role}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${selectedUser.isActive ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}`}>
                  {selectedUser.isActive ? 'Active' : 'Banned'}
                </span>
              </div>
              {/* Role change dropdown for admins */}
              {user?.role === 'admin' && (
                <div className="mt-4 w-full">
                  <label className="block text-sm font-medium text-white mb-2">Change Role</label>
                  <select
                    value={selectedUser.role}
                    onChange={e => handleRoleChange(selectedUser.id || selectedUser._id, e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none transition-all duration-300"
                  >
                    <option value="user" className="bg-slate-800 text-white">User</option>
                    <option value="admin" className="bg-slate-800 text-white">Admin</option>
                  </select>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}

    </div>
  );
};

export default AdminUsers; 