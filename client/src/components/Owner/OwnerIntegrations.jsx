import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { authAPI } from '../../services/api';
import jsPDF from 'jspdf';

const OwnerIntegrations = () => {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');

  // Helper: Convert array of objects to CSV
  function arrayToCSV(arr) {
    if (!arr.length) return '';
    const keys = Object.keys(arr[0]);
    const csvRows = [keys.join(',')];
    arr.forEach(obj => {
      csvRows.push(keys.map(k => JSON.stringify(obj[k] ?? '')).join(','));
    });
    return csvRows.join('\n');
  }

  // Helper: Export data
  async function handleExport(format) {
    setExporting(true);
    setError('');
    try {
      // Fetch all transactions (as a representative export)
      const res = await authAPI.getOwnerTransactions();
      const data = res.data || [];
      if (!data.length) throw new Error('No data to export.');
      if (format === 'csv') {
        const csv = arrayToCSV(data);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, 'owner-transactions.csv');
      } else if (format === 'excel') {
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Transactions');
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([wbout], { type: 'application/octet-stream' });
        saveAs(blob, 'owner-transactions.xlsx');
      } else if (format === 'json') {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        saveAs(blob, 'owner-transactions.json');
      } else if (format === 'pdf') {
        // Generate a professional PDF
        const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
        const margin = 40;
        let y = margin;
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('Owner Transactions Report', margin, y);
        y += 30;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(`Generated on: ${new Date().toLocaleString('en-IN')}`, margin, y);
        y += 20;
        doc.setDrawColor(200);
        doc.setLineWidth(1);
        doc.line(margin, y, 800, y);
        y += 18;
        // Table headers
        const headers = ['ID', 'Buyer', 'Seller', 'Item', 'Amount', 'Status', 'Date'];
        doc.setFont('helvetica', 'bold');
        headers.forEach((h, i) => {
          doc.text(h, margin + i * 110, y);
        });
        y += 18;
        doc.setFont('helvetica', 'normal');
        // Table rows
        data.forEach((tx, idx) => {
          if (y > 540) { doc.addPage(); y = margin + 18; }
          doc.text(String(tx._id || ''), margin, y);
          doc.text(String(tx.buyer?.name || ''), margin + 110, y);
          doc.text(String(tx.seller?.name || ''), margin + 220, y);
          doc.text(String(tx.item?.title || ''), margin + 330, y);
          doc.text(String(tx.offerAmount || ''), margin + 440, y);
          doc.text(String(tx.status || ''), margin + 550, y);
          doc.text(new Date(tx.createdAt).toLocaleString('en-IN'), margin + 660, y);
          y += 16;
        });
        doc.save('owner-transactions.pdf');
      }
      setShowExportMenu(false);
    } catch (err) {
      setError('Failed to export data.');
    } finally {
      setExporting(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.5 }} className="w-full h-full p-8 bg-white/20 backdrop-blur-xl rounded-2xl shadow-xl">
      <div className="text-2xl font-bold text-cyan-200 mb-4">Integrations</div>
      <div className="text-cyan-100 mb-6">Connect your dashboard to external analytics tools or export your data in Indian formats.</div>
       <div className="flex flex-col gap-4">
        <button className="bg-gradient-to-r from-cyan-600 to-cyan-400 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition-all duration-300 hover:shadow-2xl flex items-center gap-2 text-lg" disabled>Connect Google Analytics</button>
        <button className="bg-gradient-to-r from-purple-600 to-purple-400 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition-all duration-300 hover:shadow-2xl flex items-center gap-2 text-lg" disabled>Connect Mixpanel</button>
        <div className="relative">
          <button
            className="bg-gradient-to-r from-yellow-600 to-yellow-400 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition-all duration-300 hover:shadow-2xl flex w-full items-center gap-2 text-lg"
            onClick={() => setShowExportMenu(v => !v)}
            disabled={exporting}
          >
            {exporting ? 'Exporting...' : 'Export Data (CSV/Excel/JSON/PDF)'}
          </button>
          {showExportMenu && (
            <div className="absolute w-full z-10 mt-2 bg-white rounded-xl shadow-xl border border-yellow-200">
              <button className="block bg-yellow-300 mb-1 mt-1 w-full text-left px-6 py-3 hover:bg-yellow-500 text-yellow-900 font-bold" onClick={() => handleExport('csv')}>Export as CSV</button>
              <button className="block bg-yellow-300 mb-1 mt-1 w-full text-left px-6 py-3 hover:bg-yellow-500 text-yellow-900 font-bold" onClick={() => handleExport('excel')}>Export as Excel</button>
              <button className="block bg-yellow-300 mb-1 mt-1 w-full text-left px-6 py-3 hover:bg-yellow-500 text-yellow-900 font-bold" onClick={() => handleExport('json')}>Export as JSON</button>
              <button className="block bg-yellow-300 mb-1 mt-1 w-full text-left px-6 py-3 hover:bg-yellow-500 text-yellow-900 font-bold" onClick={() => handleExport('pdf')}>Export as PDF</button>
            </div>
          )}
        </div>
        {error && <div className="text-red-400 mt-2">{error}</div>}
      </div>
    </motion.div>
  );
};

export default OwnerIntegrations; 