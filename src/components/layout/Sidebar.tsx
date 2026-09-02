import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, ShieldAlert } from 'lucide-react';
// import { useAuth } from '../../hooks/useAuth';

export const Sidebar: React.FC = () => {
  // Mock auth hook
  const role = 'ADMIN';

  const getLinks = () => {
    switch(role) {
      case 'ADMIN':
        return [
          { to: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
          { to: '/admin/users', label: 'Users', icon: <Users size={18} /> },
        ];
      case 'CLINICIAN':
        return [
          { to: '/clinician/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
          { to: '/clinician/patients', label: 'Patients', icon: <Users size={18} /> },
        ];
      default:
        return [
          { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
        ];
    }
  };

  return (
    <aside className="sidebar flex flex-col h-screen w-60 bg-gray-900 text-white border-r border-gray-800 z-20">
      <div className="p-5 flex items-center gap-3 font-bold text-2xl tracking-wide border-b border-gray-800 bg-gray-950">
        <ShieldAlert className="text-blue-500" size={28} />
        SMMS
      </div>
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {getLinks().map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 p-3 rounded-xl transition-all duration-200 font-medium ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-gray-400 hover:bg-gray-800 hover:text-gray-100'}`
            }
          >
            {link.icon}
            {link.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-800 text-sm text-gray-400 flex justify-between items-center bg-gray-950">
        <span className="font-medium">Role:</span>
        <span className="badge badge-primary px-2.5 py-1 rounded-md bg-blue-900/50 text-blue-300 text-xs font-bold border border-blue-800/50">{role || 'GUEST'}</span>
      </div>
    </aside>
  );
};
