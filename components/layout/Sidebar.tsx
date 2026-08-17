'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Role } from '@/types';
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Clock,
  FileText,
  AlertTriangle,
  FileCheck2,
  ListTodo,
  UserCheck,
  Filter,
  FolderDown,
  UserCog,
  BookOpen,
} from 'lucide-react';

interface SidebarProps {
  onItemClick?: () => void;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ onItemClick, className = '' }) => {
  const pathname = usePathname();
  const { role } = useAuth();

  let navItems: Array<{ label: string; href: string; icon: React.ComponentType<{ className?: string }> }> = [];

  if (role === Role.STUDENT) {
    navItems = [
      { label: 'Dashboard', href: '/student/dashboard', icon: LayoutDashboard },
      { label: 'My Profile', href: '/student/profile', icon: UserCheck },
      { label: 'Meetings & Slots', href: '/student/meetings', icon: CalendarDays },
      { label: 'Request Meeting', href: '/student/request-meeting', icon: Clock },
      { label: 'Data Surveys', href: '/student/tasks', icon: ListTodo },
    ];
  } else if (role === Role.MENTOR) {
    navItems = [
      { label: 'Dashboard', href: '/mentor/dashboard', icon: LayoutDashboard },
      { label: 'Faculty Profile', href: '/mentor/profile', icon: UserCheck },
      { label: 'Student Roster', href: '/mentor/students', icon: Users },
      { label: 'Slot Generator', href: '/mentor/slots', icon: Clock },
      { label: 'Meeting Manager', href: '/mentor/meetings', icon: CalendarDays },
      { label: 'Session Notes & Issues', href: '/mentor/sessions', icon: FileText },
      { label: 'Pending Approvals', href: '/mentor/approvals', icon: FileCheck2 },
    ];
  } else {
    // Admin / Coordinator / Management
    navItems = [
      { label: 'Master Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
      { label: 'Admin Profile', href: '/admin/profile', icon: UserCheck },
      { label: 'Allocation Hub', href: '/admin/allocations', icon: Users },
      { label: 'Mentor Directory', href: '/admin/mentor-view', icon: Filter },
      { label: 'Escalations Board', href: '/admin/escalations', icon: AlertTriangle },
      { label: 'User Directory', href: '/admin/users', icon: UserCog },
      { label: 'Reports & Exports', href: '/admin/reports', icon: FolderDown },
    ];
  }

  return (
    <aside
      aria-label="Main Navigation"
      className={`w-64 bg-slate-50 border-r border-slate-200 flex flex-col shrink-0 min-h-[calc(100vh-4rem)] ${className}`}
    >
      <div className="p-4 flex-1">
        <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">
          Navigation
        </div>
        <nav aria-label="Main navigation" className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== '/admin/dashboard' &&
                item.href !== '/student/dashboard' &&
                item.href !== '/mentor/dashboard' &&
                pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onItemClick}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none ${
                  isActive
                    ? 'bg-slate-900 text-white font-semibold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-200 text-[11px] text-slate-500">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-slate-400" />
          <span>SMMS Academic Portal</span>
        </div>
      </div>
    </aside>
  );
};
