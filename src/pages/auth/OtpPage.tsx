import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
// @ts-ignore
import { verifyOtp } from '../../api/auth.api';

export const OtpPage: React.FC = () => {
  const [otp, setOtp] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await verifyOtp({ email, otp });
      navigate('/');
    } catch (error) {
      console.error("OTP verification failed", error);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0C1220', color: 'white', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#111827', padding: '3rem', borderRadius: '1.5rem', width: '100%', maxWidth: '400px', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem', textAlign: 'center', fontWeight: 'bold' }}>Enter OTP</h2>
        <p style={{ color: '#9CA3AF', marginBottom: '2rem', textAlign: 'center', fontSize: '0.875rem' }}>
          We sent a 6-digit code to <br /><span style={{ color: '#22D3EE' }}>{email || 'your email'}</span>
        </p>
        <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <input 
              type="text" 
              maxLength={6}
              value={otp}
              onChange={e => setOtp(e.target.value)}
              placeholder="000000"
              style={{ width: '100%', padding: '1rem', borderRadius: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', textAlign: 'center', fontSize: '2rem', letterSpacing: '0.75rem', outline: 'none' }}
              required 
            />
          </div>
          <button 
            type="submit" 
            style={{ width: '100%', padding: '1rem', borderRadius: '0.75rem', background: '#22D3EE', color: '#0C1220', fontWeight: 'bold', fontSize: '1rem', border: 'none', cursor: 'pointer', transition: 'opacity 0.2s' }}
          >
            Verify OTP
          </button>
        </form>
      </div>
    </div>
  );
};
