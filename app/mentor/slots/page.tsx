'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { mockStore } from '@/lib/mockStore';
import { StatusBadge } from '@/components/common/StatusBadge';
import {
  Clock,
  Plus,
  CheckCircle2,
  User,
  MapPin,
  Video,
  AlertCircle,
} from 'lucide-react';
import { MeetingMode, SlotAllocationStatus, SlotStatus } from '@/types';

export default function MentorSlotsPage() {
  const { user } = useAuth();
  const mentorUserId = user?.id || 18;

  const [slots, setSlots] = useState(() => mockStore.getSlots(mentorUserId));
  const [students] = useState(() =>
    mockStore.getStudents().filter((s) => s.allocatedMentorId === mentorUserId)
  );

  const todayStr = new Date().toISOString().split('T')[0];

  // Form state
  const [slotDate, setSlotDate] = useState('2026-09-29');
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('10:45');
  const [mode, setMode] = useState<MeetingMode>(MeetingMode.IN_PERSON);
  const [location, setLocation] = useState('Computing Block B, Room 402');
  const [meetingLink, setMeetingLink] = useState('');
  const [assignStudentId, setAssignStudentId] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const handleCreateSlot = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (endTime <= startTime) {
      setErrorMessage('End time must be later than the start time.');
      return;
    }

    if (mode === MeetingMode.ONLINE && !meetingLink.trim()) {
      setErrorMessage('Please provide an online video meeting URL for online consultations.');
      return;
    }

    const assignedStudent = assignStudentId
      ? students.find((s) => s.userId === parseInt(assignStudentId, 10))
      : null;

    mockStore.createSlot({
      mentorUserId,
      mentorName: user?.fullName || 'Dr. Grace Hopper',
      slotDate,
      startTime: `${startTime}:00`,
      endTime: `${endTime}:00`,
      mode,
      location: mode === MeetingMode.ONLINE ? null : location,
      meetingLink: mode === MeetingMode.IN_PERSON ? null : meetingLink.trim(),
      status: assignedStudent ? SlotStatus.ALLOCATED : SlotStatus.OPEN,
      assignedStudentUserId: assignedStudent ? assignedStudent.userId : null,
      assignedStudentName: assignedStudent ? assignedStudent.fullName : null,
      allocationStatus: assignedStudent ? SlotAllocationStatus.PENDING : null,
    });

    setSlots([...mockStore.getSlots(mentorUserId)]);
    setAssignStudentId('');
    setToastMessage('Mentoring consultation slot successfully published.');
    setTimeout(() => setToastMessage(''), 3500);
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
      <div className="pb-3 border-b border-slate-200">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Consultation Slot Generator</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure availability windows and directly offer consultation slots to allocated mentees
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Slot Generator Form */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Clock className="w-4 h-4 text-slate-500" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
              Publish Availability
            </h2>
          </div>

          {errorMessage && (
            <div
              role="alert"
              className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleCreateSlot} className="space-y-4 text-xs">
            <div>
              <label htmlFor="slot-date" className="block font-semibold text-slate-700">
                Slot Date
              </label>
              <input
                id="slot-date"
                type="date"
                required
                min={todayStr}
                value={slotDate}
                onChange={(e) => setSlotDate(e.target.value)}
                className="mt-1 block w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="slot-start-time" className="block font-semibold text-slate-700">
                  Start Time
                </label>
                <input
                  id="slot-start-time"
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 bg-white"
                />
              </div>
              <div>
                <label htmlFor="slot-end-time" className="block font-semibold text-slate-700">
                  End Time
                </label>
                <input
                  id="slot-end-time"
                  type="time"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 bg-white"
                />
              </div>
            </div>

            <div>
              <label htmlFor="slot-mode" className="block font-semibold text-slate-700">
                Consultation Format / Mode
              </label>
              <select
                id="slot-mode"
                value={mode}
                onChange={(e) => setMode(e.target.value as MeetingMode)}
                className="mt-1 block w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 bg-white"
              >
                <option value={MeetingMode.IN_PERSON}>In-Person (Physical Room)</option>
                <option value={MeetingMode.ONLINE}>Online (Video Conference)</option>
                <option value={MeetingMode.HYBRID}>Hybrid Option</option>
              </select>
            </div>

            {mode !== MeetingMode.ONLINE && (
              <div>
                <label htmlFor="slot-location" className="block font-semibold text-slate-700">
                  Physical Room / Location
                </label>
                <input
                  id="slot-location"
                  type="text"
                  required={mode === MeetingMode.IN_PERSON}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Computing Block B, Room 402"
                  className="mt-1 block w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 bg-white"
                />
              </div>
            )}

            {mode !== MeetingMode.IN_PERSON && (
              <div>
                <label htmlFor="slot-meeting-url" className="block font-semibold text-slate-700">
                  Video Meeting URL {mode === MeetingMode.ONLINE ? '(Required)' : '(Optional)'}
                </label>
                <input
                  id="slot-meeting-url"
                  type="url"
                  required={mode === MeetingMode.ONLINE}
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  placeholder="https://meet.google.com/..."
                  className="mt-1 block w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 bg-white"
                />
              </div>
            )}

            <div className="pt-2 border-t border-slate-100">
              <label htmlFor="assign-student" className="block font-semibold text-slate-700">
                Direct Mentee Allocation (Optional)
              </label>
              <select
                id="assign-student"
                value={assignStudentId}
                onChange={(e) => setAssignStudentId(e.target.value)}
                className="mt-1 block w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 bg-white"
              >
                <option value="">Leave Open (First-come or Request)</option>
                {students.map((s) => (
                  <option key={s.userId} value={s.userId}>
                    {s.fullName} ({s.studentId})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                Selecting a mentee will immediately send an invitation notification to their portal.
              </p>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Create Consultation Slot</span>
            </button>
          </form>
        </div>

        {/* Existing Slots Table / List */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
              Scheduled Availability Windows
            </h2>
            <span className="text-[11px] text-slate-500">{slots.length} Slots Registered</span>
          </div>

          <div className="mt-4 divide-y divide-slate-100">
            {slots.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500">
                No slots configured yet.
              </div>
            ) : (
              slots.map((s) => (
                <div key={s.id} className="py-3.5 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900">
                        {s.slotDate} ({s.startTime.slice(0, 5)} - {s.endTime.slice(0, 5)})
                      </span>
                      <StatusBadge type="meetingMode" value={s.mode} />
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                          s.status === 'OPEN'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-slate-100 text-slate-800 border-slate-200'
                        }`}
                      >
                        {s.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-slate-600 text-[11px]">
                      {s.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {s.location}
                        </span>
                      )}
                      {s.meetingLink && (
                        <a
                          href={s.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-indigo-600 hover:underline"
                        >
                          <Video className="w-3 h-3" />
                          <span>Join Link</span>
                        </a>
                      )}
                    </div>

                    {s.assignedStudentName && (
                      <div className="mt-1 flex items-center gap-2 text-[11px] font-medium text-indigo-800 bg-indigo-50/60 px-2.5 py-1 rounded-md border border-indigo-100 inline-flex">
                        <User className="w-3 h-3 text-indigo-600" />
                        <span>Offered to: {s.assignedStudentName}</span>
                        {s.allocationStatus && (
                          <span className="text-[10px] font-semibold uppercase text-indigo-900 bg-white px-1.5 py-0.5 rounded border border-indigo-200">
                            {s.allocationStatus.replace('_', ' ')}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
