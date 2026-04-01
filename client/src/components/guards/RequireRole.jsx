import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Spin } from "antd";
import { extractUserRoles } from "@/utils/roles";
import { useSelector } from "react-redux";

const RequireRole = ({ allowedRoles = [], children }) => {
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
    return (
      <Navigate
        to={`/signin?returnUrl=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }

  const userRoles = extractUserRoles(user);
  const hasRole = userRoles.some((role) => allowedRoles.includes(role));

  if (!hasRole) {
    return <Navigate to="/403" replace />;
  }

  return children || <Outlet />;
};

export default RequireRole;
