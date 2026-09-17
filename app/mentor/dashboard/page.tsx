'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { mockStore, useStoreSync } from '@/lib/mockStore';
import { StatCard } from '@/components/common/StatCard';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Modal } from '@/components/common/Modal';
import {
  Users,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Video,
  FileCheck2,
  ArrowRight,
  UserCheck,
  CalendarCheck,
} from 'lucide-react';
import { AttendanceStatus, Role } from '@/types';

export default function MentorDashboardPage() {
  useStoreSync();
  const { user } = useAuth();
  const mentorUserId = user?.id || 18;

  const summary = mockStore.getMentorDashboardSummary(mentorUserId);
  const [meetings, setMeetings] = useState(() => mockStore.getMeetings(Role.MENTOR, mentorUserId));
  const [students, setStudents] = useState(() => mockStore.getStudents().filter((s) => s.allocatedMentorId === mentorUserId));

  useEffect(() => {
    return mockStore.subscribe(() => {
      setMeetings([...mockStore.getMeetings(Role.MENTOR, mentorUserId)]);
      setStudents([...mockStore.getStudents().filter((s) => s.allocatedMentorId === mentorUserId)]);
    });
  }, [mentorUserId]);

  // Attendance Modal state
  const [attendanceModalMeetingId, setAttendanceModalMeetingId] = useState<number | null>(null);
  const [attendanceStatus, setAttendanceStatus] = useState<AttendanceStatus>(AttendanceStatus.PRESENT);
  const [toastMessage, setToastMessage] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];
  const todayMeetings = meetings.filter((m) => m.scheduledDate === todayStr || m.status === 'SCHEDULED');
  const atRiskStudents = students.filter(
    (s) => s.latestProgressStatus === 'AT_RISK' || s.latestProgressStatus === 'CRITICAL' || s.latestProgressStatus === 'NEEDS_ATTENTION'
  );

  const handleAttendanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (attendanceModalMeetingId) {
      mockStore.markAttendance(attendanceModalMeetingId, attendanceStatus);
      setMeetings([...mockStore.getMeetings(Role.MENTOR, mentorUserId)]);
      setAttendanceModalMeetingId(null);
      setToastMessage(`Attendance logged as ${attendanceStatus}.`);
      setTimeout(() => setToastMessage(''), 3500);
    }
  };

  const capacityRate = summary.capacity > 0 ? Math.round((summary.totalStudents / summary.capacity) * 100) : 0;
  const completionRate = summary.totalMeetings > 0 ? Math.round((summary.completedMeetings / summary.totalMeetings) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Toast */}
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
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Mentor Workspace: {user?.fullName || 'Dr. Grace Hopper'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Department of Software Engineering • Capacity: {summary.totalStudents}/{summary.capacity} Allocated Mentees
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/mentor/slots"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none transition-colors"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Generate Slots</span>
          </Link>
          <Link
            href="/mentor/approvals"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none transition-colors relative"
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>Pending Approvals</span>
            {summary.pendingMeetingRequestsCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                {summary.pendingMeetingRequestsCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* KPI Grid with dynamic metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Assigned Mentees"
          value={`${summary.totalStudents} / ${summary.capacity}`}
          badge={`${summary.capacity - summary.totalStudents} Open`}
          badgeVariant="neutral"
          subtitle={`${capacityRate}% capacity utilization`}
          icon={Users}
        />
        <StatCard
          title="Cohort On Track"
          value={summary.studentsOnTrack}
          badge="Healthy"
          badgeVariant="success"
          subtitle={`${summary.studentsNeedsAttention + summary.studentsAtRisk} Require follow-up`}
          icon={UserCheck}
        />
        <StatCard
          title="Sessions Completed"
          value={`${summary.completedMeetings} / ${summary.totalMeetings}`}
          subtitle={`${completionRate}% session completion`}
          icon={CalendarCheck}
        />
        <StatCard
          title="Open Escalations"
          value={summary.openEscalations}
          badge={summary.openEscalations > 0 ? 'Attention Needed' : 'None'}
          badgeVariant={summary.openEscalations > 0 ? 'danger' : 'neutral'}
          subtitle="Academic & support referrals"
          icon={AlertTriangle}
        />
      </div>

      {/* Main Split: Today's Agenda & Cohort Risk Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Agenda */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Today&apos;s Consultation Agenda
              </h2>
              <p className="text-[11px] text-slate-500">Scheduled mentoring reviews for today</p>
            </div>
            <Link
              href="/mentor/meetings"
              className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1 focus-visible:ring-1 focus-visible:ring-indigo-800 rounded"
            >
              <span>All Meetings</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {todayMeetings.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-500">
                No consultations scheduled for today.
              </div>
            ) : (
              todayMeetings.map((m) => (
                <div key={m.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 font-bold shrink-0">
                      {m.scheduledTime.slice(0, 5)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 text-sm">{m.studentName}</span>
                        <StatusBadge type="meetingStatus" value={m.status} />
                        <StatusBadge type="attendance" value={m.attendanceStatus} />
                      </div>
                      <p className="text-slate-600 text-[11px] mt-0.5">Topic: {m.topic || 'General Review'}</p>
                      <div className="flex items-center gap-2 mt-1 text-slate-500 text-[11px]">
                        <StatusBadge type="meetingMode" value={m.mode} />
                        {m.location && <span>• Room: {m.location}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {m.meetingLink && (
                      <a
                        href={m.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Open video call with ${m.studentName}`}
                        className="p-2 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 focus-visible:ring-2 focus-visible:ring-indigo-900 focus-visible:outline-none transition-colors"
                        title="Open Video Call"
                      >
                        <Video className="w-4 h-4" />
                      </a>
                    )}
                    {m.status === 'SCHEDULED' && (
                      <button
                        type="button"
                        onClick={() => setAttendanceModalMeetingId(m.id)}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none transition-colors"
                      >
                        Mark Attendance
                      </button>
                    )}
                    <Link
                      href={`/mentor/sessions?studentId=${m.studentUserId}`}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 font-medium text-xs hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none transition-colors"
                    >
                      Session Notes
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* At-Risk Mentees Radar */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                At-Risk Students Radar
              </h2>
              <span className="text-[11px] text-rose-800 font-semibold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                {atRiskStudents.length} Flagged
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {atRiskStudents.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  No students currently flagged as at-risk.
                </div>
              ) : (
                atRiskStudents.map((s) => (
                  <div
                    key={s.id}
                    className="p-3 rounded-lg border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-colors space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs">{s.fullName}</span>
                      <StatusBadge
                        type="progress"
                        value={s.latestProgressStatus || 'NEEDS_ATTENTION'}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>ID: {s.studentId}</span>
                      <span>GPA: {s.currentGpa.toFixed(2)}</span>
                    </div>
                    <div className="pt-1 flex justify-end">
                      <Link
                        href={`/mentor/students?studentId=${s.userId}`}
                        className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 focus-visible:ring-1 focus-visible:ring-indigo-800 rounded"
                      >
                        <span>View Student Profile</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100">
            <Link
              href="/mentor/students"
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none transition-colors"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Inspect All Allocated Mentees</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Mentee Attendance & Engagement Monitor Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-indigo-600" />
              <h2 className="text-sm font-bold tracking-tight text-slate-900">
                Mentee Attendance & Engagement Monitor
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Live tracking of lecture, laboratory, and consultation attendance across each allocated student
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs flex-wrap">
            <span className="px-2 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold text-[11px]">
              {students.filter((s) => (s.attendanceRate ?? 90) >= 80).length} Compliant (≥80%)
            </span>
            <span className="px-2 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200 font-semibold text-[11px]">
              {
                students.filter(
                  (s) => (s.attendanceRate ?? 90) >= 75 && (s.attendanceRate ?? 90) < 80
                ).length
              }{' '}
              Borderline
            </span>
            <span className="px-2 py-1 rounded-md bg-rose-50 text-rose-800 border border-rose-200 font-semibold text-[11px]">
              {students.filter((s) => (s.attendanceRate ?? 90) < 75).length} At Risk (&lt;75%)
            </span>
          </div>
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
                  <th scope="col" className="p-3.5">Allocated Student</th>
                  <th scope="col" className="p-3.5">ID / Batch</th>
                  <th scope="col" className="p-3.5">Coursework Attendance</th>
                  <th scope="col" className="p-3.5">Lab Practical</th>
                  <th scope="col" className="p-3.5">Consecutive Absences</th>
                  <th scope="col" className="p-3.5">Eligibility Status</th>
                  <th scope="col" className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((s) => {
                  const attRate = s.attendanceRate ?? 90;
                  const labRate = s.labAttendanceRate ?? 88;
                  const absences = s.consecutiveAbsences ?? 0;
                  const isCritical = attRate < 75;
                  const isBorderline = !isCritical && attRate < 80;

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-3.5 font-bold text-slate-900">
                        {s.fullName}
                        <span className="block text-[11px] font-normal text-slate-500">
                          {s.department}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className="font-mono text-slate-800 font-medium">{s.studentId}</span>
                        <span className="block text-[11px] text-slate-500">Batch {s.batch}</span>
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-bold ${
                              isCritical
                                ? 'text-rose-700'
                                : isBorderline
                                ? 'text-amber-700'
                                : 'text-emerald-700'
                            }`}
                          >
                            {attRate.toFixed(1)}%
                          </span>
                          <div className="w-20 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              style={{ width: `${Math.min(100, attRate)}%` }}
                              className={`h-full rounded-full ${
                                isCritical
                                  ? 'bg-rose-500'
                                  : isBorderline
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                              }`}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className="font-semibold text-slate-800">{labRate.toFixed(1)}%</span>
                      </td>
                      <td className="p-3.5">
                        {absences > 0 ? (
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                              absences >= 2
                                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {absences} missed
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">None</span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${
                            isCritical
                              ? 'bg-rose-50 text-rose-800 border-rose-200'
                              : isBorderline
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          }`}
                        >
                          {isCritical
                            ? 'Exam Ineligible (<75%)'
                            : isBorderline
                            ? 'Attendance Warning'
                            : 'Exam Eligible'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        {isCritical && (
                          <Link
                            href={`/mentor/sessions?studentId=${s.userId}`}
                            className="text-[11px] font-bold text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 px-2 py-1 rounded transition-colors"
                            title="Raise Attendance Referral / Escalation"
                          >
                            Escalate
                          </Link>
                        )}
                        <Link
                          href={`/mentor/sessions?studentId=${s.userId}`}
                          className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
                        >
                          Session Note
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Attendance Modal with Accessible Radiogroup */}
      <Modal
        isOpen={attendanceModalMeetingId !== null}
        onClose={() => setAttendanceModalMeetingId(null)}
        title="Record Meeting Attendance"
        description="Select confirmed attendance outcome for this session"
      >
        <form onSubmit={handleAttendanceSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">Attendance Status</label>
            <div role="radiogroup" aria-label="Attendance status options" className="grid grid-cols-2 gap-2 text-xs">
              {[
                { label: 'Present', val: AttendanceStatus.PRESENT, desc: 'Attended session on time' },
                { label: 'Late', val: AttendanceStatus.LATE, desc: 'Arrived after scheduled start' },
                { label: 'Absent', val: AttendanceStatus.ABSENT, desc: 'Unnotified no-show' },
                { label: 'Excused', val: AttendanceStatus.EXCUSED, desc: 'Prior authorized absence' },
              ].map((item) => (
                <button
                  type="button"
                  role="radio"
                  aria-checked={attendanceStatus === item.val}
                  key={item.val}
                  onClick={() => setAttendanceStatus(item.val)}
                  className={`p-3 rounded-lg border text-left transition-all focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none ${
                    attendanceStatus === item.val
                      ? 'border-slate-900 bg-slate-50 font-bold'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <p className="font-semibold text-slate-900">{item.label}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setAttendanceModalMeetingId(null)}
              className="px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none"
            >
              Save Attendance
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
