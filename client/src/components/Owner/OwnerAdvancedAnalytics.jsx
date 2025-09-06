import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import { authAPI } from '../../services/api';

const tabs = [
  { key: 'date', label: 'Custom Date Range' },
  { key: 'retention', label: 'Retention & Churn' },
  { key: 'cohort', label: 'Cohort Analysis' },
  { key: 'funnel', label: 'Funnel Analysis' },
];

const chartColors = ['#fbbf24', '#6366f1', '#06b6d4', '#22c55e'];

// Helper: Format date as dd-MM-yyyy (Indian format)
function formatDateIndian(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
// Helper: Format number as Indian number system
function formatNumberIndian(num) {
  return Number(num).toLocaleString('en-IN');
}
// Helper: Format currency as INR
function formatCurrencyINR(num) {
  return Number(num).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 });
}

const OwnerAdvancedAnalytics = () => {
  const [activeTab, setActiveTab] = useState('date');
  // Date range state
  const [from, setFrom] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  const [to, setTo] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [chartData, setChartData] = useState([]);
  // Retention/Churn
  const [retentionData, setRetentionData] = useState([]);
  const [loadingRetention, setLoadingRetention] = useState(false);
  const [errorRetention, setErrorRetention] = useState('');
  // Cohort
  const [cohortData, setCohortData] = useState([]);
  const [loadingCohort, setLoadingCohort] = useState(false);
  const [errorCohort, setErrorCohort] = useState('');
  // Funnel
  const [funnelData, setFunnelData] = useState([]);
  const [loadingFunnel, setLoadingFunnel] = useState(false);
  const [errorFunnel, setErrorFunnel] = useState('');

  // Fetch analytics for date range
  const fetchDateRangeAnalytics = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await authAPI.getAnalyticsByDateRange(from.toISOString(), to.toISOString());
      setChartData(res.data || []);
    } catch (err) {
      setError('Failed to fetch analytics.');
      setChartData([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Retention/Churn
  const fetchRetention = async () => {
    setLoadingRetention(true); setErrorRetention('');
    try {
      const res = await authAPI.getRetentionAnalytics();
      setRetentionData(res.data || []);
    } catch (err) {
      setErrorRetention('Failed to fetch retention analytics.');
      setRetentionData([]);
    } finally { setLoadingRetention(false); }
  };
  // Fetch Cohort
  const fetchCohort = async () => {
    setLoadingCohort(true); setErrorCohort('');
    try {
      const res = await authAPI.getCohortAnalytics();
      setCohortData(res.data || []);
    } catch (err) {
      setErrorCohort('Failed to fetch cohort analytics.');
      setCohortData([]);
    } finally { setLoadingCohort(false); }
  };
  // Fetch Funnel
  const fetchFunnel = async () => {
    setLoadingFunnel(true); setErrorFunnel('');
    try {
      const res = await authAPI.getFunnelAnalytics();
      setFunnelData(res.data || []);
    } catch (err) {
      setErrorFunnel('Failed to fetch funnel analytics.');
      setFunnelData([]);
    } finally { setLoadingFunnel(false); }
  };

  return (
    <div className="w-full h-full p-8">
      <div className="flex gap-4 mb-8">
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`px-6 py-2 rounded-xl font-bold text-lg transition-all duration-200 ${activeTab === tab.key ? 'bg-gradient-to-r from-yellow-400 to-yellow-300 text-white shadow-lg' : 'bg-white/10 text-yellow-200 hover:bg-yellow-100/10'}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        {activeTab === 'date' && (
          <motion.div key="date" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.5 }} className="bg-white/20 backdrop-blur-xl rounded-2xl p-8 shadow-xl">
            <div className="text-2xl font-bold text-yellow-200 mb-4">Custom Date Range Analytics</div>
            <div className="flex flex-col md:flex-row gap-4 items-center mb-6">
              <div className="flex items-center gap-2">
                <span className="text-yellow-100 font-semibold">From:</span>
                <DatePicker
                  selected={from}
                  onChange={date => setFrom(date)}
                  selectsStart
                  startDate={from}
                  endDate={to}
                  className="rounded-lg px-3 py-2 border border-yellow-200 bg-white/80 text-yellow-900 font-semibold"
                  maxDate={to}
                  dateFormat="dd-MM-yyyy"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-yellow-100 font-semibold">To:</span>
                <DatePicker
                  selected={to}
                  onChange={date => setTo(date)}
                  selectsEnd
                  startDate={from}
                  endDate={to}
                  className="rounded-lg px-3 py-2 border border-yellow-200 bg-white/80 text-yellow-900 font-semibold"
                  minDate={from}
                  maxDate={new Date()}
                  dateFormat="dd-MM-yyyy"
                />
              </div>
              <button
                onClick={fetchDateRangeAnalytics}
                className="bg-gradient-to-r from-yellow-400 to-yellow-300 text-white px-6 py-2 rounded-xl font-bold shadow-lg transition-all duration-300 hover:shadow-2xl flex items-center gap-2 text-lg"
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Show Analytics'}
              </button>
            </div>
            {error && <div className="text-red-400 mb-4">{error}</div>}
            <div className="w-full h-72">
              {loading ? (
                <div className="text-yellow-200 text-lg flex items-center justify-center h-full">Loading chart...</div>
              ) : chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" stroke={chartColors[0]} tickFormatter={formatDateIndian} />
                    <YAxis stroke={chartColors[0]} tickFormatter={formatNumberIndian} />
                    <RechartsTooltip
                      formatter={(value, name) => [formatNumberIndian(value), name]}
                      labelFormatter={formatDateIndian}
                    />
                    <Line type="monotone" dataKey="value" stroke={chartColors[0]} strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 8 }} isAnimationActive />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-yellow-100 text-center">No data for selected range.</div>
              )}
            </div>
          </motion.div>
        )}
        {activeTab === 'retention' && (
          <motion.div key="retention" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.5 }} className="bg-white/20 backdrop-blur-xl rounded-2xl p-8 shadow-xl">
            <div className="text-2xl font-bold text-yellow-200 mb-4 flex items-center gap-4">Retention & Churn Analysis <button onClick={fetchRetention} className="ml-4 px-4 py-1 rounded-lg bg-yellow-400 text-white font-bold">Refresh</button></div>
            {errorRetention && <div className="text-red-400 mb-4">{errorRetention}</div>}
            <div className="w-full h-72">
              {loadingRetention ? (
                <div className="text-yellow-200 text-lg flex items-center justify-center h-full">Loading chart...</div>
              ) : retentionData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={retentionData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" stroke={chartColors[1]} tickFormatter={formatDateIndian} />
                    <YAxis stroke={chartColors[1]} tickFormatter={formatNumberIndian} />
                    <RechartsTooltip formatter={formatNumberIndian} labelFormatter={formatDateIndian} />
                    <Bar dataKey="retained" fill={chartColors[1]} name="Retained" />
                    <Bar dataKey="churned" fill={chartColors[2]} name="Churned" />
                    <Legend />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-yellow-100 text-center">No data available.</div>
              )}
            </div>
          </motion.div>
        )}
        {activeTab === 'cohort' && (
          <motion.div key="cohort" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.5 }} className="bg-white/20 backdrop-blur-xl rounded-2xl p-8 shadow-xl">
            <div className="text-2xl font-bold text-yellow-200 mb-4 flex items-center gap-4">Cohort Analysis <button onClick={fetchCohort} className="ml-4 px-4 py-1 rounded-lg bg-yellow-400 text-white font-bold">Refresh</button></div>
            {errorCohort && <div className="text-red-400 mb-4">{errorCohort}</div>}
            <div className="w-full h-72">
              {loadingCohort ? (
                <div className="text-yellow-200 text-lg flex items-center justify-center h-full">Loading chart...</div>
              ) : cohortData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={cohortData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="cohort" stroke={chartColors[2]} tickFormatter={formatDateIndian} />
                    <YAxis stroke={chartColors[2]} tickFormatter={formatNumberIndian} />
                    <RechartsTooltip formatter={formatNumberIndian} labelFormatter={formatDateIndian} />
                    <Line type="monotone" dataKey="retention" stroke={chartColors[2]} strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 8 }} isAnimationActive />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-yellow-100 text-center">No data available.</div>
              )}
            </div>
          </motion.div>
        )}
        {activeTab === 'funnel' && (
          <motion.div key="funnel" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.5 }} className="bg-white/20 backdrop-blur-xl rounded-2xl p-8 shadow-xl">
            <div className="text-2xl font-bold text-yellow-200 mb-4 flex items-center gap-4">Funnel Analysis <button onClick={fetchFunnel} className="ml-4 px-4 py-1 rounded-lg bg-yellow-400 text-white font-bold">Refresh</button></div>
            {errorFunnel && <div className="text-red-400 mb-4">{errorFunnel}</div>}
            <div className="w-full h-72">
              {loadingFunnel ? (
                <div className="text-yellow-200 text-lg flex items-center justify-center h-full">Loading chart...</div>
              ) : funnelData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={funnelData} dataKey="value" nameKey="stage" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${formatNumberIndian(value)}`}> 
                      {funnelData.map((entry, idx) => <Cell key={idx} fill={chartColors[idx % chartColors.length]} />)}
                    </Pie>
                    <RechartsTooltip formatter={formatNumberIndian} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-yellow-100 text-center">No data available.</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OwnerAdvancedAnalytics; 