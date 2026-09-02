import React from 'react';
import { createBrowserRouter, Outlet } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleRouter } from './RoleRouter';

// Dummy components for routes
const Login = () => <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="p-8 bg-white shadow-xl rounded-2xl w-full max-w-md border border-gray-100"><h1 className="text-2xl font-bold mb-4 text-gray-800">Login</h1></div></div>;
const OTP = () => <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="p-8 bg-white shadow-xl rounded-2xl w-full max-w-md border border-gray-100"><h1 className="text-2xl font-bold mb-4 text-gray-800">OTP Verification</h1></div></div>;
const AdminDashboard = () => (
  <div className="space-y-6">
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <h2 className="text-xl font-bold text-gray-800 mb-2">Admin Dashboard</h2>
      <p className="text-gray-500">Welcome to the SMMS Administration Panel.</p>
    </div>
  </div>
);
const ClinicianDashboard = () => (
  <div className="space-y-6">
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <h2 className="text-xl font-bold text-gray-800 mb-2">Clinician Dashboard</h2>
      <p className="text-gray-500">Welcome to the SMMS Clinician Portal.</p>
    </div>
  </div>
);

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/otp',
    element: <OTP />,
  },
  {
    path: '/',
    element: <RoleRouter />,
  },
  {
    element: <AppShell />,
    children: [
      {
        path: '/admin',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <Outlet />
          </ProtectedRoute>
        ),
        children: [
          {
            path: 'dashboard',
            element: <AdminDashboard />,
          },
        ]
      },
      {
        path: '/clinician',
        element: (
          <ProtectedRoute allowedRoles={['CLINICIAN']}>
            <Outlet />
          </ProtectedRoute>
        ),
        children: [
          {
            path: 'dashboard',
            element: <ClinicianDashboard />,
          },
        ]
      }
    ],
  },
]);
