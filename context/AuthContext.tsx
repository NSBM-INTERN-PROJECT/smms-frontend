'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Role, UserResponse, UserStatus } from '@/types';
import { authApi } from '@/lib/api';
import { mockStore } from '@/lib/mockStore';

interface AuthContextType {
  user: UserResponse | null;
  role: Role | null;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; message: string }>;
  verifyOtp: (email: string, otp: string) => Promise<{ success: boolean; mustChangePassword?: boolean; message?: string }>;
  logout: () => void;
  switchRole: (role: Role) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();

  const [user, setUser] = useState<UserResponse | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('currentUser');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // ignore corrupted json
        }
      }
    }
    // Default active profile (Dr. Grace Hopper - Mentor)
    return {
      id: 18,
      email: 'grace.hopper@smms.edu',
      fullName: 'Dr. Grace Hopper',
      role: Role.MENTOR,
      status: UserStatus.ACTIVE,
      department: 'Software Engineering',
    };
  });

  // Re-hydrate saved user from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('currentUser');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          queueMicrotask(() => {
            setUser(parsed);
          });
        } catch {}
      }
    }
  }, []);

  const login = async (email: string, password: string = 'Password@123') => {
    try {
      const data = await authApi.login(email, password);
      return { success: true, message: data.message || 'OTP sent to your email.' };
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } };
      const msg = errorObj.response?.data?.message || 'Login failed. Please verify your credentials.';
      return { success: false, message: msg };
    }
  };

  const verifyOtp = async (email: string, otp: string) => {
    try {
      const data = await authApi.verifyOtp(email, otp);
      if (!data) {
        return { success: false, message: 'Invalid OTP verification response.' };
      }

      const activeUser: UserResponse = data.user || {
        id: data.userId || 1,
        email: data.email || email,
        fullName: data.fullName || 'Authenticated User',
        role: data.role || Role.ADMIN,
        status: UserStatus.ACTIVE,
        mustChangePassword: data.mustChangePassword,
      };

      setUser(activeUser);
      if (typeof window !== 'undefined') {
        if (data.accessToken) localStorage.setItem('accessToken', data.accessToken);
        if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('currentUser', JSON.stringify(activeUser));
        localStorage.setItem('currentUserId', activeUser.id.toString());
      }

      // Re-trigger role-aware store sync
      mockStore.resetAndFetchAll(activeUser.role, activeUser.id);

      if (data.mustChangePassword || activeUser.mustChangePassword) {
        return { success: true, mustChangePassword: true };
      }

      if (activeUser.role === Role.STUDENT) {
        router.push('/student/dashboard');
      } else if (activeUser.role === Role.MENTOR) {
        router.push('/mentor/dashboard');
      } else {
        router.push('/admin/dashboard');
      }
      return { success: true };
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } };
      const msg = errorObj.response?.data?.message || 'OTP verification failed. Please check the code.';
      return { success: false, message: msg };
    }
  };

  const logout = async () => {
    const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
    await authApi.logout(refreshToken || undefined);
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('currentUser');
      localStorage.removeItem('currentUserId');
    }
    router.push('/login');
  };

  const switchRole = async (newRole: Role) => {
    let targetUser: UserResponse = {
      id: newRole === Role.STUDENT ? 42 : newRole === Role.MENTOR ? 18 : newRole === Role.COORDINATOR ? 2 : 1,
      email:
        newRole === Role.STUDENT
          ? 'john.doe@smms.edu'
          : newRole === Role.MENTOR
          ? 'grace.hopper@smms.edu'
          : newRole === Role.COORDINATOR
          ? 'coordinator@smms.edu'
          : 'admin@smms.edu',
      fullName:
        newRole === Role.STUDENT
          ? 'John Doe'
          : newRole === Role.MENTOR
          ? 'Dr. Grace Hopper'
          : newRole === Role.COORDINATOR
          ? 'Prof. Ada Lovelace'
          : 'Dr. Alan Turing',
      role: newRole,
      status: UserStatus.ACTIVE,
      department: newRole === Role.ADMIN ? 'Central Administration' : 'Software Engineering',
    };

    const creds: Record<Role, { email: string; pass: string }> = {
      [Role.STUDENT]: { email: 'john.doe@smms.edu', pass: 'Password@123' },
      [Role.MENTOR]: { email: 'grace.hopper@smms.edu', pass: 'Password@123' },
      [Role.COORDINATOR]: { email: 'coordinator@smms.edu', pass: 'Password@123' },
      [Role.ADMIN]: { email: 'admin@smms.edu', pass: 'Password@123' },
      [Role.MANAGEMENT]: { email: 'admin@smms.edu', pass: 'Password@123' },
    };
    const cred = creds[newRole] || creds[Role.ADMIN];

    try {
      await authApi.login(cred.email, cred.pass);
      const authData = await authApi.verifyOtp(cred.email, '123456');
      if (authData && authData.accessToken) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', authData.accessToken);
          if (authData.refreshToken) localStorage.setItem('refreshToken', authData.refreshToken);
        }
        targetUser = authData.user || {
          id: authData.userId || targetUser.id,
          email: authData.email || targetUser.email,
          fullName: authData.fullName || targetUser.fullName,
          role: authData.role || targetUser.role,
          status: UserStatus.ACTIVE,
        };
      }
    } catch {
      // Backend not running or demo user not yet in db — fallback to simulated profile
    }

    setUser(targetUser);
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentUser', JSON.stringify(targetUser));
      localStorage.setItem('currentUserId', targetUser.id.toString());
    }

    mockStore.resetAndFetchAll(targetUser.role, targetUser.id);

    if (newRole === Role.STUDENT) {
      router.push('/student/dashboard');
    } else if (newRole === Role.MENTOR) {
      router.push('/mentor/dashboard');
    } else {
      router.push('/admin/dashboard');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user ? user.role : null,
        isAuthenticated: !!user,
        login,
        verifyOtp,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
