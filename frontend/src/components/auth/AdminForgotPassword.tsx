import { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { getAuth } from 'firebase/auth';
import { app } from '../../firebase/config';

const auth = getAuth(app);
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';

const AdminForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      return toast.error('Please enter your email address');
    }

    setIsLoading(true);

    try {

      const checkResponse = await axios.post('http://localhost:5000/api/admin/check-email', { email });
      
      if (!checkResponse.data.exists) {
        toast.error('No admin account found with this email address');
        setIsLoading(false);
        return;
      }
      
      // ২. Firebase এর পাসওয়ার্ড রিসেট ইমেইল পাঠান
      await sendPasswordResetEmail(auth, email);
      
      // ৩. ব্যাকএন্ডে OTP তৈরি করে ডাটাবেসে সেভ করুন
      // API এন্ডপয়েন্ট পরিবর্তন করা হয়েছে (5000 থেকে 8000)
      await axios.post('http://localhost:5000/api/admin/send-otp', { email });
      
      toast.success('OTP sent to your email. Please check your inbox.');
      // OTP ভেরিফিকেশন পেজে রিডাইরেক্ট করুন
      navigate(`/admin/verify-otp?email=${encodeURIComponent(email)}`);
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      
      if (error.response) {
        // এরর মেসেজ আরও বিস্তারিত করা হয়েছে
        const statusCode = error.response.status;
        if (statusCode === 404) {
          toast.error('API endpoint not found. Please check if the backend server is running correctly.');
        } else {
          toast.error(`Server error (${statusCode}): ${error.response.data.message || 'Failed to send OTP'}`);
        }
      } else if (error.code === 'auth/user-not-found') {
        toast.error('No account found with this email address');
      } else if (error.code === 'auth/invalid-email') {
        toast.error('Please enter a valid email address');
      } else if (error.request) {
        // সার্ভার রিকোয়েস্ট পাচ্ছে না
        toast.error('Cannot connect to the server. Please check your internet connection.');
      } else {
        toast.error(`Failed to send OTP: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Reset Admin Password</h1>
          <p className="mt-2 text-sm text-gray-600">
            Enter your email address and we'll send you an OTP to reset your password.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter your email"
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
              {isLoading ? 'Sending...' : 'Send OTP'}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate('/admin/login')}
              className="text-sm text-indigo-600 hover:text-indigo-500"
            >
              Back to Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminForgotPassword;