import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Spin } from 'antd';
import { useAuth } from '@/contexts/AuthContext';
import { buildReturnUrl } from '@/utils/returnUrl';

const RequireAuth = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated, isInitializing } = useAuth();

  if (isInitializing) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!isAuthenticated) {
    const returnUrl = encodeURIComponent(buildReturnUrl(location));
    return <Navigate to={`/signin?returnUrl=${returnUrl}`} replace />;
  }

  return children || <Outlet />;
};

export default RequireAuth;
