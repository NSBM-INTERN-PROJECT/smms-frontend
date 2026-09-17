'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { mockStore, useStoreSync } from '@/lib/mockStore';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Modal } from '@/components/common/Modal';
import {
  GraduationCap,
  MapPin,
  Phone,
  Shield,
  Send,
  CheckCircle2,
  Edit3,
  CalendarCheck,
} from 'lucide-react';

export default function StudentProfilePage() {
  useStoreSync();
  const { user } = useAuth();
  const studentUserId = user?.id || 42;

  const [profile, setProfile] = useState(() => mockStore.getStudentByUserId(studentUserId));
  const [requests, setRequests] = useState(() =>
    mockStore.getProfileRequests().filter((r) => r.studentUserId === studentUserId)
  );

  useEffect(() => {
    return mockStore.subscribe(() => {
      setProfile(mockStore.getStudentByUserId(studentUserId));
      setRequests([...mockStore.getProfileRequests().filter((r) => r.studentUserId === studentUserId)]);
    });
  }, [studentUserId]);

  // Edit Request Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fieldName, setFieldName] = useState('permanentAddress');
  const [newValue, setNewValue] = useState('');
  const [reason, setReason] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    const oldValue = ((profile as unknown as Record<string, unknown>)[fieldName] as string) || '';
    mockStore.createProfileChangeRequest(studentUserId, fieldName, oldValue, newValue, reason);

    setRequests(mockStore.getProfileRequests().filter((r) => r.studentUserId === studentUserId));
    setIsModalOpen(false);
    setNewValue('');
    setReason('');
    setToastMessage('Profile modification request submitted for mentor review.');
    setTimeout(() => setToastMessage(''), 3500);
  };

  if (!profile) {
    return <div className="p-6 text-xs text-slate-500">Student profile records not found.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Academic Profile</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Official academic enrollment records and verified contact information
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none transition-colors self-start sm:self-auto"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Request Profile Change</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Academic Credentials (Read-only) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <GraduationCap className="w-4 h-4 text-slate-500" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
              Official Registry Records
            </h2>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[11px] font-medium text-slate-500 block">Full Name</span>
              <span className="font-semibold text-slate-900">{profile.fullName}</span>
            </div>
            <div>
              <span className="text-[11px] font-medium text-slate-500 block">Student Identification Number</span>
              <span className="font-mono font-semibold text-slate-900">{profile.studentId}</span>
            </div>
            <div>
              <span className="text-[11px] font-medium text-slate-500 block">Degree Enrolled</span>
              <span className="font-medium text-slate-800">{profile.degree}</span>
            </div>
            <div>
              <span className="text-[11px] font-medium text-slate-500 block">Department</span>
              <span className="font-medium text-slate-800">{profile.department}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
              <div>
                <span className="text-[11px] font-medium text-slate-500 block">Academic Batch</span>
                <span className="font-medium text-slate-800">{profile.batch}</span>
              </div>
              <div>
                <span className="text-[11px] font-medium text-slate-500 block">Intake Period</span>
                <span className="font-medium text-slate-800">{profile.intake}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
              <div>
                <span className="text-[11px] font-medium text-slate-500 block">Cumulative GPA</span>
                <span className="font-bold text-slate-900 text-sm">{profile.currentGpa.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-[11px] font-medium text-slate-500 block">System Risk Index</span>
                <div className="mt-0.5">
                  <StatusBadge type="risk" value={profile.riskStatus} />
                </div>
              </div>
            </div>

            {/* Academic Attendance Compliance Summary */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
                  Coursework Attendance
                </span>
                <span
                  className={`text-xs font-bold ${
                    (profile.attendanceRate ?? 94.2) >= 80
                      ? 'text-emerald-700'
                      : (profile.attendanceRate ?? 94.2) >= 75
                      ? 'text-amber-700'
                      : 'text-rose-700'
                  }`}
                >
                  {(profile.attendanceRate ?? 94.2).toFixed(1)}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  style={{ width: `${Math.min(100, profile.attendanceRate ?? 94.2)}%` }}
                  className={`h-full rounded-full ${
                    (profile.attendanceRate ?? 94.2) >= 80
                      ? 'bg-emerald-500'
                      : (profile.attendanceRate ?? 94.2) >= 75
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                />
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-500 pt-0.5">
                <span>Exam Eligibility:</span>
                <span
                  className={`font-semibold ${
                    (profile.attendanceRate ?? 94.2) >= 80
                      ? 'text-emerald-700'
                      : (profile.attendanceRate ?? 94.2) >= 75
                      ? 'text-amber-700'
                      : 'text-rose-700'
                  }`}
                >
                  {(profile.attendanceRate ?? 94.2) >= 80
                    ? 'Eligible (≥ 80%)'
                    : (profile.attendanceRate ?? 94.2) >= 75
                    ? 'Warning (75–79%)'
                    : 'Ineligible (< 75%)'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Columns: Extended Profile & Change Requests */}
        <div className="lg:col-span-2 space-y-6">
          {/* Official Attendance & Engagement Record Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-slate-500" />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Official Attendance & Academic Engagement Record
                </h2>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                  (profile.attendanceRate ?? 94.2) >= 80
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : (profile.attendanceRate ?? 94.2) >= 75
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}
              >
                {(profile.attendanceRate ?? 94.2) >= 80
                  ? 'Exam Candidacy: Eligible'
                  : (profile.attendanceRate ?? 94.2) >= 75
                  ? 'Attendance Warning'
                  : 'Exam Ineligible (<75%)'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Lecture Attendance
                </span>
                <span className="text-xl font-bold text-slate-900 block">
                  {(profile.attendanceRate ?? 94.2).toFixed(1)}%
                </span>
                <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden mt-2">
                  <div
                    style={{ width: `${Math.min(100, profile.attendanceRate ?? 94.2)}%` }}
                    className={`h-full rounded-full ${
                      (profile.attendanceRate ?? 94.2) >= 80
                        ? 'bg-emerald-500'
                        : (profile.attendanceRate ?? 94.2) >= 75
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Laboratory Sessions
                </span>
                <span className="text-xl font-bold text-slate-900 block">
                  {(profile.labAttendanceRate ?? 92.0).toFixed(1)}%
                </span>
                <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden mt-2">
                  <div
                    style={{ width: `${Math.min(100, profile.labAttendanceRate ?? 92.0)}%` }}
                    className={`h-full rounded-full ${
                      (profile.labAttendanceRate ?? 92.0) >= 80
                        ? 'bg-emerald-500'
                        : (profile.labAttendanceRate ?? 92.0) >= 75
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Consecutive Absences
                </span>
                <span
                  className={`text-xl font-bold block ${
                    (profile.consecutiveAbsences ?? 0) > 0 ? 'text-amber-700' : 'text-slate-900'
                  }`}
                >
                  {profile.consecutiveAbsences ?? 0}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  {(profile.consecutiveAbsences ?? 0) === 0
                    ? 'No consecutive lecture absences'
                    : `${profile.consecutiveAbsences} consecutive absences flagged`}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed bg-slate-50/70 p-3 rounded-lg border border-slate-100">
              <span className="font-semibold text-slate-800">Academic Standing Notice:</span> University
              regulations stipulate a mandatory minimum 80% attendance in lectures and laboratory practicals
              to qualify for end-of-semester examinations. Medical or emergency absences must be substantiated
              by submitting documentation to the faculty dean&apos;s office within 7 days.
            </p>
          </div>
          {/* Extended Contact Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-slate-500" />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Extended Contact & Emergency Data
                </h2>
              </div>
              <span className="text-[11px] text-slate-500">Requires Mentor Approval to update</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-lg bg-slate-50">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Parent / Legal Guardian
                </span>
                <p className="font-medium text-slate-900">{profile.parentName || 'Not recorded'}</p>
                <div className="mt-1 flex items-center gap-1.5 text-slate-600">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {profile.parentPhone ? (
                    <a href={`tel:${profile.parentPhone}`} className="hover:underline">
                      {profile.parentPhone}
                    </a>
                  ) : (
                    <span>No telephone number</span>
                  )}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Emergency Contact
                </span>
                <p className="font-medium text-slate-900">{profile.emergencyContactName || 'Not recorded'}</p>
                <div className="mt-1 flex items-center gap-1.5 text-slate-600">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {profile.emergencyContactPhone ? (
                    <a href={`tel:${profile.emergencyContactPhone}`} className="hover:underline">
                      {profile.emergencyContactPhone}
                    </a>
                  ) : (
                    <span>No telephone number</span>
                  )}
                </div>
              </div>

              <div className="md:col-span-2 p-3 rounded-lg bg-slate-50">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Permanent Residential Address
                </span>
                <div className="flex items-start gap-1.5 text-slate-700">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                  <span>{profile.permanentAddress || 'Address not registered'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Change Requests Audit History */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Profile Modification Requests
              </h2>
              <span className="text-[11px] text-slate-500">{requests.length} Requests Submitted</span>
            </div>

            <div className="mt-4 divide-y divide-slate-100">
              {requests.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-500">
                  No profile modification requests filed.
                </div>
              ) : (
                requests.map((r) => (
                  <div key={r.id} className="py-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 capitalize">
                          {r.fieldName.replace(/([A-Z])/g, ' $1')}
                        </span>
                        <StatusBadge type="request" value={r.status} />
                      </div>
                      <p className="text-slate-600 text-[11px]">
                        Proposed: <span className="font-medium text-slate-900">{r.newValue}</span>
                      </p>
                      <p className="text-slate-500 text-[11px]">Reason: {r.reason}</p>
                    </div>
                    <span className="text-[11px] text-slate-500 shrink-0 font-mono">
                      {r.createdAt.slice(0, 10)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Request Profile Change */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Submit Profile Change Request"
        description="Proposed modifications require administrative sign-off from your designated mentor."
      >
        <form onSubmit={handleCreateRequest} className="space-y-4">
          <div>
            <label htmlFor="target-field" className="block text-xs font-semibold text-slate-700">
              Target Profile Field
            </label>
            <select
              id="target-field"
              value={fieldName}
              onChange={(e) => setFieldName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 bg-white"
            >
              <option value="permanentAddress">Permanent Residential Address</option>
              <option value="emergencyContactPhone">Emergency Contact Telephone</option>
              <option value="parentPhone">Parent / Guardian Contact Phone</option>
              <option value="parentName">Parent / Guardian Name</option>
            </select>
          </div>

          <div>
            <label htmlFor="new-field-value" className="block text-xs font-semibold text-slate-700">
              New Value
            </label>
            <input
              id="new-field-value"
              type="text"
              required
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder="Enter updated contact information"
              className="mt-1 block w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 bg-white"
            />
          </div>

          <div>
            <label htmlFor="change-reason" className="block text-xs font-semibold text-slate-700">
              Justification / Reason
            </label>
            <textarea
              id="change-reason"
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Relocated to student hostel premises for semester 2."
              className="mt-1 block w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 bg-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none inline-flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit for Review</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
