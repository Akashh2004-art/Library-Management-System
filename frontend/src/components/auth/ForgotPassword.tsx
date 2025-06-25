import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { getAuth } from 'firebase/auth';
import { app } from '../../firebase/config';

const auth = getAuth(app);

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      return toast.error('Please enter your email address');
    }
    
    setIsLoading(true);
    
    try {
      // 1. First check if the email exists in our database
      const checkResponse = await axios.post('http://localhost:5000/api/auth/check-email', { email });
      
      if (!checkResponse.data.exists) {
        toast.error('No user account found with this email address');
        setIsLoading(false);
        return;
      }
      
      // 2. Send password reset email via Firebase
      await sendPasswordResetEmail(auth, email);
      
      // 3. Generate OTP in backend and save to database
      await axios.post('http://localhost:5000/api/auth/send-otp', { email });
      
      toast.success('OTP sent to your email. Please check your inbox.');
      navigate(`/verify-otp?email=${encodeURIComponent(email)}`);
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      
      if (error.response) {
        const statusCode = error.response.status;
        if (statusCode === 404) {
          toast.error('API endpoint not found. Please check if the backend server is running correctly.');
        } else {
          toast.error(`Server error (${statusCode}): ${error.response.data?.message || 'Failed to send OTP'}`);
        }
      } else if (error.code === 'auth/user-not-found') {
        toast.error('No account found with this email address');
      } else if (error.code === 'auth/invalid-email') {
        toast.error('Please enter a valid email address');
      } else if (error.request) {
        toast.error('Cannot connect to the server. Please check your internet connection.');
      } else {
        toast.error(`Failed to send OTP: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Forgot Password</h2>
        <p className="text-center text-sm text-gray-600">
          Enter your email address and we'll send you an OTP to reset your password.
        </p>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div className="relative">
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
                className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                isLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Sending...' : 'Send OTP'}
            </button>
          </div>
        </form>
        <div className="text-center mt-4">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;