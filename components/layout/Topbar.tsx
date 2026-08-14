'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Role } from '@/types';
import { mockStore } from '@/lib/mockStore';
import {
  Bell,
  GraduationCap,
  LogOut,
  ChevronDown,
  CheckCheck,
  ExternalLink,
  ShieldCheck,
  Menu,
  X,
} from 'lucide-react';

interface TopbarProps {
  onMenuToggle?: () => void;
  mobileMenuOpen?: boolean;
}

export const Topbar: React.FC<TopbarProps> = ({ onMenuToggle, mobileMenuOpen = false }) => {
  const { user, role, switchRole, logout } = useAuth();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState(mockStore.getNotifications());

  const roleMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    mockStore.markAllNotificationsRead();
    setNotifications([...mockStore.getNotifications()]);
  };

  // Click outside and Escape key handler
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (roleMenuRef.current && !roleMenuRef.current.contains(target)) {
        setShowRoleMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(target)) {
        setShowNotifications(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowRoleMenu(false);
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleDocumentClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand & Mobile Hamburger */}
        <div className="flex items-center gap-3">
          {onMenuToggle && (
            <button
              type="button"
              onClick={onMenuToggle}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}

          <Link
            href="/"
            className="flex items-center gap-2.5 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none rounded-lg"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white font-bold tracking-wider">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold tracking-tight text-slate-900 text-base">
                SMMS
              </span>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Student Mentoring Management System
              </p>
            </div>
          </Link>
        </div>

        {/* Center: Interactive Role Switcher */}
        <div className="relative" ref={roleMenuRef}>
          <button
            type="button"
            onClick={() => {
              setShowRoleMenu(!showRoleMenu);
              if (!showRoleMenu) setShowNotifications(false);
            }}
            aria-haspopup="menu"
            aria-expanded={showRoleMenu}
            aria-label="Switch portal role"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-medium text-slate-700 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span className="text-slate-500 hidden md:inline">Current View:</span>
            <span className="font-semibold text-slate-900 uppercase">
              {role || 'Select Role'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showRoleMenu && (
            <div
              role="menu"
              className="absolute left-1/2 -translate-x-1/2 mt-2 w-60 rounded-xl bg-white border border-slate-200 shadow-lg py-1.5 z-50"
            >
              <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Switch Portal Role
              </div>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  switchRole(Role.STUDENT);
                  setShowRoleMenu(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left hover:bg-slate-50 transition-colors focus-visible:bg-slate-50 focus-visible:outline-none ${
                  role === Role.STUDENT ? 'font-semibold text-indigo-600 bg-indigo-50/50' : 'text-slate-700'
                }`}
              >
                <span>Student (John Doe)</span>
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200">
                  Student
                </span>
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  switchRole(Role.MENTOR);
                  setShowRoleMenu(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left hover:bg-slate-50 transition-colors focus-visible:bg-slate-50 focus-visible:outline-none ${
                  role === Role.MENTOR ? 'font-semibold text-indigo-600 bg-indigo-50/50' : 'text-slate-700'
                }`}
              >
                <span>Mentor (Dr. Grace Hopper)</span>
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-800 border border-indigo-200">
                  Mentor
                </span>
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  switchRole(Role.COORDINATOR);
                  setShowRoleMenu(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left hover:bg-slate-50 transition-colors focus-visible:bg-slate-50 focus-visible:outline-none ${
                  role === Role.COORDINATOR ? 'font-semibold text-indigo-600 bg-indigo-50/50' : 'text-slate-700'
                }`}
              >
                <span>Coordinator (Prof. Ada)</span>
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-violet-50 text-violet-800 border border-violet-200">
                  Coord
                </span>
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  switchRole(Role.ADMIN);
                  setShowRoleMenu(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left hover:bg-slate-50 transition-colors focus-visible:bg-slate-50 focus-visible:outline-none ${
                  role === Role.ADMIN ? 'font-semibold text-indigo-600 bg-indigo-50/50' : 'text-slate-700'
                }`}
              >
                <span>Admin (Dr. Alan Turing)</span>
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200">
                  Admin
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Right: Notifications & User Profile */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => {
                setShowNotifications(!showNotifications);
                if (!showNotifications) setShowRoleMenu(false);
              }}
              aria-label="View notifications"
              aria-haspopup="true"
              aria-expanded={showNotifications}
              className="relative p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div
                role="dialog"
                aria-label="Notifications panel"
                className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white border border-slate-200 shadow-xl overflow-hidden z-50"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                      Notifications
                    </span>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 text-rose-800">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllRead}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none rounded"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-500">No notifications</div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-3.5 text-xs hover:bg-slate-50 transition-colors ${
                          !n.read ? 'bg-indigo-50/30' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-slate-900">{n.title}</p>
                          <span className="text-[10px] text-slate-500 whitespace-nowrap">
                            {new Date(n.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                        {n.linkUrl && (
                          <Link
                            href={n.linkUrl}
                            onClick={() => setShowNotifications(false)}
                            className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-indigo-600 hover:text-indigo-800 focus-visible:ring-1 focus-visible:ring-indigo-600 rounded"
                          >
                            View details
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            {(() => {
              const profileUrl =
                role === Role.STUDENT
                  ? '/student/profile'
                  : role === Role.MENTOR
                  ? '/mentor/profile'
                  : '/admin/profile';
              return (
                <Link
                  href={profileUrl}
                  title="View Profile"
                  className="flex items-center gap-2.5 p-1 -m-1 rounded-lg hover:bg-slate-100 transition-colors focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none group"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-semibold text-xs text-slate-700 overflow-hidden group-hover:bg-slate-300 transition-colors">
                    {user?.fullName
                      ? user.fullName
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)
                      : 'U'}
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-xs font-semibold text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">
                      {user?.fullName}
                    </p>
                    <p className="text-[11px] text-slate-500 leading-tight">{user?.email}</p>
                  </div>
                </Link>
              );
            })()}

            <button
              type="button"
              onClick={logout}
              title="Sign Out"
              aria-label="Sign Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none transition-colors ml-1"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
