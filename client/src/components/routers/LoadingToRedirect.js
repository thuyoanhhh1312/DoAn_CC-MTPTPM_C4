import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const LoadingToRedirect = () => {
    const [count, setCount] = useState(5);
    const navigate = useNavigate();
    useEffect(() => {
        const interval = setInterval(() => {
            setCount((currentCount) => --currentCount);
        }, 1000);

        if (count === 0) {
            navigate("/");
        }

        // Cleanup
        return () => clearInterval(interval);
    }, [count, navigate]);

    return (
        <div className="container p-5 text-center">
            <p>Redirecting you in {count} seconds</p>
        </div>
    );
};

export default LoadingToRedirect;
