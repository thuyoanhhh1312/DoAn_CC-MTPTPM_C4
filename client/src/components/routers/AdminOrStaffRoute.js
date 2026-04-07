import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const AdminOrStaffRoute = ({ children }) => {
  const { user } = useSelector((state) => ({ ...state }));

  let storedUser = null;
  try {
    storedUser = JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    storedUser = null;
  }

  const currentUser = user?.token ? user : storedUser;
  const accessToken = currentUser?.token;
  const roleId = Number(currentUser?.role_id);

  if (!accessToken) {
    return <Navigate to="/signin" replace />;
  }

  if (roleId !== 1 && roleId !== 3) {
    return <Navigate to="/403" replace />;
  }

  return children;
};

export default AdminOrStaffRoute;
