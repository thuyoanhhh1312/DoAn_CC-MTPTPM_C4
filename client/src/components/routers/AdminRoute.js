import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import LoadingToRedirect from "./LoadingToRedirect";
import { currentAdmin } from "../../api/auth";

const AdminRoute = ({ children }) => {
    const { user } = useSelector((state) => ({ ...state }));
    const [ok, setOk] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (user && user.token) {
            currentAdmin(user.token)
                .then((res) => {
                    setOk(true);
                })
                .catch((err) => {
                    setOk(false);
                    navigate("/signin"); // Redirect if not admin
                });
        }
    }, [user, navigate]);

    if (!ok) {
        return <LoadingToRedirect />;
    }

    return children; // Render children (the protected route components) if user is admin
};

export default AdminRoute;
