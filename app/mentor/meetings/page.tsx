'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { mockStore, useStoreSync } from '@/lib/mockStore';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Modal } from '@/components/common/Modal';
import {
  CalendarDays,
  Clock,
  Video,
  MapPin,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { AttendanceStatus, MeetingResponse, Role } from '@/types';

export default function MentorMeetingsPage() {
  useStoreSync();
  const { user } = useAuth();
  const mentorUserId = user?.id || 18;

  const [meetings, setMeetings] = useState(() => mockStore.getMeetings(Role.MENTOR, mentorUserId));

  useEffect(() => {
    return mockStore.subscribe(() => {
      setMeetings([...mockStore.getMeetings(Role.MENTOR, mentorUserId)]);
    });
  }, [mentorUserId]);
  const [filter, setFilter] = useState<'ALL' | 'SCHEDULED' | 'COMPLETED'>('ALL');

  // Attendance Modal state
  const [selectedMeetingId, setSelectedMeetingId] = useState<number | null>(null);
  const [attendance, setAttendance] = useState<AttendanceStatus>(AttendanceStatus.PRESENT);

  // Reschedule Modal state
  const [rescheduleMeeting, setRescheduleMeeting] = useState<MeetingResponse | null>(null);
  const [newDate, setNewDate] = useState('2026-09-26');
  const [newTime, setNewTime] = useState('14:00');
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredMeetings = meetings.filter((m) => {
    if (filter === 'SCHEDULED') return m.status === 'SCHEDULED' || m.status === 'RESCHEDULED';
    if (filter === 'COMPLETED') return m.status === 'COMPLETED';
    return true;
  });

  const handleMarkAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMeetingId) {
      mockStore.markAttendance(selectedMeetingId, attendance);
      setMeetings([...mockStore.getMeetings(Role.MENTOR, mentorUserId)]);
      setSelectedMeetingId(null);
      setToastMessage(`Attendance recorded as ${attendance}.`);
      setTimeout(() => setToastMessage(''), 3500);
    }
  };

  const handleRescheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rescheduleMeeting) {
      mockStore.rescheduleMeeting(rescheduleMeeting.id, newDate, `${newTime}:00`, rescheduleReason);
      setMeetings([...mockStore.getMeetings(Role.MENTOR, mentorUserId)]);
      setRescheduleMeeting(null);
      setRescheduleReason('');
      setToastMessage('Meeting successfully rescheduled.');
      setTimeout(() => setToastMessage(''), 3500);
    }
  };

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
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Meeting Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Oversee consultation schedules, record student attendance, and manage timetable updates
          </p>
        </div>
        <Link
          href="/mentor/slots"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none transition-colors"
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Generate Availability Slots</span>
        </Link>
      </div>

      {/* Filter Tabs with ARIA */}
      <div role="tablist" aria-label="Meeting status filters" className="flex items-center gap-2 border-b border-slate-200">
        {(['ALL', 'SCHEDULED', 'COMPLETED'] as const).map((f) => (
          <button
            key={f}
            type="button"
            role="tab"
            aria-selected={filter === f}
            onClick={() => setFilter(f)}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none rounded-t ${
              filter === f
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {f === 'ALL' ? 'All Sessions' : f === 'SCHEDULED' ? 'Upcoming / Scheduled' : 'Completed Archive'}
          </button>
        ))}
      </div>

      {/* Meetings List */}
      <div className="space-y-3">
        {filteredMeetings.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-xs">
            No meetings found for the selected view filter.
          </div>
        ) : (
          filteredMeetings.map((m) => (
            <div
              key={m.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 font-bold shrink-0">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-sm font-bold text-slate-900">
                      Session with {m.studentName}
                    </h2>
                    <StatusBadge type="meetingStatus" value={m.status} />
                    <StatusBadge type="attendance" value={m.attendanceStatus} />
                  </div>

                  <div className="mt-1 flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                    <span className="font-semibold text-slate-800">
                      {m.scheduledDate} at {m.scheduledTime.slice(0, 5)}
                    </span>
                    <StatusBadge type="meetingMode" value={m.mode} />
                    {m.location && (
                      <span className="flex items-center gap-1 text-slate-600">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {m.location}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-700 mt-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    Topic: {m.topic || 'General academic mentoring progress review.'}
                  </p>

                  {m.rescheduleReason && (
                    <p className="text-[11px] text-amber-800 mt-1 italic">
                      Revision Note: {m.rescheduleReason}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                {m.meetingLink && (
                  <a
                    href={m.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Launch video call with ${m.studentName}`}
                    className="p-2 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 focus-visible:ring-2 focus-visible:ring-indigo-900 focus-visible:outline-none transition-colors"
                    title="Launch Online Video Call"
                  >
                    <Video className="w-4 h-4" />
                  </a>
                )}

                {m.status === 'SCHEDULED' && (
                  <>
                    <button
                      type="button"
                      onClick={() => setSelectedMeetingId(m.id)}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none transition-colors"
                    >
                      Record Attendance
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRescheduleMeeting(m);
                        setNewDate(m.scheduledDate);
                        setNewTime(m.scheduledTime.slice(0, 5));
                      }}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none transition-colors"
                    >
                      Reschedule
                    </button>
                  </>
                )}

                <Link
                  href={`/mentor/sessions?meetingId=${m.id}&studentId=${m.studentUserId}`}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none transition-colors inline-flex items-center gap-1"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Session Note</span>
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Attendance Modal with Radiogroup */}
      <Modal
        isOpen={selectedMeetingId !== null}
        onClose={() => setSelectedMeetingId(null)}
        title="Record Session Attendance"
        description="Select student attendance status to update session record"
      >
        <form onSubmit={handleMarkAttendance} className="space-y-4">
          <div role="radiogroup" aria-label="Attendance status options" className="grid grid-cols-2 gap-2 text-xs">
            {[
              { label: 'Present', val: AttendanceStatus.PRESENT, desc: 'Punctual attendance' },
              { label: 'Late', val: AttendanceStatus.LATE, desc: 'Tardy arrival' },
              { label: 'Absent', val: AttendanceStatus.ABSENT, desc: 'Unapproved absence' },
              { label: 'Excused', val: AttendanceStatus.EXCUSED, desc: 'Formal excused leave' },
            ].map((item) => (
              <button
                type="button"
                role="radio"
                aria-checked={attendance === item.val}
                key={item.val}
                onClick={() => setAttendance(item.val)}
                className={`p-3 rounded-lg border text-left transition-all focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none ${
                  attendance === item.val
                    ? 'border-slate-900 bg-slate-50 font-bold'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <p className="font-semibold text-slate-900">{item.label}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
              </button>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setSelectedMeetingId(null)}
              className="px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none"
            >
              Submit Attendance
            </button>
          </div>
        </form>
      </Modal>

      {/* Reschedule Modal */}
      <Modal
        isOpen={rescheduleMeeting !== null}
        onClose={() => setRescheduleMeeting(null)}
        title="Reschedule Mentoring Session"
        description="Notify student of updated schedule timing"
      >
        <form onSubmit={handleRescheduleSubmit} className="space-y-4 text-xs">
          <div>
            <label htmlFor="reschedule-date" className="block font-semibold text-slate-700">
              New Scheduled Date
            </label>
            <input
              id="reschedule-date"
              type="date"
              required
              min={todayStr}
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="mt-1 block w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 bg-white"
            />
          </div>

          <div>
            <label htmlFor="reschedule-time" className="block font-semibold text-slate-700">
              New Start Time
            </label>
            <input
              id="reschedule-time"
              type="time"
              required
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="mt-1 block w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 bg-white"
            />
          </div>

          <div>
            <label htmlFor="reschedule-notes" className="block font-semibold text-slate-700">
              Reason for Rescheduling
            </label>
            <textarea
              id="reschedule-notes"
              required
              rows={3}
              value={rescheduleReason}
              onChange={(e) => setRescheduleReason(e.target.value)}
              placeholder="e.g. Faculty departmental conference overlap..."
              className="mt-1 block w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 bg-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setRescheduleMeeting(null)}
              className="px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none"
            >
              Confirm Reschedule
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
