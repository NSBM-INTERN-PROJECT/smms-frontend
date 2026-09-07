import React from 'react';
import { createBrowserRouter, Outlet } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleRouter } from './RoleRouter';

// ─── Auth Pages ────────────────────────────────────────────────────────────────
import { LoginPage } from '../pages/auth/LoginPage';
import { OtpPage } from '../pages/auth/OtpPage';
import { ChangePasswordPage } from '../pages/auth/ChangePasswordPage';

// ─── Admin Pages ───────────────────────────────────────────────────────────────
import AdminDashboardPage from '../pages/admin/DashboardPage';
import AdminUsersPage from '../pages/admin/UsersPage';
import AdminAllocationsPage from '../pages/admin/AllocationsPage';
import AdminEscalationsPage from '../pages/admin/EscalationsPage';
import AdminReportsPage from '../pages/admin/ReportsPage';

// ─── Coordinator Pages ─────────────────────────────────────────────────────────
import CoordinatorDashboardPage from '../pages/coordinator/DashboardPage';
import CoordinatorAllocationsPage from '../pages/coordinator/AllocationsPage';
import CoordinatorEscalationsPage from '../pages/coordinator/EscalationsPage';

// ─── Mentor Pages ──────────────────────────────────────────────────────────────
import MentorDashboardPage from '../pages/mentor/DashboardPage';
import MentorSlotsPage from '../pages/mentor/SlotsPage';
import MentorMeetingsPage from '../pages/mentor/MeetingsPage';
import MentorStudentsPage from '../pages/mentor/StudentsPage';
import MentorSessionNotesPage from '../pages/mentor/SessionNotesPage';
import MentorEscalationsPage from '../pages/mentor/EscalationsPage';

// ─── Student Pages ─────────────────────────────────────────────────────────────
import StudentDashboardPage from '../pages/student/DashboardPage';
import StudentProfilePage from '../pages/student/ProfilePage';
import StudentMeetingsPage from '../pages/student/MeetingsPage';
import StudentMeetingRequestsPage from '../pages/student/MeetingRequestsPage';
import StudentProgressPage from '../pages/student/ProgressPage';

export const router = createBrowserRouter([
  // ─── Public Routes ─────────────────────────────────────────────────────────
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/otp',
    element: <OtpPage />,
  },
  {
    path: '/change-password',
    element: <ChangePasswordPage />,
  },

  // ─── Root Redirect ─────────────────────────────────────────────────────────
  {
    path: '/',
    element: <RoleRouter />,
  },

  // ─── Protected Routes (inside AppShell layout) ─────────────────────────────
  {
    element: <AppShell />,
    children: [
      // ── Admin ──────────────────────────────────────────────────────────────
      {
        path: '/admin',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <Outlet />
          </ProtectedRoute>
        ),
        children: [
          { path: 'dashboard', element: <AdminDashboardPage /> },
          { path: 'users', element: <AdminUsersPage /> },
          { path: 'allocations', element: <AdminAllocationsPage /> },
          { path: 'escalations', element: <AdminEscalationsPage /> },
          { path: 'reports', element: <AdminReportsPage /> },
        ],
      },

      // ── Coordinator ────────────────────────────────────────────────────────
      {
        path: '/coordinator',
        element: (
          <ProtectedRoute allowedRoles={['COORDINATOR']}>
            <Outlet />
          </ProtectedRoute>
        ),
        children: [
          { path: 'dashboard', element: <CoordinatorDashboardPage /> },
          { path: 'allocations', element: <CoordinatorAllocationsPage /> },
          { path: 'escalations', element: <CoordinatorEscalationsPage /> },
        ],
      },

      // ── Mentor ─────────────────────────────────────────────────────────────
      {
        path: '/mentor',
        element: (
          <ProtectedRoute allowedRoles={['MENTOR']}>
            <Outlet />
          </ProtectedRoute>
        ),
        children: [
          { path: 'dashboard', element: <MentorDashboardPage /> },
          { path: 'slots', element: <MentorSlotsPage /> },
          { path: 'meetings', element: <MentorMeetingsPage /> },
          { path: 'students', element: <MentorStudentsPage /> },
          { path: 'session-notes', element: <MentorSessionNotesPage /> },
          { path: 'escalations', element: <MentorEscalationsPage /> },
        ],
      },

      // ── Student ────────────────────────────────────────────────────────────
      {
        path: '/student',
        element: (
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <Outlet />
          </ProtectedRoute>
        ),
        children: [
          { path: 'dashboard', element: <StudentDashboardPage /> },
          { path: 'profile', element: <StudentProfilePage /> },
          { path: 'meetings', element: <StudentMeetingsPage /> },
          { path: 'meeting-requests', element: <StudentMeetingRequestsPage /> },
          { path: 'progress', element: <StudentProgressPage /> },
        ],
      },
    ],
  },
]);
