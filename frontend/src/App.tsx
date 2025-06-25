import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import LandingPage from './components/LandingPage';
import LoginForm from './components/auth/LoginForm';
import SignupForm from './components/auth/SignupForm';

// For admin
import AdminLogin from './components/auth/AdminLogin';
import AdminSignup from './components/auth/AdminSignup';

// For Forgot Password
import ForgotPassword from './components/auth/ForgotPassword';
import AdminForgotPassword from './components/auth/AdminForgotPassword';
import AdminVerifyOTP from './components/auth/AdminVerifyOTP';
import VerifyOTP from './components/auth/VerifyOTP';

// Dashboard components
import UserDashboard from './components/dashboard/UserDashboard';
import AdminDashboard from './components/dashboard/AdminDashboard';
import Navbar from './components/layout/Navbar';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Import UserProfile component
import UserProfile from './components/profile/UserProfile';
import UserManagement from './components/dashboard/admin/UserManagement';

// নতুন কম্পোনেন্ট যা ন্যাভবার দেখাবে বা লুকাবে
const AppLayout = () => {
  const location = useLocation();
  const hideNavbar = location.pathname.includes('/admin/login') || 
                     location.pathname.includes('/admin/signup') ||
                     location.pathname === '/admin' ||
                     location.pathname.includes('/admin/forgot-password') ||
                     location.pathname.includes('/admin/verify-otp') ||
                     location.pathname.includes('/verify-otp');

  return (
    <div className="min-h-screen bg-gray-50">
      {!hideNavbar && <Navbar />}
      
      {/* Updated Routes organization */}
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<SignupForm />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/signup" element={<AdminSignup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />
        <Route path="/admin/verify-otp" element={<AdminVerifyOTP />} />
        
        {/* Protected User Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          }
        />
        
        {/* Protected Admin Routes */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute requireAdmin>
              <Routes>
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<UserManagement />} />
              </Routes>
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <Toaster position="top-right" />
          <AppLayout />
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;