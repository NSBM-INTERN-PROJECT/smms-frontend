import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const AppShell: React.FC = () => {
  return (
    <div className="app-shell flex h-screen w-full bg-gray-50 text-gray-900 relative overflow-hidden font-sans">
      {/* Grain texture overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay z-50" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>
      
      <Sidebar />
      
      <div className="flex-1 flex flex-col relative z-0 min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto p-8 relative">
          {/* Subtle background decoration */}
          <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-gray-100 to-transparent pointer-events-none -z-10"></div>
          
          <div className="max-w-7xl mx-auto w-full h-full animate-fade-in pb-12">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
