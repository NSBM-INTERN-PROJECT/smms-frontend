import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Link as LinkIcon, AlertTriangle,
  BarChart3, Calendar, CalendarClock, BookOpen, GraduationCap,
  UserCircle, MessageSquarePlus, TrendingUp, LogOut, GraduationCapIcon
} from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
}

export const Sidebar: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const role = user?.role || 'GUEST';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getLinks = (): NavItem[] => {
    switch (role) {
      case 'ADMIN':
        return [
          { to: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
          { to: '/admin/users', label: 'Users', icon: <Users size={18} /> },
          { to: '/admin/allocations', label: 'Allocations', icon: <LinkIcon size={18} /> },
          { to: '/admin/escalations', label: 'Escalations', icon: <AlertTriangle size={18} /> },
          { to: '/admin/reports', label: 'Reports', icon: <BarChart3 size={18} /> },
        ];
      case 'COORDINATOR':
        return [
          { to: '/coordinator/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
          { to: '/coordinator/allocations', label: 'Allocations', icon: <LinkIcon size={18} /> },
          { to: '/coordinator/escalations', label: 'Escalations', icon: <AlertTriangle size={18} /> },
        ];
      case 'MENTOR':
        return [
          { to: '/mentor/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
          { to: '/mentor/students', label: 'My Students', icon: <GraduationCap size={18} /> },
          { to: '/mentor/slots', label: 'Slots', icon: <CalendarClock size={18} /> },
          { to: '/mentor/meetings', label: 'Meetings', icon: <Calendar size={18} /> },
          { to: '/mentor/session-notes', label: 'Session Notes', icon: <BookOpen size={18} /> },
          { to: '/mentor/escalations', label: 'Escalations', icon: <AlertTriangle size={18} /> },
        ];
      case 'STUDENT':
        return [
          { to: '/student/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
          { to: '/student/profile', label: 'My Profile', icon: <UserCircle size={18} /> },
          { to: '/student/meetings', label: 'Meetings', icon: <Calendar size={18} /> },
          { to: '/student/meeting-requests', label: 'Request Meeting', icon: <MessageSquarePlus size={18} /> },
          { to: '/student/progress', label: 'Progress', icon: <TrendingUp size={18} /> },
        ];
      default:
        return [];
    }
  };

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <GraduationCapIcon className="sidebar-brand-icon" size={28} />
        <span>SMMS</span>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {getLinks().map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'sidebar-link--active' : ''}`
            }
          >
            <span className="sidebar-link-icon">{link.icon}</span>
            <span className="sidebar-link-label">{link.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <span className="sidebar-user-role">{role}</span>
          <span className="sidebar-user-email">{user?.email || ''}</span>
        </div>
        <button onClick={handleLogout} className="sidebar-logout" title="Logout">
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
};
