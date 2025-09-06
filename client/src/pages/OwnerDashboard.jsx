import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import jsPDF from 'jspdf';
import {
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { motion } from 'framer-motion';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import OwnerSidebar from '../components/Owner/OwnerSidebar';
import OwnerAdvancedAnalytics from '../components/Owner/OwnerAdvancedAnalytics';
import OwnerFinancialReports from '../components/Owner/OwnerFinancialReports';
import OwnerAuditLogs from '../components/Owner/OwnerAuditLogs';
import OwnerIntegrations from '../components/Owner/OwnerIntegrations';
import OwnerCustomDashboard from '../components/Owner/OwnerCustomDashboard';

const COLORS = ['#6366f1', '#f59e42', '#22c55e', '#eab308', '#ef4444', '#0ea5e9'];

// New color palette for charts
const CHART_COLORS = ['#2563eb', '#06b6d4', '#a78bfa', '#f59e42', '#22c55e', '#fbbf24', '#6366f1', '#0ea5e9'];

const statCardStyle =
  'flex flex-col items-center justify-center bg-gradient-to-br from-yellow-400 via-yellow-200 to-yellow-100 shadow-xl rounded-2xl p-8 w-full h-full';

const STAT_CARD_BG = 'bg-gradient-to-br from-blue-600 via-blue-500 to-blue-400 text-white shadow-2xl rounded-2xl p-8 w-full h-full border-0';

// Stat card style for minimal, elegant look
const STAT_CARD_MINIMAL = 'flex flex-col items-center justify-center bg-white shadow-lg rounded-2xl p-8 w-full h-full border border-slate-100 transition-all duration-200 hover:shadow-2xl hover:-translate-y-1';
const ICON_BG = 'flex items-center justify-center w-14 h-14 rounded-full mb-3 text-3xl';

// Highly transparent and more blurred glassmorphism style for chart cards
const GLASS_CARD = 'bg-white/20 backdrop-blur-[12px] border border-white/30 rounded-2xl shadow-xl p-8 flex flex-col items-center transition-all duration-300 hover:shadow-2xl hover:bg-white/30';

// Helper: Capitalize and format key
function formatKey(key) {
  return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

// Helper: Convert object to CSV with better formatting
function objectToCSV(obj) {
  if (!obj) return '';
  let csv = '';
  Object.entries(obj).forEach(([section, data]) => {
    csv += `# ${section.charAt(0).toUpperCase() + section.slice(1)}\n`;
    csv += Object.keys(data).map(formatKey).join(',') + '\n';
    csv += Object.values(data).join(',') + '\n\n';
  });
  return csv;
}

// Helper: Convert object to worksheet data for Excel with formatted headers
function objectToSheetData(obj) {
  if (!obj) return [];
  let sheets = {};
  Object.entries(obj).forEach(([section, data]) => {
    sheets[section.charAt(0).toUpperCase() + section.slice(1)] = [
      Object.keys(data).map(formatKey),
      Object.values(data)
    ];
  });
  return sheets;
}

// Helper: Format object for pretty JSON with capitalized keys
function formatObjectForJSON(obj) {
  if (!obj) return {};
  const formatted = {};
  Object.entries(obj).forEach(([section, data]) => {
    const sectionName = section.charAt(0).toUpperCase() + section.slice(1);
    formatted[sectionName] = {};
    Object.entries(data).forEach(([key, value]) => {
      formatted[formatKey(key)] = value;
    });
  });
  return formatted;
}

const OWNER_TABS = {
  analytics: OwnerAdvancedAnalytics,
  reports: OwnerFinancialReports,
  logs: OwnerAuditLogs,
  integrations: OwnerIntegrations,
  custom: OwnerCustomDashboard,
  legacy: null // fallback for old dashboard
};

const OwnerDashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [platformStats, setPlatformStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [detailedAnalytics, setDetailedAnalytics] = useState(null);
  const [loadingDetailed, setLoadingDetailed] = useState(false);
  const [activeTab, setActiveTab] = useState('analytics');

  // Only allow owner
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'owner') {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    if (user?.role === 'owner') {
      setLoadingStats(true);
      authAPI.getPlatformStats().then(res => {
        setPlatformStats(res.summary);
      }).catch(() => {
        setPlatformStats(null);
      }).finally(() => setLoadingStats(false));
      setLoadingDetailed(true);
      authAPI.getOwnerAnalytics().then(res => {
        setDetailedAnalytics(res.analytics);
      }).catch(() => {
        setDetailedAnalytics(null);
      }).finally(() => setLoadingDetailed(false));
    }
  }, [user]);

  // Export as PDF (professional formatting)
  const handleDownloadPDF = () => {
    if (!platformStats) return;
    const doc = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });
    const margin = 40;
    let y = margin;
    // Title
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('ReWear Platform Summary', margin, y);
    y += 32;
    // Subtitle and date
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('Comprehensive platform statistics and analytics', margin, y);
    y += 20;
    doc.setFontSize(11);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, margin, y);
    y += 24;
    // Divider
    doc.setDrawColor(200);
    doc.setLineWidth(1);
    doc.line(margin, y, 555, y);
    y += 18;
    // For each section
    Object.entries(platformStats).forEach(([section, data], idx) => {
      // Section header
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(section.charAt(0).toUpperCase() + section.slice(1), margin, y);
      y += 18;
      // Table-like key-value pairs
    doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      Object.entries(data).forEach(([key, value]) => {
        doc.text(formatKey(key), margin + 10, y);
        doc.text(String(value), margin + 220, y);
        y += 16;
      });
      y += 10;
      // Section divider
      if (idx < Object.entries(platformStats).length - 1) {
        doc.setDrawColor(230);
        doc.setLineWidth(0.5);
        doc.line(margin, y, 555, y);
        y += 14;
      }
      // Page break if needed
      if (y > 750) {
        doc.addPage();
        y = margin;
      }
    });
    // Footer
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text('Generated by ReWear Owner Dashboard', margin, 820);
    doc.save('platform-summary.pdf');
  };

  // Export as CSV (improved formatting)
  const handleDownloadCSV = () => {
    if (!platformStats) return;
    const csv = objectToCSV(platformStats);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'platform-summary.csv');
  };

  // Export as Excel (improved formatting)
  const handleDownloadExcel = () => {
    if (!platformStats) return;
    const sheets = objectToSheetData(platformStats);
    const wb = XLSX.utils.book_new();
    Object.entries(sheets).forEach(([sheetName, data]) => {
      const ws = XLSX.utils.aoa_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    });
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    saveAs(blob, 'platform-summary.xlsx');
  };

  // Copy as JSON (improved formatting)
  const handleCopyJSON = async () => {
    if (!platformStats) return;
    try {
      const formatted = formatObjectForJSON(platformStats);
      await navigator.clipboard.writeText(JSON.stringify(formatted, null, 2));
      alert('Platform stats copied as JSON!');
    } catch (err) {
      alert('Failed to copy JSON.');
    }
  };

  // Print dashboard
  const handlePrint = () => {
    window.print();
  };

  // Prepare chart data
  const userRoleData = platformStats ? [
    { name: 'Users', value: platformStats.users.total - platformStats.users.admins - platformStats.users.owners },
    { name: 'Admins', value: platformStats.users.admins },
    { name: 'Owners', value: platformStats.users.owners }
  ] : [];
  const itemStatusData = platformStats ? [
    { name: 'Pending', value: platformStats.items.pending },
    { name: 'Approved', value: platformStats.items.approved },
    { name: 'Swapped', value: platformStats.items.swapped }
  ] : [];
  const transactionData = platformStats ? [
    { name: 'Total', value: platformStats.transactions.total },
    { name: 'Completed', value: platformStats.transactions.completed }
  ] : [];
  const coinsData = platformStats ? [
    { name: 'Total Coins', value: platformStats.coins.total }
  ] : [];

  const ActiveComponent = OWNER_TABS[activeTab] || null;

  return (
    <div className="min-h-screen min-w-full w-screen bg-gradient-to-br from-black via-slate-900 to-black flex flex-row">
      {/* Sidebar */}
      <OwnerSidebar active={activeTab} onSelect={setActiveTab} />
      {/* Main Content */}
      <div className="flex-1 min-h-screen overflow-y-auto">
        {ActiveComponent ? (
          <ActiveComponent />
        ) : (
          // Fallback: show old dashboard as a tab
          <div className="p-8">
            {/* Old dashboard content here, or a message */}
            <div className="text-2xl font-bold text-yellow-200 mb-4">Legacy Dashboard</div>
            <div className="text-yellow-100">[The original dashboard content can be placed here as a fallback tab if needed]</div>
        </div>
      )}
      </div>
    </div>
  );
};

export default OwnerDashboard; 