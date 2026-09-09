import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { changePassword } from '../../api/auth.api';
import { useAuthStore } from '../../store/auth.store';

export const ChangePasswordPage: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const setAuth = useAuthStore((s) => s.setAuth);
  const token = useAuthStore((s) => s.token);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await changePassword({ currentPassword, newPassword, confirmPassword });
      
      setSuccess('Password updated successfully! Redirecting...');
      
      // Update stored user object to set mustChangePassword = false
      if (token && user) {
        setAuth(token, { ...user, mustChangePassword: false });
      }

      setTimeout(() => {
        navigate('/');
      }, 1500);

    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to update password. Please check your current password.';
      setError(msg);
      console.error('Password update error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#0C1220',
      color: '#F1F5F9',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      padding: '1.5rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute', top: '25%', left: '35%',
        width: '35%', height: '35%',
        background: 'radial-gradient(circle, rgba(34,211,238,0.12) 0%, transparent 70%)',
        filter: 'blur(90px)', pointerEvents: 'none',
      }} />

      <div style={{
        background: '#111827',
        padding: '2.5rem',
        borderRadius: '1.5rem',
        width: '100%',
        maxWidth: '420px',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.6)',
        position: 'relative',
        zIndex: 1,
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '3.5rem',
            height: '3.5rem',
            borderRadius: '1rem',
            background: 'rgba(34,211,238,0.1)',
            border: '1px solid rgba(34,211,238,0.2)',
            fontSize: '1.5rem',
            marginBottom: '1rem',
          }}>
            🔑
          </div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
            Update Password
          </h2>
          <p style={{ color: '#94A3B8', fontSize: '0.875rem' }}>
            {user?.mustChangePassword
              ? 'First time login detected. Please create a new password to continue.'
              : 'Update your account password below.'}
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(251, 113, 133, 0.1)',
            border: '1px solid rgba(251, 113, 133, 0.25)',
            borderRadius: '0.75rem',
            padding: '0.75rem 1rem',
            marginBottom: '1.25rem',
            color: '#FB7185',
            fontSize: '0.8125rem',
            lineHeight: 1.5,
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            background: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.25)',
            borderRadius: '0.75rem',
            padding: '0.75rem 1rem',
            marginBottom: '1.25rem',
            color: '#4ADE80',
            fontSize: '0.8125rem',
            lineHeight: 1.5,
          }}>
            {success}
          </div>
        )}

        <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.375rem', color: '#94A3B8', fontSize: '0.8125rem', fontWeight: 500 }}>
              Current / Temporary Password
            </label>
            <input 
              type="password" 
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '0.75rem',
                background: 'rgba(0,0,0,0.25)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#F1F5F9',
                fontSize: '0.875rem',
                outline: 'none',
                fontFamily: 'inherit',
                transition: 'border-color 0.15s ease',
              }}
              required 
              onFocus={e => e.currentTarget.style.borderColor = 'rgba(34,211,238,0.4)'}
              onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.375rem', color: '#94A3B8', fontSize: '0.8125rem', fontWeight: 500 }}>
              New Password
            </label>
            <input 
              type="password" 
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '0.75rem',
                background: 'rgba(0,0,0,0.25)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#F1F5F9',
                fontSize: '0.875rem',
                outline: 'none',
                fontFamily: 'inherit',
                transition: 'border-color 0.15s ease',
              }}
              required 
              onFocus={e => e.currentTarget.style.borderColor = 'rgba(34,211,238,0.4)'}
              onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.375rem', color: '#94A3B8', fontSize: '0.8125rem', fontWeight: 500 }}>
              Confirm New Password
            </label>
            <input 
              type="password" 
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '0.75rem',
                background: 'rgba(0,0,0,0.25)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#F1F5F9',
                fontSize: '0.875rem',
                outline: 'none',
                fontFamily: 'inherit',
                transition: 'border-color 0.15s ease',
              }}
              required 
              onFocus={e => e.currentTarget.style.borderColor = 'rgba(34,211,238,0.4)'}
              onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.875rem',
              borderRadius: '0.75rem',
              background: loading ? '#0E7490' : 'linear-gradient(135deg, #22D3EE 0%, #06B6D4 100%)',
              color: '#0C1220',
              fontWeight: 700,
              fontSize: '0.9375rem',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '0.5rem',
              transition: 'all 0.2s ease',
              fontFamily: 'inherit',
              boxShadow: loading ? 'none' : '0 0 20px rgba(34,211,238,0.2)',
            }}
          >
            {loading ? 'Updating Password…' : 'Update Password →'}
          </button>
        </form>
      </div>
    </div>
  );
};
