'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { mockStore } from '@/lib/mockStore';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Modal } from '@/components/common/Modal';
import {
  CalendarDays,
  Video,
  MapPin,
  Clock,
  CheckCircle2,
  FileText,
  CalendarCheck2,
  Plus,
} from 'lucide-react';
import { Role } from '@/types';

export default function StudentMeetingsPage() {
  const { user } = useAuth();
  const studentUserId = user?.id || 42;

  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');
  const [meetings, setMeetings] = useState(() => mockStore.getMeetings(Role.STUDENT, studentUserId));
  const [slots, setSlots] = useState(() => mockStore.getStudentSlotInvitations(studentUserId));
  const [sessionNotes] = useState(() => mockStore.getSessionNotes(studentUserId, Role.STUDENT));

  // Reschedule Slot Modal state
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const upcomingMeetings = meetings.filter((m) => m.status === 'SCHEDULED' || m.status === 'RESCHEDULED');
  const pastMeetings = meetings.filter((m) => m.status === 'COMPLETED' || m.status === 'CANCELLED');

  const handleAcceptSlot = (slotId: number) => {
    mockStore.respondToSlot(slotId, true);
    setSlots(mockStore.getStudentSlotInvitations(studentUserId));
    setMeetings([...mockStore.getMeetings(Role.STUDENT, studentUserId)]);
    setToastMessage('Slot confirmed! Meeting scheduled on your calendar.');
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleRescheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSlotId) {
      mockStore.respondToSlot(selectedSlotId, false, rescheduleReason);
      setIsRescheduleOpen(false);
      setRescheduleReason('');
      setSlots(mockStore.getStudentSlotInvitations(studentUserId));
      setToastMessage('Reschedule request communicated to mentor.');
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
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Meetings & Consultations</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your mentoring calendar, session slot invitations, and historical action items
          </p>
        </div>
        <Link
          href="/student/request-meeting"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none transition-colors self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Request Consultation</span>
        </Link>
      </div>

      {/* Pending Slot Invitations Alert: Render all pending invitations */}
      {slots.length > 0 && (
        <div className="rounded-xl border border-indigo-200 bg-indigo-50/70 p-4 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-2">
            <CalendarCheck2 className="w-4 h-4 text-indigo-700" />
            <span>
              {slots.length === 1
                ? '1 Mentoring Slot Invitation Pending'
                : `${slots.length} Mentoring Slot Invitations Pending`}
            </span>
          </h2>

          <div className="space-y-2.5">
            {slots.map((s) => (
              <div
                key={s.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white rounded-lg border border-indigo-100 shadow-2xs"
              >
                <div>
                  <p className="text-xs text-slate-800">
                    Consultation offered on <span className="font-semibold text-slate-900">{s.slotDate}</span> ({s.startTime.slice(0, 5)} - {s.endTime.slice(0, 5)}).
                  </p>
                  <div className="mt-1.5 flex items-center gap-2 text-xs">
                    <StatusBadge type="meetingMode" value={s.mode} />
                    {s.location && (
                      <span className="text-slate-600 text-xs flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {s.location}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleAcceptSlot(s.id)}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-900 focus-visible:outline-none transition-colors shadow-2xs"
                  >
                    Accept Session
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSlotId(s.id);
                      setIsRescheduleOpen(true);
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-white border border-indigo-200 text-indigo-700 text-xs font-semibold hover:bg-indigo-50 focus-visible:ring-2 focus-visible:ring-indigo-900 focus-visible:outline-none transition-colors"
                  >
                    Request Reschedule
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs with ARIA semantics */}
      <div role="tablist" aria-label="Meeting schedule views" className="flex items-center gap-2 border-b border-slate-200">
        <button
          type="button"
          role="tab"
          id="tab-upcoming"
          aria-selected={activeTab === 'upcoming'}
          aria-controls="panel-upcoming"
          onClick={() => setActiveTab('upcoming')}
          className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none rounded-t ${
            activeTab === 'upcoming'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Upcoming Sessions ({upcomingMeetings.length})</span>
        </button>
        <button
          type="button"
          role="tab"
          id="tab-history"
          aria-selected={activeTab === 'history'}
          aria-controls="panel-history"
          onClick={() => setActiveTab('history')}
          className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none rounded-t ${
            activeTab === 'history'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Session Feedback & History ({pastMeetings.length})</span>
        </button>
      </div>

      {/* Tab 1: Upcoming Sessions */}
      {activeTab === 'upcoming' && (
        <div id="panel-upcoming" role="tabpanel" aria-labelledby="tab-upcoming" className="space-y-4">
          {upcomingMeetings.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-xs">
              No upcoming sessions currently on your schedule.
            </div>
          ) : (
            upcomingMeetings.map((m) => (
              <div
                key={m.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 shrink-0">
                    <CalendarDays className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-slate-900">
                        {m.scheduledDate} at {m.scheduledTime.slice(0, 5)}
                      </h3>
                      <StatusBadge type="meetingStatus" value={m.status} />
                      <StatusBadge type="meetingMode" value={m.mode} />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Mentor: <span className="font-semibold text-slate-800">{m.mentorName}</span>
                    </p>
                    <p className="text-xs text-slate-700 mt-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      Topic: {m.topic || 'Mentoring Review Session'}
                    </p>
                    {m.location && (
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>Room Location: {m.location}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  {m.meetingLink && (
                    <a
                      href={m.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Join video call with ${m.mentorName}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-900 focus-visible:outline-none transition-colors shadow-2xs"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Join Call</span>
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Session History & Feedback */}
      {activeTab === 'history' && (
        <div id="panel-history" role="tabpanel" aria-labelledby="tab-history" className="space-y-4">
          {pastMeetings.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-xs">
              No completed mentoring sessions logged yet.
            </div>
          ) : (
            pastMeetings.map((m) => {
              const note = sessionNotes.find((n) => n.meetingId === m.id);
              return (
                <div key={m.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900">
                          Session with {m.mentorName}
                        </h3>
                        <StatusBadge type="attendance" value={m.attendanceStatus} />
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Conducted on {m.scheduledDate} at {m.scheduledTime.slice(0, 5)}
                      </p>
                    </div>
                    {note && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-slate-500 font-medium">Assessed:</span>
                        <StatusBadge type="progress" value={note.progressStatus} />
                      </div>
                    )}
                  </div>

                  {note ? (
                    <div className="space-y-3 text-xs">
                      <div>
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                          Mentor Feedback & Discussion
                        </span>
                        <p className="text-slate-700 bg-slate-50 p-3 rounded-lg leading-relaxed">
                          {note.discussionNotes}
                        </p>
                      </div>

                      <div>
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                          Action Items Checklist
                        </span>
                        <div className="text-slate-700 bg-indigo-50/50 p-3 rounded-lg border border-indigo-100/60 whitespace-pre-line leading-relaxed">
                          {note.actionItems}
                        </div>
                      </div>

                      {note.followUpDate && (
                        <p className="text-[11px] text-slate-500">
                          Follow-up Target: <span className="font-semibold text-slate-800">{note.followUpDate}</span>
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">No detailed notes filed for this session.</p>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Reschedule Modal */}
      <Modal
        isOpen={isRescheduleOpen}
        onClose={() => setIsRescheduleOpen(false)}
        title="Request Slot Reschedule"
        description="Notify mentor of time conflict and request alternative time"
      >
        <form onSubmit={handleRescheduleSubmit} className="space-y-4">
          <div>
            <label htmlFor="slot-reschedule-reason" className="block text-xs font-semibold text-slate-700">
              Reason for Reschedule
            </label>
            <textarea
              id="slot-reschedule-reason"
              required
              rows={3}
              value={rescheduleReason}
              onChange={(e) => setRescheduleReason(e.target.value)}
              placeholder="Provide reason and proposed alternative availability..."
              className="mt-1 block w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 bg-white"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsRescheduleOpen(false)}
              className="px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none"
            >
              Submit Request
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
