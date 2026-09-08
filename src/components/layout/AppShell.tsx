import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export const AppShell: React.FC = () => {
  return (
    <div className="app-shell">
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <main style={{ flex: 1, overflowY: 'auto', padding: '2rem', position: 'relative' }}>
          <div className="animate-fade-in" style={{ maxWidth: '80rem', margin: '0 auto', width: '100%' }}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
