'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { mockStore } from '@/lib/mockStore';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Modal } from '@/components/common/Modal';
import {
  GraduationCap,
  MapPin,
  Phone,
  Mail,
  Edit3,
  CheckCircle2,
  Users,
  BookOpen,
  ArrowUpRight,
} from 'lucide-react';
import { MentorProfileResponse } from '@/types';

export default function MentorProfilePage() {
  const { user } = useAuth();
  const mentorUserId = user?.id || 18;

  const [mentor, setMentor] = useState<MentorProfileResponse | undefined>(() =>
    mockStore.getMentorByUserId(mentorUserId)
  );
  const [students] = useState(() =>
    mockStore.getStudents().filter((s) => s.allocatedMentorId === mentorUserId)
  );
  const [dashboardSummary] = useState(() =>
    mockStore.getMentorDashboardSummary(mentorUserId)
  );

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [officeLocation, setOfficeLocation] = useState(mentor?.officeLocation || '');
  const [contactPhone, setContactPhone] = useState(mentor?.contactPhone || '');
  const [specialization, setSpecialization] = useState(mentor?.specialization || '');
  const [toastMessage, setToastMessage] = useState('');

  if (!mentor) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-xs">
        Faculty mentor profile records not found.
      </div>
    );
  }

  const capacityRatio = mentor.capacity > 0 ? mentor.currentStudentCount / mentor.capacity : 0;
  const availableSeats = Math.max(0, mentor.capacity - mentor.currentStudentCount);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = mockStore.updateMentorProfile(mentor.userId, {
      officeLocation,
      contactPhone,
      specialization,
    });
    if (updated) {
      setMentor({ ...updated });
      setToastMessage('Faculty profile details updated successfully.');
      setIsEditModalOpen(false);
      setTimeout(() => setToastMessage(''), 3500);
    }
  };

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
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Faculty Mentor Profile</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Academic appointments, research domains, and verified contact credentials
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setOfficeLocation(mentor.officeLocation);
            setContactPhone(mentor.contactPhone);
            setSpecialization(mentor.specialization);
            setIsEditModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none transition-colors self-start sm:self-auto shadow-2xs"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Edit Contact Info</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Faculty Identity & Credentials */}
        <div className="space-y-6">
          {/* Identity Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-base shrink-0">
                {mentor.fullName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)}
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">{mentor.fullName}</h2>
                <p className="text-xs font-medium text-slate-500">{mentor.designation}</p>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200">
                    {mentor.department}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Active Faculty
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-3 text-xs">
              <div className="flex items-center gap-2.5 text-slate-700">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <a
                  href={`mailto:${mentor.email}`}
                  className="hover:text-slate-900 hover:underline truncate font-medium"
                >
                  {mentor.email}
                </a>
              </div>
              <div className="flex items-center gap-2.5 text-slate-700">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <a
                  href={`tel:${mentor.contactPhone}`}
                  className="hover:text-slate-900 hover:underline font-medium"
                >
                  {mentor.contactPhone}
                </a>
              </div>
              <div className="flex items-center gap-2.5 text-slate-700">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="font-medium">{mentor.officeLocation}</span>
              </div>
            </div>
          </div>

          {/* Research & Specialization Focus */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <BookOpen className="w-4 h-4 text-slate-500" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Domain Focus & Research
              </h3>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {mentor.specialization}
            </p>
            <div className="flex flex-wrap gap-1.5 pt-2">
              {mentor.specialization.split('&').map((item, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-slate-100 text-slate-700 rounded-md text-[11px] font-medium"
                >
                  {item.trim()}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Mentoring Load & Mentees Roster */}
        <div className="lg:col-span-2 space-y-6">
          {/* Mentoring Capacity Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-500" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Mentoring Quota & Utilization
                </h3>
              </div>
              <span className="text-xs font-bold text-slate-900">
                {mentor.currentStudentCount} of {mentor.capacity} Allocated
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-600">
                <span>Capacity Headroom</span>
                <span className="font-semibold text-slate-900">
                  {availableSeats > 0 ? `${availableSeats} open seats` : 'Full capacity'}
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  style={{ width: `${Math.min(100, capacityRatio * 100)}%` }}
                  className={`h-full rounded-full transition-all ${
                    capacityRatio >= 1
                      ? 'bg-rose-500'
                      : capacityRatio >= 0.8
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                />
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-center">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Completed Sessions
                </span>
                <span className="text-lg font-bold text-slate-900 mt-0.5 block">
                  {dashboardSummary.completedMeetings}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-center">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Pending Requests
                </span>
                <span className="text-lg font-bold text-slate-900 mt-0.5 block">
                  {dashboardSummary.pendingMeetingRequestsCount}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-center">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Open Escalations
                </span>
                <span className="text-lg font-bold text-slate-900 mt-0.5 block">
                  {dashboardSummary.openEscalations}
                </span>
              </div>
            </div>
          </div>

          {/* Assigned Students Roster Overview */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-slate-500" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Assigned Student Cohort ({students.length})
                </h3>
              </div>
              <Link
                href="/mentor/students"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1"
              >
                <span>View Full Roster</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {students.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No students currently allocated to this faculty mentor.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-[11px] font-semibold text-slate-700 uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th scope="col" className="p-3.5">Student</th>
                      <th scope="col" className="p-3.5">ID / Batch</th>
                      <th scope="col" className="p-3.5">GPA</th>
                      <th scope="col" className="p-3.5">Progress</th>
                      <th scope="col" className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {students.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-3.5 font-bold text-slate-900">
                          {s.fullName}
                          <span className="block text-[11px] font-normal text-slate-500">
                            {s.department}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className="font-medium text-slate-800">{s.studentId}</span>
                          <span className="block text-[11px] text-slate-500">Batch {s.batch}</span>
                        </td>
                        <td className="p-3.5 font-bold text-slate-900">
                          {s.currentGpa.toFixed(2)}
                        </td>
                        <td className="p-3.5">
                          <StatusBadge
                            type="progress"
                            value={s.latestProgressStatus || 'ON_TRACK'}
                          />
                        </td>
                        <td className="p-3.5 text-right">
                          <Link
                            href={`/mentor/sessions?studentId=${s.userId}`}
                            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                          >
                            Session Note
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Faculty Contact Details"
        description="Update your verified office location, telephone number, and domain focus."
      >
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label htmlFor="edit-office" className="block text-xs font-semibold text-slate-700 mb-1">
              Office Location
            </label>
            <input
              id="edit-office"
              type="text"
              required
              value={officeLocation}
              onChange={(e) => setOfficeLocation(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
            />
          </div>

          <div>
            <label htmlFor="edit-phone" className="block text-xs font-semibold text-slate-700 mb-1">
              Contact Telephone
            </label>
            <input
              id="edit-phone"
              type="text"
              required
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
            />
          </div>

          <div>
            <label htmlFor="edit-spec" className="block text-xs font-semibold text-slate-700 mb-1">
              Research Domains & Specialization
            </label>
            <textarea
              id="edit-spec"
              rows={3}
              required
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
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
              Save Changes
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
