import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { authAPI } from '../../services/api';

function formatDateIndian(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' });
}

const OwnerAuditLogs = () => {
  const [search, setSearch] = useState('');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    authAPI.getOwnerAuditLogs()
      .then(res => setLogs(res.logs || []))
      .catch(() => setError('Failed to fetch audit logs.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = logs.filter(l =>
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    (l.user?.name?.toLowerCase() || '').includes(search.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.5 }} className="w-full h-full p-8 bg-white/20 backdrop-blur-xl rounded-2xl shadow-xl">
      <div className="text-2xl font-bold text-blue-200 mb-4">Audit Logs</div>
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search logs..." className="mb-4 px-4 py-2 rounded-lg border border-blue-200 bg-white/80 text-blue-900 font-semibold" />
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-blue-100">
          <thead>
            <tr className="border-b border-blue-300">
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Action</th>
              <th className="px-4 py-2">Date/Time</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" className="text-blue-200 text-center py-4">Loading...</td></tr>
            ) : error ? (
              <tr><td colSpan="4" className="text-red-400 text-center py-4">{error}</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan="4" className="text-blue-100 text-center py-4">No logs found.</td></tr>
            ) : filtered.map(log => (
              <tr key={log._id} className="border-b border-blue-900/30">
                <td className="px-4 py-2">{log._id}</td>
                <td className="px-4 py-2">{log.user?.name || '-'}</td>
                <td className="px-4 py-2">{log.action}</td>
                <td className="px-4 py-2">{formatDateIndian(log.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default OwnerAuditLogs; 