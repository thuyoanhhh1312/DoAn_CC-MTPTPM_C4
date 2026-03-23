import { Navigate, Outlet, useSearchParams } from 'react-router-dom';
import { Spin } from 'antd';
import { useAuth } from '@/contexts/AuthContext';
import { resolveReturnUrl } from '@/utils/returnUrl';

const RequireGuest = ({ children }) => {
  const { isAuthenticated, isInitializing } = useAuth();
  const [searchParams] = useSearchParams();

  if (isInitializing) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (isAuthenticated) {
    const safeReturnUrl = resolveReturnUrl(searchParams.get('returnUrl'));
    return <Navigate to={safeReturnUrl} replace />;
  }

  return children || <Outlet />;
};

export default RequireGuest;
