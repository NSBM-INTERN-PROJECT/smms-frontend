import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../api/auth.api';
import { useAuthStore } from '../../store/auth.store';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login({ email, password });
      navigate('/otp', { state: { email } });
    } catch (err: any) {
      const msg = err?.response?.data?.message
        || err?.message
        || 'Login failed. Please check your credentials.';
      setError(msg);
      console.error("Login failed", err);
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
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
    }}>
      {/* ─── Left Hero Panel ─────────────────────────────────────────────── */}
      <div style={{
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
        padding: '3rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}>
        {/* Glow effects */}
        <div style={{
          position: 'absolute', top: '-10%', left: '-10%',
          width: '60%', height: '60%',
          background: 'radial-gradient(circle, rgba(34,211,238,0.2) 0%, transparent 70%)',
          filter: 'blur(80px)', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-10%', right: '-10%',
          width: '60%', height: '60%',
          background: 'radial-gradient(circle, rgba(245,158,11,0.15) 0%, transparent 70%)',
          filter: 'blur(80px)', pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#22D3EE', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.75rem' }}>
            Student Mentor Management System
          </p>
          <h1 style={{
            fontFamily: "var(--font-display)",
            fontSize: '4.5rem',
            fontWeight: 800,
            letterSpacing: '-0.04em',
            lineHeight: 1,
            marginBottom: '1.5rem',
            background: 'linear-gradient(135deg, #F1F5F9 0%, #94A3B8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            SMMS
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '1.05rem', lineHeight: 1.7, maxWidth: '28rem', marginBottom: '2.5rem' }}>
            Streamline mentor-student relationships with intelligent allocation,
            meeting management, and progress tracking.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              ['✨', 'Smart Mentor-Student Allocation'],
              ['📈', 'Real-time Progress Tracking'],
              ['⚡', 'Escalation & Session Management'],
            ].map(([icon, text]) => (
              <div key={text} style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                padding: '0.75rem 1.25rem',
                borderRadius: '9999px',
                width: 'fit-content',
                fontSize: '0.875rem',
                color: '#CBD5E1',
                backdropFilter: 'blur(8px)',
              }}>
                <span>{icon}</span>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Right Login Form ────────────────────────────────────────────── */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        position: 'relative',
        zIndex: 1,
      }}>
        <div style={{
          background: '#111827',
          padding: '2.5rem',
          borderRadius: '1.5rem',
          width: '100%',
          maxWidth: '420px',
          border: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.6)',
        }}>
          <h2 style={{
            fontFamily: "var(--font-display)",
            fontSize: '1.75rem',
            fontWeight: 800,
            marginBottom: '0.375rem',
            letterSpacing: '-0.02em',
          }}>
            Welcome Back
          </h2>
          <p style={{ color: '#64748B', fontSize: '0.875rem', marginBottom: '2rem' }}>
            Sign in to continue to your dashboard
          </p>

          {/* Error message */}
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

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.375rem', color: '#94A3B8', fontSize: '0.8125rem', fontWeight: 500 }}>
                Email Address
              </label>
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
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
                placeholder="you@example.com"
                required
                onFocus={e => e.currentTarget.style.borderColor = 'rgba(34,211,238,0.4)'}
                onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.375rem', color: '#94A3B8', fontSize: '0.8125rem', fontWeight: 500 }}>
                Password
              </label>
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
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
                placeholder="••••••••"
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
                letterSpacing: '-0.01em',
                boxShadow: loading ? 'none' : '0 0 20px rgba(34,211,238,0.2)',
              }}
            >
              {loading ? 'Signing in…' : 'Sign In →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.8125rem', color: '#475569' }}>
            Having trouble? Contact your system administrator.
          </p>
        </div>
      </div>
    </div>
  );
};
