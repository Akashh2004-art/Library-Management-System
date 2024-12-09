import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';


const AdminSignup = () => {
  const [formData, setFormData] = useState({
    instituteName: '',
    name: '',
    phoneNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Form validation
    if (Object.values(formData).some((field) => field.trim() === '')) {
      return toast.error('Please fill in all the fields.');
    }
    if (formData.password !== formData.confirmPassword) {
      return toast.error('Passwords do not match.');
    }

    try {
      const response = await axios.post('http://localhost:5000/api/admin/register', formData);
      toast.success(response.data.message);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Axios-specific error handling
        toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
      } else {
        // Generic error handling
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
        <h1 className="text-2xl font-bold">Admin Signup</h1>
        <input
          type="text"
          name="instituteName"
          placeholder="Institute Name"
          value={formData.instituteName}
          onChange={handleChange}
          className="input-field"
        />
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          className="input-field"
        />
        <input
          type="text"
          name="phoneNumber"
          placeholder="Phone Number"
          value={formData.phoneNumber}
          onChange={handleChange}
          className="input-field"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
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
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          className="input-field"
        />
        <button type="submit" className="btn-primary">
          Sign Up
        </button>
      </form>
    </div>
  );
};

export default AdminSignup;
