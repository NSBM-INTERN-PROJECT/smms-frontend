'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { mockStore } from '@/lib/mockStore';
import { Modal } from '@/components/common/Modal';
import {
  ShieldCheck,
  Mail,
  Building2,
  Calendar,
  KeyRound,
  Edit3,
  CheckCircle2,
  Users,
  Layers,
  AlertTriangle,
  FolderDown,
  Shield,
  ArrowRight,
} from 'lucide-react';
import { UserResponse, Role } from '@/types';

export default function AdminProfilePage() {
  const { user } = useAuth();
  const adminUserId = user?.id || 1;

  const [adminUser, setAdminUser] = useState<UserResponse | undefined>(() =>
    mockStore.getUserById(adminUserId)
  );

  const [usersCount] = useState(() => mockStore.getUsers().length);
  const [mentorsCount] = useState(() => mockStore.getMentors().length);
  const [studentsCount] = useState(() => mockStore.getStudents().length);
  const [escalationsCount] = useState(
    () => mockStore.getEscalations().filter((e) => e.status === 'OPEN').length
  );

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [fullName, setFullName] = useState(adminUser?.fullName || '');
  const [email, setEmail] = useState(adminUser?.email || '');
  const [department, setDepartment] = useState(adminUser?.department || '');
  const [toastMessage, setToastMessage] = useState('');

  if (!adminUser) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-xs">
        Administrator profile record not found.
      </div>
    );
  }

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = mockStore.updateUser(adminUser.id, {
      fullName,
      email,
      department,
    });
    if (updated) {
      setAdminUser({ ...updated });
      setToastMessage('Administrator profile credentials updated successfully.');
      setIsEditModalOpen(false);
      setTimeout(() => setToastMessage(''), 3500);
    }
  };

  const isCoordinator = adminUser.role === Role.COORDINATOR;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 shadow-xs"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            {isCoordinator ? 'Faculty Coordinator Profile' : 'System Administrator Profile'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            System governance authority, organizational appointments, and security credentials
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setFullName(adminUser.fullName);
            setEmail(adminUser.email);
            setDepartment(adminUser.department || '');
            setIsEditModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none transition-colors self-start sm:self-auto shadow-2xs"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Edit Profile Details</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Admin Identity & Security */}
        <div className="space-y-6">
          {/* Identity Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-base shrink-0 shadow-xs">
                {adminUser.fullName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)}
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">{adminUser.fullName}</h2>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-900 text-white">
                    {adminUser.role}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Active Account
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-3 text-xs">
              <div className="flex items-center gap-2.5 text-slate-700">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <a
                  href={`mailto:${adminUser.email}`}
                  className="hover:text-slate-900 hover:underline truncate font-medium"
                >
                  {adminUser.email}
                </a>
              </div>
              <div className="flex items-center gap-2.5 text-slate-700">
                <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="font-medium">{adminUser.department || 'Central Administration'}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-700">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="font-medium">
                  Registered {new Date(adminUser.createdAt || '2026-01-10').toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Security & Authentication Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Security & Compliance
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Two-Factor Authentication</span>
                <span className="font-semibold text-emerald-700">Email OTP Enforced</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Password Policy</span>
                <span className="font-semibold text-slate-800">Compliant</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Session Status</span>
                <span className="font-semibold text-emerald-700">Authenticated (JWT)</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <Link
                href="/change-password"
                className="w-full py-2 px-3 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors inline-flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                <span>Change Password</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column: Delegated Scope & Governance Metrics */}
        <div className="lg:col-span-2 space-y-6">
          {/* Institutional Governance Scope */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Shield className="w-4 h-4 text-slate-500" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                System Governance Authorities
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/60 space-y-1">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <Users className="w-4 h-4 text-indigo-600" />
                  <span>Cohort Allocation Governance</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Direct pairing of students, execution of randomized allocation heuristics, and mentee transfer management.
                </p>
              </div>

              <div className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/60 space-y-1">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  <span>Faculty Capacity Oversight</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Management of faculty student quotas, multi-criteria filtering, and departmental load balancing.
                </p>
              </div>

              <div className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/60 space-y-1">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Escalation Resolution</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Adjudication of academic, behavioral, and mental health student escalations across all university departments.
                </p>
              </div>

              <div className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/60 space-y-1">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <FolderDown className="w-4 h-4 text-emerald-600" />
                  <span>Institutional Audit Reports</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Exporting longitudinal mentee progress records, faculty allocation rosters, and administrative summaries.
                </p>
              </div>
            </div>
          </div>

          {/* Institutional Telemetry Overview */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 pb-3 border-b border-slate-100">
              Institution Overview
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-100 text-center">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Registered Users
                </span>
                <span className="text-xl font-bold text-slate-900 mt-1 block">{usersCount}</span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-100 text-center">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Faculty Mentors
                </span>
                <span className="text-xl font-bold text-slate-900 mt-1 block">{mentorsCount}</span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-100 text-center">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Enrolled Students
                </span>
                <span className="text-xl font-bold text-slate-900 mt-1 block">{studentsCount}</span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-100 text-center">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Open Escalations
                </span>
                <span className="text-xl font-bold text-rose-600 mt-1 block">{escalationsCount}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
              <span className="text-slate-500">Need to oversee user accounts and roles?</span>
              <Link
                href="/admin/users"
                className="font-semibold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1"
              >
                <span>Manage User Directory</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Administrative Profile Credentials"
        description="Update your verified administrative name, email address, and department."
      >
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label htmlFor="edit-name" className="block text-xs font-semibold text-slate-700 mb-1">
              Full Name
            </label>
            <input
              id="edit-name"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
            />
          </div>

          <div>
            <label htmlFor="edit-email" className="block text-xs font-semibold text-slate-700 mb-1">
              Official Email
            </label>
            <input
              id="edit-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
            />
          </div>

          <div>
            <label htmlFor="edit-dept" className="block text-xs font-semibold text-slate-700 mb-1">
              Department / Administrative Division
            </label>
            <input
              id="edit-dept"
              type="text"
              required
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
            >
              Save Credentials
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
