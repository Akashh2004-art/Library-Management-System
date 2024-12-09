import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    emailOrPhone: '',
    password: '',
  });

  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.emailOrPhone || !formData.password) {
      return toast.error('Please fill in all the fields.');
    }

    try {
      const response = await axios.post('http://localhost:5000/api/admin/login', formData);
      toast.success(response.data.message);

      // Save token to localStorage or state management
      localStorage.setItem('adminToken', response.data.token);

      // Redirect to admin dashboard
      navigate('/admin');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Handle Axios-specific error
        toast.error(error.response?.data?.message || 'Login failed. Please try again.');
      } else {
        // Handle generic errors
        toast.error('An unexpected error occurred. Please try again.');
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-md space-y-4 w-full max-w-md"
      >
        <h1 className="text-2xl font-bold">Admin Login</h1>
        <input
          type="text"
          name="emailOrPhone"
          placeholder="Email or Phone"
          value={formData.emailOrPhone}
          onChange={handleChange}
          className="input-field"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="input-field"
        />
        <button type="submit" className="btn-primary">
          Log In
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;
