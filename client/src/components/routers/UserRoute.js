import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { currentUser } from "../../api/auth";

const UserRoute = ({ children }) => {
  const { user } = useSelector((state) => ({ ...state }));
  const [status, setStatus] = useState("checking");
  const accessToken =
    user?.token || JSON.parse(localStorage.getItem("user") || "null")?.token;

  useEffect(() => {
    if (!accessToken) {
      setStatus("unauthenticated");
      return;
    }

    currentUser(accessToken)
      .then(() => {
        setStatus("allowed");
      })
      .catch((err) => {
        if (err?.response?.status === 403) {
          setStatus("forbidden");
          return;
        }
        setStatus("unauthenticated");
      });
  }, [accessToken]);

  if (status === "checking") {
    return null;
  }

  if (status === "forbidden") {
    return <Navigate to="/403" replace />;
  }

  if (status !== "allowed") {
    return <Navigate to="/signin" replace />;
  }

  return children;
};

export default UserRoute;
