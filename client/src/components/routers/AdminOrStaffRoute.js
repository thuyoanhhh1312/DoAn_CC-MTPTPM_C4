import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import LoadingToRedirect from "./LoadingToRedirect";
import { currentAdminOrStaff } from "../../api/auth";

const AdminOrStaffRoute = ({ children }) => {
  const { user } = useSelector((state) => ({ ...state }));
  const [ok, setOk] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.token) {
      currentAdminOrStaff(user.token)
        .then((res) => {
          setOk(true);
        })
        .catch((err) => {
          setOk(false);
          navigate("/signin");
        });
    }
  }, [user, navigate]);

  if (!ok) {
    return <LoadingToRedirect />;
  }

  return children;
};

export default AdminOrStaffRoute;
