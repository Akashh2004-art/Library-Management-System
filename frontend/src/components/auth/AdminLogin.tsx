import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LoginResponse } from '../../types';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    emailOrPhone: '',
    password: '',
  });
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { adminLogin } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.emailOrPhone || !formData.password) {
      return toast.error('Please fill in all the fields.');
    }
    
    setIsLoading(true);

    try {
      const response: LoginResponse = await adminLogin(
        formData.emailOrPhone, 
        formData.password
      );
      
      if (response.success) {
        toast.success('Admin login successful!');
        navigate('/admin');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Admin login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-200">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-lg space-y-6 w-full max-w-md"
      >
        <h1 className="text-3xl font-bold text-center text-gray-800">Admin Login</h1>
        
        {/* Email or Phone Input */}
        <input
          type="text"
          name="emailOrPhone"
          placeholder="Email or Phone"
          value={formData.emailOrPhone}
          onChange={handleChange}
          className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        {/* Password Input with Eye Toggle */}
        <div className="relative">
          <input
            type={passwordVisible ? 'text' : 'password'}
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setPasswordVisible(!passwordVisible)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
          >
            {passwordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        
        {/* Forgot Password Link */}
        <div className="text-right">
          <Link to="/admin/forgot-password" className="text-blue-600 hover:text-blue-800 text-sm">
            Forgot Password?
          </Link>
        </div>
        
        {/* Login Button */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition duration-200"
          disabled={isLoading}
        >
          {isLoading ? 'Signing In...' : 'Sign In'}
        </button>
        
        {/* Add signup option */}
        <div className="text-center mt-4">
          <p className="text-gray-600">
            Don't have an admin account?{' '}
            <Link to="/admin/signup" className="text-blue-600 hover:text-blue-800">
              Sign up here
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default AdminLogin;
