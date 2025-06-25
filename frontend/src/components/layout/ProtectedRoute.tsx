import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  role: 'user' | 'admin';
}

const ProtectedRoute = ({ children, role }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();

  // Show loading state or spinner while checking authentication
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Redirect to appropriate login page if not authenticated
  if (!user) {
    return <Navigate to={role === 'admin' ? '/admin/login' : '/login'} />;
  }

  // Check role-based access
  if (role === 'admin' && user.role !== 'admin') {
    return <Navigate to="/login" />;
  }

  if (role === 'user' && user.role !== 'user') {
    return <Navigate to="/admin/login" />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
