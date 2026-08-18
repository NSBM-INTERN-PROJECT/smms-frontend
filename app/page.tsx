'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Role } from '@/types';
import {
  GraduationCap,
  Users,
  ShieldAlert,
  ArrowRight,
  ShieldCheck,
  CalendarCheck2,
  FileCheck2,
  Clock,
  LayoutDashboard,
} from 'lucide-react';

export default function HomePage() {
  const { role, switchRole } = useAuth();
  const router = useRouter();

  const handleEnterRole = (targetRole: Role, destination: string) => {
    switchRole(targetRole);
    router.push(destination);
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6">
      {/* Active Role Quick Access Banner */}
      {role && (
        <div className="mb-8 p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-indigo-900">
          <div className="flex items-center gap-2.5">
            <span className="flex h-2 w-2 rounded-full bg-indigo-600" aria-hidden="true" />
            <span>
              Active Session: <strong className="font-semibold uppercase">{role}</strong>
            </span>
          </div>
          <Link
            href={
              role === Role.STUDENT
                ? '/student/dashboard'
                : role === Role.MENTOR
                ? '/mentor/dashboard'
                : '/admin/dashboard'
            }
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-900 focus-visible:outline-none"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Go to Active Dashboard</span>
          </Link>
        </div>
      )}

      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-slate-900 leading-tight">
          Student Mentoring Management System
        </h1>
        <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
          Comprehensive academic guidance platform supporting mentor allocations, appointment scheduling, confidential consultation records, and early academic support.
        </p>
      </div>

      {/* Role Portal Cards */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Student Portal */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between hover:border-slate-300 transition-colors shadow-xs">
          <div>
            <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-700 mb-4">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Student Portal</h2>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Review assigned mentor details, RSVP to slot invitations, request consultations, and track academic progress milestones.
            </p>
            <ul className="mt-4 space-y-1.5 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <CalendarCheck2 className="w-3.5 h-3.5 text-sky-600" />
                Slot RSVPs & reschedule requests
              </li>
              <li className="flex items-center gap-2">
                <FileCheck2 className="w-3.5 h-3.5 text-sky-600" />
                Academic profile & survey tasks
              </li>
            </ul>
          </div>
          <button
            type="button"
            onClick={() => handleEnterRole(Role.STUDENT, '/student/dashboard')}
            className="mt-6 w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none transition-colors"
          >
            <span>Enter as Student</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Mentor Portal */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between hover:border-slate-300 transition-colors shadow-xs">
          <div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 mb-4">
              <Users className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Mentor Portal</h2>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Publish consultation slots, manage attendance, record confidential progress notes, and refer students for support.
            </p>
            <ul className="mt-4 space-y-1.5 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                Interactive slot generator
              </li>
              <li className="flex items-center gap-2">
                <ShieldAlert className="w-3.5 h-3.5 text-indigo-600" />
                Session notes & escalation flags
              </li>
            </ul>
          </div>
          <button
            type="button"
            onClick={() => handleEnterRole(Role.MENTOR, '/mentor/dashboard')}
            className="mt-6 w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none transition-colors"
          >
            <span>Enter as Mentor</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Coordinator & Admin Portal */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between hover:border-slate-300 transition-colors shadow-xs">
          <div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-700 mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Coordinator / Admin</h2>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Automate cohort allocations, explore mentor capacity, resolve faculty escalations, and export academic reports.
            </p>
            <ul className="mt-4 space-y-1.5 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-purple-600" />
                Allocation balancing wizard
              </li>
              <li className="flex items-center gap-2">
                <ShieldAlert className="w-3.5 h-3.5 text-purple-600" />
                Escalation triage & resolution
              </li>
            </ul>
          </div>
          <button
            type="button"
            onClick={() => handleEnterRole(Role.ADMIN, '/admin/dashboard')}
            className="mt-6 w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none transition-colors"
          >
            <span>Enter as Admin</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2FA Login Link */}
      <div className="mt-10 text-center">
        <Link
          href="/login"
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors inline-flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none rounded px-2 py-1"
        >
          <span>Test the 2-Factor Authentication (OTP) Login Flow</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
