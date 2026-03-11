import React, { useState, useEffect } from 'react';
import LoginPopup from './LoginPopup';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [showLoginPopup, setShowLoginPopup] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem('userToken');
            const role = localStorage.getItem('userRole');

            if (token) {
                if (allowedRoles && !allowedRoles.includes(role)) {
                    setShowLoginPopup(true);
                } else {
                    setIsAuthenticated(true);
                }
            } else {
                setShowLoginPopup(true);
            }
            setLoading(false);
        };
        checkAuth();
    }, [allowedRoles]);

    if (loading) return null;

    if (isAuthenticated) {
        return children;
    }

    return (
        <>
            <div style={{ height: '100vh', width: '100%', background: '#fafafa' }} />
            {showLoginPopup && <LoginPopup />}
        </>
    );
};

export default ProtectedRoute;
