import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { useEffect } from 'react';
import Footer from './components/Footer/Footer';
import Navbar from './components/Navbar/Navbar';
// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import GoogleCallback from './pages/GoogleCallback';
import MyListings from './pages/MyListings';
import BrowseItems from './pages/BrowseItems';
import Profile from './pages/Profile';
import About from './pages/About';
import Community from './pages/Community';
import ProductDetail from './pages/ProductDetail';
import Notifications from './pages/Notifications';
import TestBuySell from './pages/TestBuySell';
import Redemption from './pages/Redemption';
import ListItem from './pages/ListItem';
import TermsOfService from './pages/TermsOfService';
import HowItWorks from './pages/HowItWorks';
import PointsSystem from './pages/PointsSystem';
import Contact from './pages/Contact';
import AdminDashboard from './pages/AdminDashboard';
import AdminOrders from './pages/AdminOrders';
import AdminUsers from './pages/AdminUsers';

// Styles - Now using Tailwind CSS via CDN

// Wrapper component to conditionally render Navbar and Footer
function AppContent() {
  const location = useLocation();
  
  // Routes where we don't want to show Navbar and Footer
  const authRoutes = ['/login', '/signup', '/verify-email', '/forgot-password', '/reset-password'];
  const adminRoutes = ['/admin/dashboard', '/admin/users', '/admin/orders'];
  const shouldShowNavbarFooter = !authRoutes.includes(location.pathname);
  const shouldShowFooter = !authRoutes.includes(location.pathname) && !adminRoutes.includes(location.pathname);


  return (
    <div className="App">
      {shouldShowNavbarFooter && <Navbar />}
      <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/auth/google-callback" element={<GoogleCallback />} />
            <Route path="/browse" element={<BrowseItems />} />
            <Route path="/test-buy-sell" element={<TestBuySell />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/community" element={<Community />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/points" element={<PointsSystem />} />
            <Route path="/contact" element={<Contact />} />

            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={<Dashboard />}
            />
            <Route
              path="/list"
              element={<ListItem />}
            />
            <Route
              path="/my-listings"
              element={
                <ProtectedRoute>
                  <MyListings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/redemption"
              element={
                <ProtectedRoute>
                  <Redemption />
                </ProtectedRoute>
              }
            />

            {/* Admin dashboard route */}
            <Route path="/admin/dashboard" element={
              (typeof window !== 'undefined' && JSON.parse(localStorage.getItem('user'))?.role === 'admin')
                ? <AdminDashboard />
                : <Navigate to="/login" replace />
            } />

            {/* Admin items management route */}
            <Route path="/admin/orders" element={
              (typeof window !== 'undefined' && JSON.parse(localStorage.getItem('user'))?.role === 'admin')
                ? <AdminOrders />
                : <Navigate to="/login" replace />
            } />

            {/* Admin users management route */}
            <Route path="/admin/users" element={
              (typeof window !== 'undefined' && JSON.parse(localStorage.getItem('user'))?.role === 'admin')
                ? <AdminUsers />
                : <Navigate to="/login" replace />
            } />


            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/login" replace />} />

            {/* New route for editing a list item */}
            <Route path="/edit/:id" element={<ListItem />} />
          </Routes>

          {/* Toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#4ade80',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />

          {shouldShowFooter && <Footer />}
        </div>
      );
}

function App() {
  // Test API connection on app load
  useEffect(() => {
    fetch('http://localhost:5000/api/health')
      .then(response => response.json())
      .then(data => {
        console.log('API Health Check:', data);
      })
      .catch(error => {
        console.error('API Health Check Failed:', error);
      });
  }, []);

  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
