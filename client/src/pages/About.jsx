import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const About = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('mission');

  const stats = [
    { number: '10,000+', label: 'Items Sold', icon: '💰' },
    { number: '5,000+', label: 'Active Users', icon: '👥' },
    { number: '50,000+', label: 'CO2 Saved (kg)', icon: '🌱' },
    { number: '95%', label: 'User Satisfaction', icon: '⭐' }
  ];

  const features = [
    {
      title: 'Smart Discovery',
      description: 'AI-powered search and recommendations to find exactly what you need',
      icon: '🔍',
      color: 'from-green-500 to-emerald-600'
    },
    {
      title: 'Quality Assurance',
      description: 'All items are verified for condition and authenticity before listing',
      icon: '✅',
      color: 'from-green-500 to-emerald-600'
    },
    {
      title: 'Secure Transactions',
      description: 'Safe payment processing and buyer protection for all purchases',
      icon: '🔒',
      color: 'from-green-500 to-emerald-600'
    },
    {
      title: 'Sustainable Impact',
      description: 'Track your environmental contribution by buying and selling pre-owned items',
      icon: '🌍',
      color: 'from-teal-500 to-cyan-600'
    }
  ];


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-green-900 w-full">
      <div className="w-full px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16 w-full">
          <h1 className="text-6xl font-bold text-white mb-6">
            About <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">Thryfto</span>
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            We're revolutionizing the way people buy and sell pre-owned goods by creating a sustainable marketplace where quality meets responsibility. 
            Join thousands of conscious consumers making a difference, one purchase at a time.
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16 w-full">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 text-center border border-slate-600 hover:border-green-500 transition-all duration-300 hover:scale-105"
            >
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-3xl font-bold text-white mb-1">{stat.number}</div>
              <div className="text-slate-400 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-12 w-full">
          {['mission', 'features'].map((section) => (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                activeSection === section
                  ? 'bg-green-600 text-white shadow-lg'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {section.charAt(0).toUpperCase() + section.slice(1)}
            </button>
          ))}
        </div>

        {/* Mission Section */}
        {activeSection === 'mission' && (
          <div className="w-full">
            <div className="grid lg:grid-cols-2 gap-12 w-full">
              {/* Mission Card */}
              <div className="bg-gradient-to-br from-slate-800/60 to-slate-700/40 backdrop-blur-sm rounded-3xl p-8 border border-slate-600/50 shadow-2xl hover:shadow-green-500/10 transition-all duration-500">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-3xl">🎯</span>
                  </div>
                  <h2 className="text-3xl font-bold text-white">Our Mission</h2>
                </div>
                <div className="space-y-6">
                  <p className="text-slate-300 leading-relaxed text-lg">
                    Thryfto was born from a simple yet powerful idea: what if we could create a world where 
                    every pre-owned item gets a second life? We're building a marketplace that values 
                    sustainability, quality, and fair transactions.
                  </p>
                  <p className="text-slate-300 leading-relaxed text-lg">
                    Our platform connects buyers and sellers of pre-owned items across all categories, making sustainable 
                    shopping accessible and profitable for everyone while reducing environmental impact.
                  </p>
                  <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-2xl p-6 mt-8">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">🌱</span>
                      <h3 className="text-green-400 font-bold text-xl">Environmental Impact</h3>
                    </div>
                    <p className="text-slate-300 text-base leading-relaxed">
                      Every pre-owned item sold saves approximately 2.5kg of CO2 emissions and prevents waste from landfills.
                    </p>
                    <div className="mt-4 flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-green-300 text-sm font-medium">Real-time impact tracking</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vision Card */}
              <div className="bg-gradient-to-br from-slate-800/60 to-slate-700/40 backdrop-blur-sm rounded-3xl p-8 border border-slate-600/50 shadow-2xl hover:shadow-green-500/10 transition-all duration-500">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-3xl">🔮</span>
                  </div>
                  <h2 className="text-3xl font-bold text-white">Our Vision</h2>
                </div>
                <div className="space-y-6">
                  <p className="text-slate-300 leading-relaxed text-lg">
                    We envision a future where buying and selling pre-owned items is the norm, not the exception. A world 
                    where every product gets a second life and communities thrive through sustainable consumption.
                  </p>
                  
                  <div className="space-y-6 mt-8">
                    <div className="flex items-start space-x-4 p-4 bg-slate-700/30 rounded-xl hover:bg-slate-700/50 transition-all duration-300">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-sm font-bold">1</span>
                      </div>
                      <div>
                        <h4 className="text-white font-semibold mb-1">Circular Economy</h4>
                        <p className="text-slate-300 text-sm">Complete circular economy for all product categories</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-4 p-4 bg-slate-700/30 rounded-xl hover:bg-slate-700/50 transition-all duration-300">
                      <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-sm font-bold">2</span>
                      </div>
                      <div>
                        <h4 className="text-white font-semibold mb-1">AI-Powered Matching</h4>
                        <p className="text-slate-300 text-sm">Smart recommendations and personalized shopping experience</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-4 p-4 bg-slate-700/30 rounded-xl hover:bg-slate-700/50 transition-all duration-300">
                      <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-sm font-bold">3</span>
                      </div>
                      <div>
                        <h4 className="text-white font-semibold mb-1">Global Community</h4>
                        <p className="text-slate-300 text-sm">Worldwide marketplace of conscious buyers and sellers</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Features Section */}
        {activeSection === 'features' && (
          <div className="w-full">
            <h2 className="text-3xl font-bold text-white text-center mb-12">Why Choose Thryfto?</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-600 hover:border-green-500 transition-all duration-300 hover:scale-105"
                >
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center text-2xl mb-4`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                  <p className="text-slate-300 text-sm leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}


        {/* Call to Action */}
        <div className="text-center mt-16 w-full">
          <h2 className="text-3xl font-bold text-white mb-6">Join the Thryfto Revolution</h2>
          <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
            Be part of a marketplace that's changing the way we think about consumption. 
            Start buying and selling, start saving, start making a difference.
          </p>
          <div className="flex justify-center">
            <button 
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-lg font-semibold hover:scale-105 transition-all duration-300 shadow-lg"
            >
              Get Started Today
            </button>
          </div>
        </div>
    </div>
  </div>
);
};

export default About; 