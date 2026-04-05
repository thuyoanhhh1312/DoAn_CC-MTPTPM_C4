import { Navigate, Outlet, useSearchParams } from "react-router-dom";
import { Spin } from "antd";
import { resolveReturnUrl } from "@/utils/returnUrl";
import { useSelector } from "react-redux";

const RequireGuest = ({ children }) => {
  const user = useSelector((state) => state.user);
  const isAuthenticated = Boolean(user?.token);
  const isInitializing = false;
  const [searchParams] = useSearchParams();

  if (isInitializing) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (isAuthenticated) {
    const safeReturnUrl = resolveReturnUrl(searchParams.get("returnUrl"));
    return <Navigate to={safeReturnUrl} replace />;
  }

  return children || <Outlet />;
};

export default RequireGuest;
