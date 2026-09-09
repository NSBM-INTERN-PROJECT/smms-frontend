import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, Sparkles, LogOut, KeyRound } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';

export const Header: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const location = useLocation();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Derive section title from path
  const getSectionTitle = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 'Overview & Analytics';
    if (path.includes('/users')) return 'User Account Management';
    if (path.includes('/allocations')) return 'Mentor & Student Allocations';
    if (path.includes('/escalations')) return 'Case Escalation Management';
    if (path.includes('/reports')) return 'Data Reporting & Exports';
    if (path.includes('/slots')) return 'Availability Slots';
    if (path.includes('/meetings')) return 'Scheduled Meetings';
    if (path.includes('/session-notes')) return 'Session Notes & Progress';
    if (path.includes('/profile')) return 'Personal Profile Setup';
    if (path.includes('/progress')) return 'Academic Progress Dashboard';
    return 'Dashboard';
  };

  const roleColor = user?.role === 'ADMIN' ? 'var(--accent-cyan)' : user?.role === 'MENTOR' ? 'var(--accent-violet)' : 'var(--accent-emerald)';

  return (
    <header className="app-header">
      <div className="app-header-title">
        <Sparkles size={18} style={{ color: 'var(--accent-cyan)' }} />
        <span>{getSectionTitle()}</span>
      </div>

      <div className="app-header-actions">
        {/* System status pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.3rem 0.75rem',
          borderRadius: 'var(--radius-full)',
          background: 'rgba(52, 211, 153, 0.08)',
          border: '1px solid rgba(52, 211, 153, 0.2)',
          fontSize: '0.75rem',
          color: '#34D399',
          fontWeight: 600,
        }}>
          <span style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: '#34D399',
            boxShadow: '0 0 8px #34D399',
          }} />
          <span>System Online</span>
        </div>

        {/* Notification Bell */}
        <button
          style={{
            position: 'relative',
            padding: '0.5rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          title="Notifications"
        >
          <Bell size={18} />
          <span style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: 'var(--accent-cyan)',
            boxShadow: '0 0 6px var(--accent-cyan)',
          }} />
        </button>

        {/* User Profile Dropdown button */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.375rem 0.75rem 0.375rem 0.375rem',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <div style={{
              width: '2rem',
              height: '2rem',
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${roleColor} 0%, rgba(255,255,255,0.2) 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#090D16',
              fontWeight: 800,
              fontSize: '0.875rem',
            }}>
              {user?.fullName?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {user?.fullName || user?.email?.split('@')[0] || 'User'}
            </span>
          </button>

          {showProfileMenu && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: 'calc(100% + 0.5rem)',
              width: '220px',
              background: '#0F172A',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: 'var(--radius-lg)',
              padding: '0.5rem',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 40,
            }}>
              <div style={{ padding: '0.75rem 0.875rem', borderBottom: '1px solid var(--border-subtle)' }}>
                <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{user?.fullName || 'User'}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user?.email}</p>
              </div>

              <button
                onClick={() => { setShowProfileMenu(false); navigate('/change-password'); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  width: '100%',
                  padding: '0.625rem 0.875rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  fontSize: '0.8125rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  marginTop: '0.25rem',
                }}
              >
                <KeyRound size={16} />
                <span>Change Password</span>
              </button>

              <button
                onClick={() => { setShowProfileMenu(false); logout(); navigate('/login'); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  width: '100%',
                  padding: '0.625rem 0.875rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--accent-rose)',
                  fontSize: '0.8125rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
