import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Spin } from 'antd';
import { useAuth } from '@/contexts/AuthContext';
import { extractUserRoles } from '@/utils/roles';

const RequireRole = ({ allowedRoles = [], children }) => {
  const location = useLocation();
  const { user, isAuthenticated, isInitializing } = useAuth();

  if (isInitializing) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={`/signin?returnUrl=${encodeURIComponent(location.pathname)}`} replace />;
  }

  const userRoles = extractUserRoles(user);
  const hasRole = userRoles.some((role) => allowedRoles.includes(role));

  if (!hasRole) {
    return <Navigate to="/403" replace />;
  }

  return children || <Outlet />;
};

export default RequireRole;
