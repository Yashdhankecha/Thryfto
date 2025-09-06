import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { authAPI } from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

function formatDateIndian(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
function formatNumberIndian(num) {
  return Number(num).toLocaleString('en-IN');
}
function formatCurrencyINR(num) {
  return Number(num).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 });
}

const tabs = [
  { key: 'transactions', label: 'Transactions' },
  { key: 'revenue', label: 'Revenue & Fees' },
  { key: 'payouts', label: 'Payouts' },
  { key: 'refunds', label: 'Refunds & Disputes' },
];

const chartColors = ['#22c55e', '#fbbf24', '#6366f1', '#ef4444'];

const OwnerFinancialReports = () => {
  const [activeTab, setActiveTab] = useState('transactions');
  // Transactions
  const [transactions, setTransactions] = useState([]);
  const [loadingTx, setLoadingTx] = useState(false);
  const [errorTx, setErrorTx] = useState('');
  // Revenue
  const [revenueData, setRevenueData] = useState([]);
  const [loadingRevenue, setLoadingRevenue] = useState(false);
  const [errorRevenue, setErrorRevenue] = useState('');
  // Payouts
  const [payouts, setPayouts] = useState([]);
  const [loadingPayouts, setLoadingPayouts] = useState(false);
  const [errorPayouts, setErrorPayouts] = useState('');
  // Refunds
  const [refunds, setRefunds] = useState([]);
  const [loadingRefunds, setLoadingRefunds] = useState(false);
  const [errorRefunds, setErrorRefunds] = useState('');

  // Fetchers (now use real API)
  const fetchTransactions = async () => {
    setLoadingTx(true); setErrorTx('');
    try {
      const res = await authAPI.getOwnerTransactions();
      setTransactions(res.data || []);
    } catch (err) {
      setErrorTx('Failed to fetch transactions.');
      setTransactions([]);
    } finally { setLoadingTx(false); }
  };
  const fetchRevenue = async () => {
    setLoadingRevenue(true); setErrorRevenue('');
    try {
      const res = await authAPI.getOwnerRevenue();
      setRevenueData(res.data || []);
    } catch (err) {
      setErrorRevenue('Failed to fetch revenue.');
      setRevenueData([]);
    } finally { setLoadingRevenue(false); }
  };
  const fetchPayouts = async () => {
    setLoadingPayouts(true); setErrorPayouts('');
    try {
      const res = await authAPI.getOwnerPayouts();
      setPayouts(res.data || []);
    } catch (err) {
      setErrorPayouts('Failed to fetch payouts.');
      setPayouts([]);
    } finally { setLoadingPayouts(false); }
  };
  const fetchRefunds = async () => {
    setLoadingRefunds(true); setErrorRefunds('');
    try {
      const res = await authAPI.getOwnerRefunds();
      setRefunds(res.data || []);
    } catch (err) {
      setErrorRefunds('Failed to fetch refunds.');
      setRefunds([]);
    } finally { setLoadingRefunds(false); }
  };

  // Helper to map transaction data
  function mapTransaction(tx) {
    return {
      id: tx._id || tx.id,
      date: tx.createdAt || tx.date,
      amount: tx.offerAmount || tx.amount,
      status: tx.status || (tx.refunded ? 'Refunded' : ''),
      name: tx.buyer?.name || tx.seller?.name || tx.item?.title || ''
    };
  }
  // Helper to map payout data
  function mapPayout(p) {
    return {
      id: p.seller?._id || p.seller || p._id || p.id,
      date: p.lastPayout || p.date || p.createdAt,
      amount: p.amount || p.total,
      status: 'Paid',
      name: p.seller?.name || ''
    };
  }
  // Helper to map refund data
  function mapRefund(r) {
    return {
      id: r._id || r.id,
      date: r.createdAt || r.date,
      amount: r.offerAmount || r.amount,
      status: r.status || 'Refunded',
      name: r.buyer?.name || r.seller?.name || ''
    };
  }

  return (
    <div className="w-full h-full p-8">
      <div className="flex gap-4 mb-8">
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`px-6 py-2 rounded-xl font-bold text-lg transition-all duration-200 ${activeTab === tab.key ? 'bg-gradient-to-r from-green-400 to-green-300 text-white shadow-lg' : 'bg-white/10 text-green-200 hover:bg-green-100/10'}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        {activeTab === 'transactions' && (
          <motion.div key="transactions" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.5 }} className="bg-white/20 backdrop-blur-xl rounded-2xl p-8 shadow-xl">
            <div className="text-2xl font-bold text-green-200 mb-4 flex items-center gap-4">Transactions <button onClick={fetchTransactions} className="ml-4 px-4 py-1 rounded-lg bg-green-400 text-white font-bold">Refresh</button></div>
            {errorTx && <div className="text-red-400 mb-4">{errorTx}</div>}
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-green-100">
                <thead>
                  <tr className="border-b border-green-300">
                    <th className="px-4 py-2">ID</th>
                    <th className="px-4 py-2">Name</th>
                    <th className="px-4 py-2">Date</th>
                    <th className="px-4 py-2">Amount</th>
                    <th className="px-4 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(tx => {
                    const t = mapTransaction(tx);
                    return (
                      <tr key={t.id} className="border-b border-green-900/30">
                        <td className="px-4 py-2">{t.id}</td>
                        <td className="px-4 py-2">{t.name}</td>
                        <td className="px-4 py-2">{formatDateIndian(t.date)}</td>
                        <td className="px-4 py-2">{formatCurrencyINR(t.amount)}</td>
                        <td className="px-4 py-2">{t.status}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
        {activeTab === 'revenue' && (
          <motion.div key="revenue" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.5 }} className="bg-white/20 backdrop-blur-xl rounded-2xl p-8 shadow-xl">
            <div className="text-2xl font-bold text-green-200 mb-4 flex items-center gap-4">Revenue & Fees <button onClick={fetchRevenue} className="ml-4 px-4 py-1 rounded-lg bg-green-400 text-white font-bold">Refresh</button></div>
            {errorRevenue && <div className="text-red-400 mb-4">{errorRevenue}</div>}
            <div className="w-full h-72">
              {loadingRevenue ? (
                <div className="text-green-200 text-lg flex items-center justify-center h-full">Loading chart...</div>
              ) : revenueData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" stroke={chartColors[0]} tickFormatter={formatDateIndian} />
                    <YAxis stroke={chartColors[0]} tickFormatter={formatCurrencyINR} />
                    <RechartsTooltip formatter={formatCurrencyINR} labelFormatter={formatDateIndian} />
                    <Bar dataKey="revenue" fill={chartColors[0]} name="Revenue" />
                    <Bar dataKey="fees" fill={chartColors[1]} name="Fees" />
                    <Legend />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-green-100 text-center">No data available.</div>
              )}
            </div>
          </motion.div>
        )}
        {activeTab === 'payouts' && (
          <motion.div key="payouts" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.5 }} className="bg-white/20 backdrop-blur-xl rounded-2xl p-8 shadow-xl">
            <div className="text-2xl font-bold text-green-200 mb-4 flex items-center gap-4">Payouts <button onClick={fetchPayouts} className="ml-4 px-4 py-1 rounded-lg bg-green-400 text-white font-bold">Refresh</button></div>
            {errorPayouts && <div className="text-red-400 mb-4">{errorPayouts}</div>}
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-green-100">
                <thead>
                  <tr className="border-b border-green-300">
                    <th className="px-4 py-2">ID</th>
                    <th className="px-4 py-2">Name</th>
                    <th className="px-4 py-2">Date</th>
                    <th className="px-4 py-2">Amount</th>
                    <th className="px-4 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map(p => {
                    const pay = mapPayout(p);
                    return (
                      <tr key={pay.id} className="border-b border-green-900/30">
                        <td className="px-4 py-2">{pay.id}</td>
                        <td className="px-4 py-2">{pay.name}</td>
                        <td className="px-4 py-2">{formatDateIndian(pay.date)}</td>
                        <td className="px-4 py-2">{formatCurrencyINR(pay.amount)}</td>
                        <td className="px-4 py-2">{pay.status}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
        {activeTab === 'refunds' && (
          <motion.div key="refunds" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.5 }} className="bg-white/20 backdrop-blur-xl rounded-2xl p-8 shadow-xl">
            <div className="text-2xl font-bold text-green-200 mb-4 flex items-center gap-4">Refunds & Disputes <button onClick={fetchRefunds} className="ml-4 px-4 py-1 rounded-lg bg-green-400 text-white font-bold">Refresh</button></div>
            {errorRefunds && <div className="text-red-400 mb-4">{errorRefunds}</div>}
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-green-100">
                <thead>
                  <tr className="border-b border-green-300">
                    <th className="px-4 py-2">ID</th>
                    <th className="px-4 py-2">Name</th>
                    <th className="px-4 py-2">Date</th>
                    <th className="px-4 py-2">Amount</th>
                    <th className="px-4 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {refunds.map(r => {
                    const ref = mapRefund(r);
                    return (
                      <tr key={ref.id} className="border-b border-green-900/30">
                        <td className="px-4 py-2">{ref.id}</td>
                        <td className="px-4 py-2">{ref.name}</td>
                        <td className="px-4 py-2">{formatDateIndian(ref.date)}</td>
                        <td className="px-4 py-2">{formatCurrencyINR(ref.amount)}</td>
                        <td className="px-4 py-2">{ref.status}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OwnerFinancialReports; 