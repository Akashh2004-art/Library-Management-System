import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';
import { Eye, EyeOff } from 'lucide-react';

const AdminVerifyOTP = () => {
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1); // 1 = OTP verification, 2 = Set new password
  
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    // URL থেকে ইমেইল পারামিটার নিন
    const params = new URLSearchParams(location.search);
    const emailParam = params.get('email');
    
    if (emailParam) {
      setEmail(emailParam);
    } else {
      // ইমেইল না থাকলে ফরগট পাসওয়ার্ড পেজে রিডাইরেক্ট করুন
      navigate('/admin/forgot-password');
    }
  }, [location, navigate]);
  
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp) {
      return toast.error('Please enter the OTP');
    }
    
    setIsLoading(true);
    
    try {
      // পোর্ট নম্বর আপডেট করা হয়েছে
      const response = await axios.post('http://localhost:5000/api/admin/verify-otp', {
        email,
        otp
      });
      
      if (response.data.success) {
        toast.success('OTP verified successfully');
        setStep(2); // পাসওয়ার্ড রিসেট স্টেপে যান
      } else {
        toast.error('Invalid OTP. Please try again.');
      }
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      // এরর হ্যান্ডলিং আরও বিস্তারিত করা হয়েছে
      if (error.response) {
        const statusCode = error.response.status;
        if (statusCode === 404) {
          toast.error('API endpoint not found. Please check if the backend server is running correctly.');
        } else {
          toast.error(`Server error (${statusCode}): ${error.response.data?.message || 'Failed to verify OTP'}`);
        }
      } else if (error.request) {
        toast.error('Cannot connect to the server. Please check your internet connection.');
      } else {
        toast.error(`Failed to verify OTP: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword || !confirmPassword) {
      return toast.error('Please fill in all fields');
    }
    
    if (newPassword !== confirmPassword) {
      return toast.error('Passwords do not match');
    }
    
    if (newPassword.length < 6) {
      return toast.error('Password must be at least 6 characters long');
    }
    
    setIsLoading(true);
    
    try {
      // পোর্ট নম্বর আপডেট করা হয়েছে
      await axios.post('http://localhost:5000/api/admin/reset-password', {
        email,
        otp,
        newPassword
      });
      
      toast.success('Password reset successfully');
      navigate('/admin/login');
    } catch (error: any) {
      console.error('Error resetting password:', error);
      // এরর হ্যান্ডলিং আরও বিস্তারিত করা হয়েছে
      if (error.response) {
        const statusCode = error.response.status;
        if (statusCode === 404) {
          toast.error('API endpoint not found. Please check if the backend server is running correctly.');
        } else {
          toast.error(`Server error (${statusCode}): ${error.response.data?.message || 'Failed to reset password'}`);
        }
      } else if (error.request) {
        toast.error('Cannot connect to the server. Please check your internet connection.');
      } else {
        toast.error(`Failed to reset password: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            {step === 1 ? 'Verify OTP' : 'Set New Password'}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            {step === 1 
              ? `We've sent an OTP to ${email}. Please enter it below.` 
              : 'Create a new password for your account.'}
          </p>
        </div>

        {step === 1 ? (
          <form className="mt-8 space-y-6" onSubmit={handleVerifyOTP}>
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                Enter OTP
              </label>
              <input
                id="otp"
                name="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter 6-digit OTP"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                  isLoading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </div>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
            <div className="relative">
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-8 text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <div className="relative">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-8 text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                  isLoading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </button>
            </div>
          </form>
        )}

        <div className="text-center">
          <button
            type="button"
            onClick={() => navigate('/admin/login')}
            className="text-sm text-indigo-600 hover:text-indigo-500"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminVerifyOTP;