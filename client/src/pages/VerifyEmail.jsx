import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const VerifyEmail = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendCooldown, setResendCooldown] = useState(0);

  const { verifyEmail, resendOTP, isAuthenticated, isLoading, clearError } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email;

  // Redirect if already authenticated (only after loading is complete)
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Redirect if no email provided
  useEffect(() => {
    if (!email) {
      toast.error('Email not provided. Please sign up again.');
      navigate('/signup');
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
    if (value.length > 1) return; // Prevent multiple characters
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    const newOtp = [...otp];
    
    for (let i = 0; i < pastedData.length && i < 6; i++) {
      if (/^\d$/.test(pastedData[i])) {
        newOtp[i] = pastedData[i];
      }
    }
    
    setOtp(newOtp);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      toast.error('Please enter the complete 6-digit OTP');
      return;
    }

    if (!/^\d{6}$/.test(otpString)) {
      toast.error('OTP must contain only numbers');
      return;
    }

    const result = await verifyEmail(email, otpString);
    
    if (result.success) {
      toast.success('Email verified successfully!');
      navigate('/dashboard');
    } else {
      toast.error(result.error);
      // Clear OTP on error
      setOtp(['', '', '', '', '', '']);
      document.getElementById('otp-0')?.focus();
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;

    const result = await resendOTP(email);
    
    if (result.success) {
      toast.success('OTP sent successfully!');
      setResendCooldown(60); // 60 seconds cooldown
      setOtp(['', '', '', '', '', '']); // Clear current OTP
      document.getElementById('otp-0')?.focus();
    } else {
      toast.error(result.error);
    }
  };

  if (!email) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen w-screen bg-slate-900 flex items-center justify-center p-8 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-secondary-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary-400/10 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{animationDelay: '2s'}}></div>
      </div>
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      
      <div className="w-full mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10 px-8">
        {/* Left Side - Branding */}
        <div className="hidden lg:block space-y-8">
          <div className="space-y-6">
            <div className="w-24 h-24 bg-blue-600 rounded-3xl flex items-center justify-center shadow-2xl animate-glow">
              <span className="text-4xl">📧</span>
            </div>
            <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent leading-tight">
              Verify Your<br />
              <span className="text-white">Email Address</span><br />
              Securely
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed max-w-md">
              We've sent a 6-digit verification code to your email address. 
              Enter it below to complete your account setup.
            </p>
            <div className="grid grid-cols-1 gap-4 text-gray-400">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">📱</span>
                <span>6-digit verification code</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🔒</span>
                <span>Secure email verification</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-2xl">⚡</span>
                <span>Quick account activation</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full max-w-lg mx-auto">
          <div className="bg-dark-800/50 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-dark-700/50">
            <div className="text-center mb-8">
              <div className="mb-6">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-2xl">📧</span>
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Verify Your Email</h2>
                <p className="text-gray-400 font-medium">We've sent a 6-digit verification code to</p>
                <p className="text-primary-400 font-semibold mt-1">{email}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3">
                  Enter Verification Code
                </label>
                <div className="grid grid-cols-6 gap-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  pattern="\d*"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                      className="w-full h-14 text-center text-xl font-bold border-2 border-dark-600 rounded-xl focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300 bg-dark-700/50 backdrop-blur-sm text-white placeholder-gray-400"
                  autoComplete="off"
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
                className="w-full bg-blue-600 text-white py-4 px-6 rounded-xl font-semibold hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/20 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
          >
            {isLoading ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>

            <div className="text-center mt-8 space-y-4">
              <p className="text-gray-400">
            Didn't receive the code?{' '}
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={resendCooldown > 0}
                  className="text-primary-400 hover:text-primary-300 font-medium transition-colors hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
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
              onClick={() => navigate('/signup')}
                  className="text-primary-400 hover:text-primary-300 font-medium transition-colors hover:underline"
            >
              ← Back to Sign Up
            </button>
          </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
