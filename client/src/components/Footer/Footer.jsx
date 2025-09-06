import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="w-full bg-slate-900 text-slate-200 pt-12 pb-4 mt-12 shadow-inner shadow-blue-900/30">
    <div className="max-w-7xl mx-auto flex flex-wrap justify-between gap-8 px-4 sm:px-6 lg:px-8">
      {/* Brand & Social */}
      <div className="flex-1 min-w-[200px] mb-8">
        <div className="font-bold text-2xl mb-2 text-white tracking-wide">Thryfto</div>
        <div className="text-slate-400 text-base mb-4">Sustainable fashion through community-driven clothing exchange.</div>
        <div className="flex gap-4 mt-2">
          <a href="#" aria-label="Instagram" className="hover:text-green-500 transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /></svg>
          </a>
          <a href="#" aria-label="Twitter" className="hover:text-green-500 transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="8" /></svg>
          </a>
          <a href="#" aria-label="Facebook" className="hover:text-green-500 transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" /></svg>
          </a>
        </div>
      </div>
      {/* Platform Links */}
      <div className="flex-1 min-w-[150px] mb-8">
        <div className="font-semibold mb-2 text-white">Platform</div>
        <ul>
          <li><Link to="/how-it-works" className="block text-slate-300 hover:text-green-500 transition-colors mb-1">How It Works</Link></li>
          <li><Link to="/browse" className="block text-slate-300 hover:text-green-500 transition-colors mb-1">Browse Items</Link></li>
          <li><Link to="/list" className="block text-slate-300 hover:text-green-500 transition-colors mb-1">List an Item</Link></li>
          <li><Link to="/points" className="block text-slate-300 hover:text-green-500 transition-colors">Points System</Link></li>
        </ul>
      </div>
      {/* Company Links */}
      <div className="flex-1 min-w-[150px] mb-8">
        <div className="font-semibold mb-2 text-white">Company</div>
        <ul>
          <li><Link to="/about" className="block text-slate-300 hover:text-green-500 transition-colors mb-1">About Us</Link></li>
          <li><Link to="/contact" className="block text-slate-300 hover:text-green-500 transition-colors mb-1">Contact</Link></li>
          <li><Link to="/terms" className="block text-slate-300 hover:text-green-500 transition-colors">Terms of Service</Link></li>
        </ul>
      </div>
      {/* Newsletter */}
      <div className="flex-1 min-w-[200px] mb-8">
        <div className="font-semibold mb-2 text-white">Stay Updated</div>
        <div className="text-slate-400 text-base mb-2">Get the latest on sustainable fashion trends and platform updates.</div>
        <form className="flex">
          <input
            type="email"
            placeholder="Enter your email"
            className="px-4 py-2 rounded-l-lg bg-slate-800 text-white border-none focus:ring-2 focus:ring-green-500 outline-none text-base placeholder-slate-400"
          />
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-green-400 text-white font-semibold px-4 py-2 rounded-r-lg transition-all shadow shadow-green-900/20"
          >
            Subscribe
          </button>
        </form>
      </div>
    </div>
    <div className="text-center text-slate-500 text-sm mt-8 border-t border-slate-800 pt-4">
      © 2025 Thryfto. All rights reserved to tripod developers.
    </div>
  </footer>
);

export default Footer;
