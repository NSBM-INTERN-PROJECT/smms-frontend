import React from 'react';
import { useNavigate } from 'react-router-dom';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-deep, #0C1220)',
      color: 'var(--text-primary, #E2E8F0)',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      gap: '1.5rem',
      padding: '2rem',
      textAlign: 'center',
    }}>
      <div style={{
        fontSize: '7rem',
        fontWeight: 800,
        lineHeight: 1,
        background: 'linear-gradient(135deg, #22D3EE, #818CF8)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        letterSpacing: '-0.04em',
      }}>
        404
      </div>

      <h1 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0 }}>
        Page Not Found
      </h1>

      <p style={{ color: 'var(--text-muted, #94A3B8)', maxWidth: '28rem', lineHeight: 1.6 }}>
        The page you're looking for doesn't exist or has been moved.
      </p>

      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: '0.625rem 1.5rem',
            borderRadius: '0.625rem',
            border: '1px solid rgba(148,163,184,0.25)',
            background: 'transparent',
            color: 'var(--text-primary, #E2E8F0)',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: 500,
            transition: 'all 0.2s',
          }}
        >
          Go Back
        </button>
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '0.625rem 1.5rem',
            borderRadius: '0.625rem',
            border: 'none',
            background: 'linear-gradient(135deg, #22D3EE, #818CF8)',
            color: '#0C1220',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: 600,
            transition: 'all 0.2s',
          }}
        >
          Go Home
        </button>
      </div>
    </div>
  );
};
