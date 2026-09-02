import React from 'react';
import { Navigate } from 'react-router-dom';
// import { useAuth } from '../hooks/useAuth';

export const RoleRouter: React.FC = () => {
  // Mock auth
  const token = 'mock-token';
  const role = 'ADMIN';

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  switch (role) {
    case 'ADMIN':
      return <Navigate to="/admin/dashboard" replace />;
    case 'CLINICIAN':
      return <Navigate to="/clinician/dashboard" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};
