import React from 'react';
import { Navigate } from 'react-router-dom';
// import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  // Mock auth
  const token = 'mock-token';
  const role = 'ADMIN';

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />; // RoleRouter will catch this at root
  }

  return <>{children}</>;
};
