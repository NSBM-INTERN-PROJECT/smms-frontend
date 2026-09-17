'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { mockStore, useStoreSync } from '@/lib/mockStore';
import { StatCard } from '@/components/common/StatCard';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Modal } from '@/components/common/Modal';
import { ProgressStatus } from '@/types';
import {
  CalendarDays,
  Clock,
  Video,
  MapPin,
  Mail,
  Phone,
  Building,
  CheckCircle2,
  ArrowRight,
  UserCheck,
  FileText,
  CalendarCheck2,
} from 'lucide-react';

export default function StudentDashboardPage() {
  useStoreSync();
  const { user } = useAuth();
  const studentUserId = user?.id || 42;

  const summary = mockStore.getStudentDashboardSummary(studentUserId);
  const [slotInvitations, setSlotInvitations] = useState(() => mockStore.getStudentSlotInvitations(studentUserId));
  const mentor = mockStore.getMentorByUserId(summary.mentorUserId);
  const recentNotes = mockStore.getSessionNotes(studentUserId, user?.role).slice(0, 2);

  useEffect(() => {
    return mockStore.subscribe(() => {
      setSlotInvitations([...mockStore.getStudentSlotInvitations(studentUserId)]);
    });
  }, [studentUserId]);

  // Reschedule Modal state
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);

  const handleAcceptSlot = (slotId: number) => {
    mockStore.respondToSlot(slotId, true);
    setSlotInvitations(mockStore.getStudentSlotInvitations(studentUserId));
  };

  const handleRescheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSlotId) {
      mockStore.respondToSlot(selectedSlotId, false, rescheduleReason);
      setIsRescheduleOpen(false);
      setRescheduleReason('');
      setSlotInvitations(mockStore.getStudentSlotInvitations(studentUserId));
    }
  };

  const getProgressBadgeProps = (status: ProgressStatus) => {
    switch (status) {
      case ProgressStatus.ON_TRACK:
        return { badge: 'On Track', badgeVariant: 'success' as const };
      case ProgressStatus.NEEDS_ATTENTION:
        return { badge: 'Needs Attention', badgeVariant: 'warning' as const };
      case ProgressStatus.AT_RISK:
        return { badge: 'At Risk', badgeVariant: 'danger' as const };
      case ProgressStatus.CRITICAL:
        return { badge: 'Critical', badgeVariant: 'danger' as const };
      default:
        return { badge: String(status).replace(/_/g, ' '), badgeVariant: 'neutral' as const };
    }
  };

  const progressProps = getProgressBadgeProps(summary.latestProgressStatus);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Welcome back, {user?.fullName || 'John'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Student ID: <span className="font-semibold text-slate-700">IT21004212</span> • Software Engineering (Batch 21.1)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/student/request-meeting"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none transition-colors"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Request Consultation</span>
          </Link>
          <Link
            href="/student/meetings"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none transition-colors"
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>View Full Schedule</span>
          </Link>
        </div>
      </div>

      {/* Urgent Slot Invitations Banner (Render all pending invitations) */}
      {slotInvitations.length > 0 && (
        <div className="rounded-xl border border-indigo-200 bg-indigo-50/70 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-2">
              <CalendarCheck2 className="w-4 h-4 text-indigo-700" />
              <span>
                {slotInvitations.length === 1
                  ? 'New Mentoring Session Offered'
                  : `${slotInvitations.length} Mentoring Sessions Offered`}
              </span>
            </h2>
          </div>

          <div className="space-y-3">
            {slotInvitations.map((slot) => (
              <div
                key={slot.id}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-3.5 rounded-lg bg-white border border-indigo-100 shadow-2xs"
              >
                <div>
                  <p className="text-xs text-slate-700">
                    Your mentor <span className="font-semibold text-slate-900">{mentor?.fullName}</span> has offered a session on{' '}
                    <span className="font-semibold text-slate-900">{slot.slotDate}</span> from{' '}
                    <span className="font-semibold text-slate-900">{slot.startTime.slice(0, 5)}</span> to{' '}
                    <span className="font-semibold text-slate-900">{slot.endTime.slice(0, 5)}</span>.
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                    <span className="font-medium text-slate-500">Format:</span>
                    <StatusBadge type="meetingMode" value={slot.mode} />
                    {slot.location && <span>• {slot.location}</span>}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleAcceptSlot(slot.id)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-900 focus-visible:outline-none transition-colors shadow-2xs"
                  >
                    Accept Slot
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSlotId(slot.id);
                      setIsRescheduleOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-white border border-indigo-200 text-indigo-700 text-xs font-semibold hover:bg-indigo-50 focus-visible:ring-2 focus-visible:ring-indigo-900 focus-visible:outline-none transition-colors"
                  >
                    Request Reschedule
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Progress Rating"
          value={summary.latestProgressStatus.replace('_', ' ')}
          badge={progressProps.badge}
          badgeVariant={progressProps.badgeVariant}
          subtitle="Evaluated after last consultation"
        />
        <StatCard
          title="Attended Sessions"
          value={`${summary.attendancePresent} / ${summary.totalMeetings}`}
          subtitle="Overall attendance record"
          icon={CheckCircle2}
        />
        <StatCard
          title="Upcoming Meetings"
          value={summary.upcomingMeetings}
          subtitle={summary.nextMeeting ? `Next on ${summary.nextMeeting.scheduledDate}` : 'No sessions pending'}
          icon={CalendarDays}
        />
        <StatCard
          title="Logged Session Notes"
          value={summary.totalSessionNotes}
          subtitle="Action items documented"
          icon={FileText}
        />
      </div>

      {/* Main Split: Assigned Mentor Dossier & Next Meeting */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mentor Dossier Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Assigned Mentor
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                <UserCheck className="w-3.5 h-3.5" />
                Active Mentor
              </span>
            </div>

            <div className="mt-4 flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-sm overflow-hidden shrink-0">
                GH
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-slate-900 truncate">{mentor?.fullName}</h3>
                <p className="text-xs text-slate-500 truncate">{mentor?.designation}</p>
                <p className="text-xs text-indigo-700 font-medium mt-0.5 truncate">{mentor?.department}</p>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-xs text-slate-600 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2 min-w-0">
                <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{mentor?.officeLocation}</span>
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <a href={`mailto:${mentor?.email}`} className="truncate hover:underline text-indigo-600">
                  {mentor?.email}
                </a>
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <a href={`tel:${mentor?.contactPhone}`} className="hover:underline">
                  {mentor?.contactPhone}
                </a>
              </div>
            </div>

            <div className="mt-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Domain Specialization
              </span>
              <p className="text-slate-700 leading-snug">{mentor?.specialization}</p>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
            <Link
              href="/student/request-meeting"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 focus-visible:ring-1 focus-visible:ring-indigo-800 rounded"
            >
              <span>Request Consultation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Next Scheduled Meeting & Agenda */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Upcoming Meeting Agenda
              </span>
              {summary.nextMeeting && (
                <StatusBadge type="meetingStatus" value={summary.nextMeeting.status} />
              )}
            </div>

            {summary.nextMeeting ? (
              <div className="mt-4 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-slate-700 shadow-2xs">
                      <CalendarDays className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-900">
                        {summary.nextMeeting.scheduledDate} at {summary.nextMeeting.scheduledTime.slice(0, 5)}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <StatusBadge type="meetingMode" value={summary.nextMeeting.mode} />
                        {summary.nextMeeting.location && (
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {summary.nextMeeting.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {summary.nextMeeting.meetingLink && (
                    <a
                      href={summary.nextMeeting.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-900 focus-visible:outline-none transition-colors shrink-0"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Join Online Call</span>
                    </a>
                  )}
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                    Discussion Topic
                  </span>
                  <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg leading-relaxed">
                    {summary.nextMeeting.topic || 'General academic mentoring and semester progress advisory.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-slate-500">
                No upcoming meetings currently scheduled.
              </div>
            )}
          </div>

          {/* Recent Action Items from past meetings */}
          <div className="mt-6 pt-4 border-t border-slate-100">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
              Action Items from Previous Consultation
            </span>
            {recentNotes.length > 0 ? (
              <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg space-y-1 whitespace-pre-line leading-relaxed">
                {recentNotes[0].actionItems}
              </div>
            ) : (
              <p className="text-xs text-slate-500">No session notes recorded yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Reschedule Request Modal */}
      <Modal
        isOpen={isRescheduleOpen}
        onClose={() => setIsRescheduleOpen(false)}
        title="Request Slot Reschedule"
        description="Notify your mentor of a scheduling conflict and propose alternative timing."
      >
        <form onSubmit={handleRescheduleSubmit} className="space-y-4">
          <div>
            <label htmlFor="reschedule-reason" className="block text-xs font-semibold text-slate-700">
              Reason for Reschedule Request
            </label>
            <textarea
              id="reschedule-reason"
              required
              rows={3}
              value={rescheduleReason}
              onChange={(e) => setRescheduleReason(e.target.value)}
              placeholder="e.g. Clashing midterm laboratory exam at 10:00 AM; available after 1:00 PM."
              className="mt-1 block w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900 bg-white"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsRescheduleOpen(false)}
              className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none"
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
