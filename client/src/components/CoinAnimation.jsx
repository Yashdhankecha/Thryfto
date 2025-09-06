import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CoinAnimation = ({ show, coins, onComplete }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onComplete) onComplete();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
        >
          <motion.div
            initial={{ y: 0, rotate: 0 }}
            animate={{ 
              y: -100, 
              rotate: 360,
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              duration: 2,
              ease: "easeOut"
            }}
            className="relative"
          >
            {/* Coin with glow effect */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400/40 to-orange-400/30 blur-xl animate-pulse"></div>
            </div>
            <div className="relative w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 shadow-2xl border-4 border-yellow-200/50">
              <span className="text-3xl">🪙</span>
            </div>
            
            {/* Coins earned text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="absolute -bottom-8 left-1/2 transform -translate-x-1/2"
            >
              <div className="bg-green-500 text-white px-4 py-2 rounded-full font-bold text-lg shadow-lg">
                +{coins} coins earned!
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CoinAnimation;
