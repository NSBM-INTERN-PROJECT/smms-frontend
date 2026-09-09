import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { verifyOtp, resendOtp } from '../../api/auth.api';
import { useAuthStore } from '../../store/auth.store';

export const OtpPage: React.FC = () => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [infoMessage, setInfoMessage] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((state) => state.setAuth);

  const email = location.state?.email || '';

  useEffect(() => {
    if (!email) {
      navigate('/login');
    }
  }, [email, navigate]);

  useEffect(() => {
    let timer: any;
    if (resendCooldown > 0) {
      timer = setInterval(() => setResendCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      setError('Please enter a valid 6-digit OTP code');
      return;
    }

    setError('');
    setInfoMessage('');
    setLoading(true);

    try {
      const res = await verifyOtp({ email, otpCode: otp });
      if (res && res.accessToken) {
        const user = {
          id: res.userId || '',
          email: res.email || email,
          role: typeof res.role === 'string' ? res.role : (res.role as any)?.name || 'STUDENT',
          name: res.fullName || res.email || 'User',
          fullName: res.fullName,
          mustChangePassword: Boolean(res.mustChangePassword),
        };

        setAuth(res.accessToken, user);

        if (res.mustChangePassword) {
          navigate('/change-password');
        } else {
          navigate('/');
        }
      } else {
        setError('Verification succeeded but no session token was received.');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message
        || err?.message
        || 'OTP verification failed. Please check the code and try again.';
      setError(msg);
      console.error('OTP verification error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || resending) return;

    setResending(true);
    setError('');
    setInfoMessage('');

    try {
      const res = await resendOtp(email);
      setInfoMessage(res.message || 'A new OTP code has been sent to your email.');
      setResendCooldown(res.resendCooldownSeconds || 60);
    } catch (err: any) {
      const msg = err?.response?.data?.message
        || err?.message
        || 'Failed to resend OTP code. Please try again later.';
      setError(msg);
    } finally {
      setResending(false);
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
      {/* Background ambient lighting */}
      <div style={{
        position: 'absolute', top: '20%', left: '30%',
        width: '40%', height: '40%',
        background: 'radial-gradient(circle, rgba(34,211,238,0.15) 0%, transparent 70%)',
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
            🔐
          </div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
            Two-Factor Auth
          </h2>
          <p style={{ color: '#94A3B8', fontSize: '0.875rem', lineHeight: 1.5 }}>
            Enter the 6-digit security code sent to<br />
            <strong style={{ color: '#22D3EE', fontWeight: 600 }}>{email}</strong>
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

        {infoMessage && (
          <div style={{
            background: 'rgba(34, 211, 238, 0.1)',
            border: '1px solid rgba(34, 211, 238, 0.25)',
            borderRadius: '0.75rem',
            padding: '0.75rem 1rem',
            marginBottom: '1.25rem',
            color: '#22D3EE',
            fontSize: '0.8125rem',
            lineHeight: 1.5,
          }}>
            {infoMessage}
          </div>
        )}

        <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94A3B8', fontSize: '0.8125rem', textAlign: 'center' }}>
              6-Digit Security Code
            </label>
            <input 
              type="text" 
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              style={{
                width: '100%',
                padding: '0.875rem',
                borderRadius: '0.75rem',
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: '#F1F5F9',
                textAlign: 'center',
                fontSize: '1.75rem',
                fontWeight: 700,
                letterSpacing: '0.5rem',
                outline: 'none',
                fontFamily: 'monospace',
                transition: 'border-color 0.2s',
              }}
              required 
              autoFocus
              onFocus={(e) => e.currentTarget.style.borderColor = '#22D3EE'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading || otp.length < 6}
            style={{
              width: '100%',
              padding: '0.875rem',
              borderRadius: '0.75rem',
              background: (loading || otp.length < 6)
                ? 'rgba(34,211,238,0.3)'
                : 'linear-gradient(135deg, #22D3EE 0%, #06B6D4 100%)',
              color: '#0C1220',
              fontWeight: 700,
              fontSize: '0.9375rem',
              border: 'none',
              cursor: (loading || otp.length < 6) ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: (loading || otp.length < 6) ? 'none' : '0 0 20px rgba(34,211,238,0.2)',
            }}
          >
            {loading ? 'Verifying…' : 'Verify & Continue →'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.75rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.25rem' }}>
          <p style={{ fontSize: '0.8125rem', color: '#64748B', marginBottom: '0.5rem' }}>
            Didn't receive the code?
          </p>
          <button
            type="button"
            onClick={handleResend}
            disabled={resendCooldown > 0 || resending}
            style={{
              background: 'none',
              border: 'none',
              color: resendCooldown > 0 ? '#475569' : '#22D3EE',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: resendCooldown > 0 ? 'default' : 'pointer',
              textDecoration: resendCooldown > 0 ? 'none' : 'underline',
            }}
          >
            {resending
              ? 'Sending…'
              : resendCooldown > 0
              ? `Resend code in ${resendCooldown}s`
              : 'Resend Code'}
          </button>
        </div>
      </div>
    </div>
  );
};
