import React from 'react';
import { motion } from 'framer-motion';

const navItems = [
  { key: 'analytics', label: 'Advanced Analytics', icon: '📈' },
  { key: 'reports', label: 'Financial Reports', icon: '💰' },
  { key: 'logs', label: 'Audit Logs', icon: '📝' },
  { key: 'integrations', label: 'Integrations', icon: '🔗' },
  { key: 'custom', label: 'Custom Dashboard', icon: '🧩' },
];

const OwnerSidebar = ({ active, onSelect }) => (
  <motion.aside
    initial={{ x: -60, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    transition={{ duration: 0.5 }}
    className="bg-white/20 backdrop-blur-xl border-r border-white/30 shadow-xl h-full w-64 flex flex-col py-8 px-4"
  >
    <div className="mb-10 text-2xl font-extrabold text-yellow-400 tracking-tight flex items-center gap-2">
      <span>👑</span> Owner Panel
    </div>
    <nav className="flex flex-col gap-2">
      {navItems.map(item => (
        <motion.button
          key={item.key}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.98 }}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-lg transition-all duration-200 ${active === item.key ? 'bg-gradient-to-r from-yellow-400 to-yellow-300 text-white shadow-lg' : 'text-yellow-100 hover:bg-yellow-100/10'}`}
          onClick={() => onSelect(item.key)}
        >
          <span className="text-2xl">{item.icon}</span> {item.label}
        </motion.button>
      ))}
    </nav>
  </motion.aside>
);

export default OwnerSidebar; 