import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { AuthContextType, User, LoginResponse } from '../types';

export const AuthContext = createContext<AuthContextType | null>(null);

// First e wrapper component banai
const AuthProviderWithRouter = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <AuthProvider navigate={navigate} location={location}>
      {children}
    </AuthProvider>
  );
};

type Props = {
  children: React.ReactNode;
  navigate: (path: string) => void;
  location: any;
};

// Main AuthProvider
const AuthProvider = ({ children, navigate }: Props) => {
  const [user, setUser] = useState<User | null>(() => {
    const adminToken = localStorage.getItem('adminToken');
    const userToken = localStorage.getItem('token');

    if (adminToken) {
      try {
        const decoded = jwtDecode(adminToken) as User;
        return { ...decoded, role: 'admin' };
      } catch {
        localStorage.removeItem('adminToken');
      }
    }

    if (userToken) {
      try {
        const decoded = jwtDecode(userToken) as User;
        return { ...decoded, role: 'user' };
      } catch {
        localStorage.removeItem('token');
      }
    }

    return null;
  });

  const [isLoading, setIsLoading] = useState(false); // Added isLoading state

useEffect(() => {
  const initializeAuth = async () => {
    setIsLoading(true);
    const token = localStorage.getItem('token');
    const adminToken = localStorage.getItem('adminToken');

    if (token) {
      try {
        const response = await axios.get('http://localhost:5000/api/users/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser({ ...response.data, role: 'user' });
      } catch (error) {
        console.error('Error fetching user profile:', error);
        localStorage.removeItem('token');
      }
    } else if (adminToken) {
      try {
        const decoded = jwtDecode(adminToken) as User;
        setUser({ ...decoded, role: 'admin' });
      } catch (error) {
        console.error('Error decoding admin token:', error);
        localStorage.removeItem('adminToken');
      }
    }

    setIsLoading(false);
  };

  initializeAuth();
}, []);

  const login = async (email: string, password: string): Promise<LoginResponse> => {
    setIsLoading(true); // Set loading to true during login
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      const userData = { ...user, role: 'user' };
      setUser(userData);
      return {
        success: true,
        user: userData,
        token,
        message: 'Login successful'
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false); // Set loading to false after login completion
    }
  };

  const adminLogin = async (emailOrPhone: string, password: string): Promise<LoginResponse> => {
    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/admin/login', {
        emailOrPhone,
        password
      });

      const { token, admin } = response.data;
      
      if (!admin || !token) {
        throw new Error('Invalid response from server');
      }

      localStorage.setItem('adminToken', token);
      const adminUser = { ...admin, role: 'admin' };
      setUser(adminUser);
      
      return {
        success: true,
        user: adminUser,
        token,
        message: 'Admin login successful'
      };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to login as admin';
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('adminToken');
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, // Include isLoading in the context value
      login, 
      adminLogin, 
      logout, 
      isAuthenticated: !!user 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Export wrapper instead of original provider
export { AuthProviderWithRouter as AuthProvider };

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};