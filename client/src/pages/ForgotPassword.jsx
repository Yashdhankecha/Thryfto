import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');

  const { forgotPassword, isAuthenticated, isLoading, clearError } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated (only after loading is complete)
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Clear error when component mounts - only once
  useEffect(() => {
    clearError();
  }, []); // Empty dependency array - only run once

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    const result = await forgotPassword(email);
    
    if (result.success) {
      toast.success('Password reset code sent to your email!');
      // Add a small delay before navigation to ensure state is updated
      setTimeout(() => {
        navigate('/reset-password', { 
          state: { 
            email: email 
          } 
        });
      }, 150);
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-slate-900 via-slate-800 to-green-900 flex items-center justify-center p-8 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-green-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-green-400/10 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{animationDelay: '2s'}}></div>
      </div>
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      
      <div className="w-full mx-auto grid lg:grid-cols-2 gap-8 items-center relative z-10 px-8">
        {/* Left Side - Branding */}
        <div className="hidden lg:block space-y-6">
          <div className="space-y-4">
            <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center shadow-2xl animate-glow">
              <span className="text-4xl">🔐</span>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent leading-tight">
              Reset Your<br />
              <span className="text-white">Password</span><br />
              Securely
            </h1>
            <p className="text-lg text-gray-300 leading-relaxed max-w-sm">
              Don't worry! We'll help you get back into your account. 
              Enter your email and we'll send you a secure reset code.
            </p>
            <div className="grid grid-cols-1 gap-3 text-gray-400">
              <div className="flex items-center space-x-3">
                <span className="text-xl">🔒</span>
                <span className="text-sm">Secure password reset</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-xl">⚡</span>
                <span className="text-sm">Quick and easy process</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-xl">📧</span>
                <span className="text-sm">Email verification</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full max-w-lg mx-auto">
          <div className="bg-dark-800/50 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-dark-700/50">
            <div className="text-center mb-8">
              <div className="mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-2xl">🔐</span>
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Forgot Password?</h2>
                <p className="text-gray-400 font-medium">Enter your email to reset your password</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-300 mb-2">
                  Email Address
                </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
                  className="w-full px-4 py-4 border-2 border-dark-600 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 bg-dark-700/50 backdrop-blur-sm text-white placeholder-gray-400"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 focus:ring-4 focus:ring-green-500/20 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
          >
            {isLoading ? 'Sending...' : 'Send Reset Code'}
          </button>
        </form>

            <div className="text-center mt-8 space-y-4">
              <p className="text-gray-400">
            Remember your password?{' '}
                <Link
                  to="/login"
                  className="text-green-400 hover:text-green-300 font-medium transition-colors hover:underline"
                >
              Back to Sign In
            </Link>
          </p>
              <p className="text-gray-400">
            Don't have an account?{' '}
                <Link
                  to="/signup"
                  className="text-green-400 hover:text-green-300 font-medium transition-colors hover:underline"
                >
              Sign up here
            </Link>
          </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
