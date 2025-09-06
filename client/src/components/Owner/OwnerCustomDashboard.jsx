import React from 'react';
import { motion } from 'framer-motion';

const OwnerCustomDashboard = () => (
  <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.5 }} className="w-full h-full p-8 bg-white/20 backdrop-blur-xl rounded-2xl shadow-xl">
    <div className="text-2xl font-bold text-purple-200 mb-4">Custom Dashboard</div>
    <div className="text-purple-100 mb-2">Drag-and-drop widgets and custom Indian-style dashboard views coming soon!</div>
  </motion.div>
);

export default OwnerCustomDashboard; 