import React, { useState } from 'react';

export const ChangePasswordPage: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    // call api to change password
    alert("Password changed successfully!");
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0C1220', color: 'white', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#111827', padding: '3rem', borderRadius: '1.5rem', width: '100%', maxWidth: '400px', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '2rem', textAlign: 'center', fontWeight: 'bold' }}>Change Password</h2>
        <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#9CA3AF', fontSize: '0.875rem' }}>Current Password</label>
            <input 
              type="password" 
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              style={{ width: '100%', padding: '0.875rem', borderRadius: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none' }}
              required 
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#9CA3AF', fontSize: '0.875rem' }}>New Password</label>
            <input 
              type="password" 
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              style={{ width: '100%', padding: '0.875rem', borderRadius: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none' }}
              required 
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#9CA3AF', fontSize: '0.875rem' }}>Confirm New Password</label>
            <input 
              type="password" 
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              style={{ width: '100%', padding: '0.875rem', borderRadius: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none' }}
              required 
            />
          </div>
          <button 
            type="submit" 
            style={{ width: '100%', padding: '1rem', borderRadius: '0.75rem', background: '#22D3EE', color: '#0C1220', fontWeight: 'bold', fontSize: '1rem', border: 'none', cursor: 'pointer', marginTop: '1rem', transition: 'background 0.2s' }}
          >
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
};
