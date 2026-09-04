import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../api/auth.api';
import { useAuthStore } from '../../store/auth.store';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [error, setError] = useState('');
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await login({ email, password, role });
      if (res && res.token && res.user) {
        setAuth(res.token, res.user);
      }
      navigate('/otp', { state: { email } });
    } catch (err) {
      setError('Login failed. Please check your credentials.');
      console.error("Login failed", err);
    }
  };

  return (
    <div className="login-container" style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0C1220', color: 'white' }}>
      <div className="login-hero" style={{ flex: 1, position: 'relative', overflow: 'hidden', padding: '3rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '60%', height: '60%', background: 'radial-gradient(circle, rgba(34,211,238,0.2) 0%, rgba(12,18,32,0) 70%)', filter: 'blur(60px)' }}></div>
        <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '60%', height: '60%', background: 'radial-gradient(circle, rgba(245,158,11,0.15) 0%, rgba(12,18,32,0) 70%)', filter: 'blur(60px)' }}></div>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '4.5rem', fontWeight: 800, marginBottom: '2rem', zIndex: 1 }}>SMMS</h1>
        <div style={{ zIndex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="feature-pill" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.75rem 1.5rem', borderRadius: '9999px', width: 'fit-content', backdropFilter: 'blur(10px)' }}>✨ AI-Assisted Matching</div>
          <div className="feature-pill" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.75rem 1.5rem', borderRadius: '9999px', width: 'fit-content', backdropFilter: 'blur(10px)' }}>📈 Progress Tracking</div>
          <div className="feature-pill" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.75rem 1.5rem', borderRadius: '9999px', width: 'fit-content', backdropFilter: 'blur(10px)' }}>⚡ Escalation Management</div>
        </div>
      </div>
      <div className="login-form-side" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', zIndex: 1 }}>
        <div className="login-card" style={{ background: '#111827', padding: '3rem', borderRadius: '1.5rem', width: '100%', maxWidth: '450px', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', fontWeight: 'bold' }}>Welcome Back</h2>
          <div className="role-pills" style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
            {['ADMIN', 'COORDINATOR', 'MENTOR', 'STUDENT'].map(r => (
              <button 
                key={r}
                type="button"
                onClick={() => setRole(r)}
                style={{ 
                  padding: '0.5rem 1rem', 
                  borderRadius: '9999px', 
                  border: '1px solid',
                  borderColor: role === r ? '#22D3EE' : 'rgba(255,255,255,0.1)',
                  background: role === r ? 'rgba(34,211,238,0.1)' : 'transparent',
                  color: role === r ? '#22D3EE' : '#9CA3AF',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                {r}
              </button>
            ))}
          </div>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#9CA3AF', fontSize: '0.875rem' }}>Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{ width: '100%', padding: '0.875rem', borderRadius: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none' }}
                placeholder="you@example.com"
                required 
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#9CA3AF', fontSize: '0.875rem' }}>Password</label>
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ width: '100%', padding: '0.875rem', borderRadius: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none' }}
                placeholder="••••••••"
                required 
              />
            </div>
            <button 
              type="submit" 
              style={{ width: '100%', padding: '1rem', borderRadius: '0.75rem', background: '#22D3EE', color: '#0C1220', fontWeight: 'bold', fontSize: '1rem', border: 'none', cursor: 'pointer', marginTop: '1rem', transition: 'background 0.2s' }}
            >
              Send OTP &rarr;
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
