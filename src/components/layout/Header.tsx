import React from 'react';
import { Bell, User } from 'lucide-react';
// import { useAuth } from '../../hooks/useAuth';

export const Header: React.FC = () => {
  // Mock auth hook
  const user = { name: 'Admin User' };
  
  return (
    <header className="header h-16 border-b border-gray-200 bg-white/80 backdrop-blur-md flex items-center justify-between px-8 shadow-sm z-10 sticky top-0">
      <div className="text-xl font-semibold text-gray-800 tracking-tight">
        Overview
      </div>
      <div className="flex items-center gap-5">
        <button className="relative p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-200">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        <div className="h-6 w-px bg-gray-200"></div>
        <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-1.5 pr-4 rounded-full transition-colors border border-transparent hover:border-gray-200 group">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center font-bold shadow-md group-hover:shadow-lg transition-all">
            {user?.name?.charAt(0) || <User size={18} />}
          </div>
          <span className="text-sm font-semibold text-gray-700 hidden md:block group-hover:text-blue-600 transition-colors">{user?.name || 'User'}</span>
        </div>
      </div>
    </header>
  );
};
