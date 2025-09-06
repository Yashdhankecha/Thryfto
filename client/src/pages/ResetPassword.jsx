import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    otp: ['', '', '', '', '', ''],
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const { resetPassword, forgotPassword, isAuthenticated, isLoading, clearError } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email;

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Redirect if no email provided
  useEffect(() => {
    if (!email) {
      toast.error('Email not provided. Please start the password reset process again.');
      navigate('/forgot-password');
    }
  }, [email, navigate]);

  // Clear error when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Countdown timer for resend button
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    
    const newOtp = [...formData.otp];
    newOtp[index] = value;
    setFormData({ ...formData, otp: newOtp });

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`reset-otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !formData.otp[index] && index > 0) {
      const prevInput = document.getElementById(`reset-otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    const newOtp = [...formData.otp];
    
    for (let i = 0; i < pastedData.length && i < 6; i++) {
      if (/^\d$/.test(pastedData[i])) {
        newOtp[i] = pastedData[i];
      }
    }
    
    setFormData({ ...formData, otp: newOtp });
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    const otpString = formData.otp.join('');
    
    if (otpString.length !== 6) {
      toast.error('Please enter the complete 6-digit code');
      return false;
    }

    if (!/^\d{6}$/.test(otpString)) {
      toast.error('Code must contain only numbers');
      return false;
    }

    if (!formData.newPassword) {
      toast.error('New password is required');
      return false;
    }

    if (formData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return false;
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword)) {
      toast.error('Password must contain at least one uppercase letter, one lowercase letter, and one number');
      return false;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const otpString = formData.otp.join('');
    const result = await resetPassword(email, otpString, formData.newPassword);
    
    if (result.success) {
      toast.success('Password reset successfully!');
      navigate('/login');
    } else {
      toast.error(result.error);
      // Clear OTP on error
      setFormData({ ...formData, otp: ['', '', '', '', '', ''] });
      document.getElementById('reset-otp-0')?.focus();
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;

    const result = await forgotPassword(email);
    
    if (result.success) {
      toast.success('Reset code sent successfully!');
      setResendCooldown(60);
      setFormData({ ...formData, otp: ['', '', '', '', '', ''] });
      document.getElementById('reset-otp-0')?.focus();
    } else {
      toast.error(result.error);
    }
  };

  if (!email) {
    return null;
  }

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
              <span className="text-4xl">🔑</span>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent leading-tight">
              Set Your<br />
              <span className="text-white">New Password</span><br />
              Securely
            </h1>
            <p className="text-lg text-gray-300 leading-relaxed max-w-sm">
              Enter the 6-digit code sent to your email and create a new secure password for your account.
            </p>
            <div className="grid grid-cols-1 gap-3 text-gray-400">
              <div className="flex items-center space-x-3">
                <span className="text-xl">📱</span>
                <span className="text-sm">6-digit verification code</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-xl">🔒</span>
                <span className="text-sm">Strong password requirements</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-xl">⚡</span>
                <span className="text-sm">Instant account access</span>
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
                  <span className="text-2xl">🔑</span>
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Reset Password</h2>
                <p className="text-gray-400 font-medium">Enter the code sent to</p>
                <p className="text-green-400 font-semibold mt-1">{email}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3">
                  Enter Reset Code
                </label>
                <div className="grid grid-cols-6 gap-3">
              {formData.otp.map((digit, index) => (
                <input
                  key={index}
                  id={`reset-otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  pattern="\d*"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                      className="w-full h-14 text-center text-xl font-bold border-2 border-dark-600 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 bg-dark-700/50 backdrop-blur-sm text-white placeholder-gray-400"
                  autoComplete="off"
                />
              ))}
            </div>
          </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-semibold text-gray-300 mb-2">
                  New Password
                </label>
                <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                placeholder="Enter new password"
                required
                    className="w-full px-4 py-4 pr-12 border-2 border-dark-600 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 bg-dark-700/50 backdrop-blur-sm text-white placeholder-gray-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-green-400 transition-colors p-2 rounded-lg hover:bg-dark-600"
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
                <small className="text-xs text-gray-400 mt-2 block">
              Must contain at least 6 characters with uppercase, lowercase, and number
            </small>
          </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-300 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm new password"
                required
                    className="w-full px-4 py-4 pr-12 border-2 border-dark-600 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 bg-dark-700/50 backdrop-blur-sm text-white placeholder-gray-400"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-green-400 transition-colors p-2 rounded-lg hover:bg-dark-600"
              >
                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 focus:ring-4 focus:ring-green-500/20 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
          >
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

            <div className="text-center mt-8 space-y-4">
              <p className="text-gray-400">
            Didn't receive the code?{' '}
            <button
              type="button"
              onClick={handleResendCode}
              disabled={resendCooldown > 0}
                  className="text-green-400 hover:text-green-300 font-medium transition-colors hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resendCooldown > 0 
                ? `Resend in ${resendCooldown}s` 
                : 'Resend Code'
              }
            </button>
          </p>
              <p className="text-gray-400">
            <button
              type="button"
              onClick={() => navigate('/forgot-password')}
                  className="text-green-400 hover:text-green-300 font-medium transition-colors hover:underline"
            >
              ← Back to Forgot Password
            </button>
          </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
