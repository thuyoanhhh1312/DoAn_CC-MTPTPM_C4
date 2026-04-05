import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Spin } from "antd";
import { buildReturnUrl } from "@/utils/returnUrl";
import { useSelector } from "react-redux";

const RequireAuth = ({ children }) => {
  const location = useLocation();
  const user = useSelector((state) => state.user);
  const isAuthenticated = Boolean(user?.token);
  const isInitializing = false;

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
