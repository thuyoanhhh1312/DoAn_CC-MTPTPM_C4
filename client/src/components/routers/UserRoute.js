import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import LoadingToRedirect from "./LoadingToRedirect";
import { currentUser } from "../../api/auth";

const UserRoute = ({ children }) => {
    const { user } = useSelector((state) => ({ ...state }));
    const [ok, setOk] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (user && user.token) {
            currentUser(user.token)
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

export default UserRoute;
