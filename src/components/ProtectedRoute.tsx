import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useOIDC } from '../context/OIDCContext';

interface ProtectedRouteProps {
    children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps): JSX.Element {
    const { isAuthenticated, loading } = useOIDC();

    if (loading) {
        return <div className="text-center text-white mt-20">Loading...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}
