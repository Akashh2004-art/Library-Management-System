import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const ProtectedRoute = ({
  children,
  requireAdmin = false,
}: {
  children: JSX.Element;
  requireAdmin?: boolean;
}) => {
  const token = localStorage.getItem('adminToken') || localStorage.getItem('userToken');

  if (!token) {
    // Redirect to appropriate login page based on admin requirement
    return <Navigate to={requireAdmin ? '/admin/login' : '/login'} />;
  }

  try {
    const decodedToken: any = jwtDecode(token);

    // Check for admin-specific routes
    if (requireAdmin && decodedToken.role !== 'admin') {
      return <Navigate to="/" />;
    }

    // Token valid, render the route
    return children;
  } catch (error) {
    console.error('Invalid token:', error);
    localStorage.removeItem('adminToken');
    localStorage.removeItem('userToken');
    return <Navigate to="/login" />;
  }
};

export default ProtectedRoute;
