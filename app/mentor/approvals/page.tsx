'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { mockStore, useStoreSync } from '@/lib/mockStore';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Modal } from '@/components/common/Modal';
import {
  CalendarDays,
  UserCheck,
  Send,
  CheckCircle2,
  Radio,
} from 'lucide-react';
import { MeetingRequestResponse, Role } from '@/types';

export default function MentorApprovalsPage() {
  useStoreSync();
  const { user } = useAuth();
  const mentorUserId = user?.id || 18;

  const [activeTab, setActiveTab] = useState<'meetings' | 'profiles' | 'broadcast'>('meetings');
  const [meetingRequests, setMeetingRequests] = useState(() =>
    mockStore.getMeetingRequests(Role.MENTOR, mentorUserId)
  );
  const [profileRequests, setProfileRequests] = useState(() => mockStore.getProfileRequests());

  useEffect(() => {
    return mockStore.subscribe(() => {
      setMeetingRequests([...mockStore.getMeetingRequests(Role.MENTOR, mentorUserId)]);
      setProfileRequests([...mockStore.getProfileRequests()]);
    });
  }, [mentorUserId]);
  const [toastMessage, setToastMessage] = useState('');

  // Meeting Approval Modal state
  const [approveMeetingModal, setApproveMeetingModal] = useState<MeetingRequestResponse | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [scheduledDate, setScheduledDate] = useState('2026-09-28');
  const [scheduledTime, setScheduledTime] = useState('14:00');
  const [meetingLink, setMeetingLink] = useState('https://meet.google.com/xyz-ghop-smms');
  const [roomLocation, setRoomLocation] = useState('');

  // Decline confirmation state
  const [declineMeetingId, setDeclineMeetingId] = useState<number | null>(null);
  const [declineReason, setDeclineReason] = useState('');

  // Broadcast Campaign Form state
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastDesc, setBroadcastDesc] = useState('');
  const [broadcastBatch, setBroadcastBatch] = useState('21.1');
  const [broadcastDept, setBroadcastDept] = useState('Software Engineering');
  const [broadcastDueDate, setBroadcastDueDate] = useState('2026-10-15');

  const pendingMeetings = meetingRequests.filter((r) => r.status === 'PENDING');
  const pendingProfiles = profileRequests.filter((r) => r.status === 'PENDING');

  const handleApproveMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!approveMeetingModal) return;

    mockStore.reviewMeetingRequest(
      approveMeetingModal.id,
      true,
      reviewNotes || 'Approved. Meeting scheduled on calendar.',
      scheduledDate,
      `${scheduledTime}:00`,
      meetingLink || undefined,
      roomLocation || undefined
    );

    setMeetingRequests([...mockStore.getMeetingRequests(Role.MENTOR, mentorUserId)]);
    setApproveMeetingModal(null);
    setReviewNotes('');
    setToastMessage('Meeting request approved and synchronized to calendar.');
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleConfirmDeclineMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!declineMeetingId) return;

    mockStore.reviewMeetingRequest(
      declineMeetingId,
      false,
      declineReason || 'Declined due to scheduling unavailability.'
    );
    setMeetingRequests([...mockStore.getMeetingRequests(Role.MENTOR, mentorUserId)]);
    setDeclineMeetingId(null);
    setDeclineReason('');
    setToastMessage('Meeting request declined.');
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleReviewProfile = (requestId: number, approve: boolean) => {
    mockStore.reviewProfileRequest(requestId, approve, approve ? 'Approved changes.' : 'Verification rejected.');
    setProfileRequests([...mockStore.getProfileRequests()]);
    setToastMessage(approve ? 'Profile field change approved.' : 'Profile request rejected.');
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleBroadcastSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mockStore.createTask({
      title: broadcastTitle,
      description: broadcastDesc,
      batch: broadcastBatch,
      department: broadcastDept,
      dueDate: broadcastDueDate,
      creatorMentorName: user?.fullName || 'Dr. Grace Hopper',
    });

    setBroadcastTitle('');
    setBroadcastDesc('');
    setToastMessage('Questionnaire campaign successfully broadcasted to student portals.');
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
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          Pending Approvals & Communications
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Review student consultation requests, authorize profile updates, or distribute cohort questionnaires
        </p>
      </div>

      {/* Tabs with accessible roles */}
      <div role="tablist" aria-label="Approvals management tabs" className="flex items-center gap-2 border-b border-slate-200">
        <button
          type="button"
          role="tab"
          id="tab-requests"
          aria-selected={activeTab === 'meetings'}
          aria-controls="panel-requests"
          onClick={() => setActiveTab('meetings')}
          className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none rounded-t ${
            activeTab === 'meetings'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <CalendarDays className="w-3.5 h-3.5" />
          <span>Meeting Requests ({pendingMeetings.length})</span>
        </button>

        <button
          type="button"
          role="tab"
          id="tab-profiles"
          aria-selected={activeTab === 'profiles'}
          aria-controls="panel-profiles"
          onClick={() => setActiveTab('profiles')}
          className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none rounded-t ${
            activeTab === 'profiles'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Profile Authorizations ({pendingProfiles.length})</span>
        </button>

        <button
          type="button"
          role="tab"
          id="tab-broadcast"
          aria-selected={activeTab === 'broadcast'}
          aria-controls="panel-broadcast"
          onClick={() => setActiveTab('broadcast')}
          className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none rounded-t ${
            activeTab === 'broadcast'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>Broadcast Campaign</span>
        </button>
      </div>

      {/* Tab 1: Student Meeting Requests */}
      {activeTab === 'meetings' && (
        <div id="panel-requests" role="tabpanel" aria-labelledby="tab-requests" className="space-y-3">
          {meetingRequests.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-xs">
              No meeting requests submitted by students.
            </div>
          ) : (
            meetingRequests.map((req) => (
              <div
                key={req.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{req.studentName}</span>
                    <StatusBadge type="request" value={req.status} />
                    <span className="text-[11px] text-slate-500 font-mono">
                      Submitted on {req.createdAt.slice(0, 10)}
                    </span>
                  </div>

                  <p className="text-slate-700">
                    Proposing: <strong className="text-slate-900">{req.proposedDate} at {req.proposedTime.slice(0, 5)}</strong>
                  </p>

                  <p className="text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-relaxed">
                    Topic: {req.topic}
                  </p>

                  {req.reviewNotes && (
                    <p className="text-[11px] text-indigo-800 font-medium">
                      Reviewer Feedback: {req.reviewNotes}
                    </p>
                  )}
                </div>

                {req.status === 'PENDING' && (
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    <button
                      type="button"
                      onClick={() => {
                        setApproveMeetingModal(req);
                        setScheduledDate(req.proposedDate);
                        setScheduledTime(req.proposedTime.slice(0, 5));
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none transition-colors shadow-2xs"
                    >
                      Approve & Schedule
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeclineMeetingId(req.id)}
                      className="px-3.5 py-1.5 rounded-lg border border-rose-200 text-rose-700 font-semibold text-xs hover:bg-rose-50 focus-visible:ring-2 focus-visible:ring-rose-950 focus-visible:outline-none transition-colors"
                    >
                      Decline
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Profile Change Requests (Side-by-side diff) */}
      {activeTab === 'profiles' && (
        <div id="panel-profiles" role="tabpanel" aria-labelledby="tab-profiles" className="space-y-3">
          {profileRequests.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-xs">
              No profile change requests filed.
            </div>
          ) : (
            profileRequests.map((pr) => (
              <div
                key={pr.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{pr.studentName}</span>
                    <StatusBadge type="request" value={pr.status} />
                    <span className="text-[11px] text-slate-500 font-mono">
                      {pr.createdAt.slice(0, 10)}
                    </span>
                  </div>

                  {/* Side-by-side comparison of old vs new value */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <div>
                      <span className="text-slate-500 font-medium block">Modified Field:</span>
                      <span className="font-semibold text-slate-900 capitalize">
                        {pr.fieldName.replace(/([A-Z])/g, ' $1')}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium block">Current Record:</span>
                      <span className="text-slate-700 font-mono">{pr.oldValue || '— None —'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium block">Requested Value:</span>
                      <span className="font-bold text-emerald-800 font-mono">{pr.newValue}</span>
                    </div>
                  </div>

                  <p className="text-slate-600 italic text-[11px]">Justification: {pr.reason}</p>
                </div>

                {pr.status === 'PENDING' && (
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    <button
                      type="button"
                      onClick={() => handleReviewProfile(pr.id, true)}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-900 focus-visible:outline-none transition-colors shadow-2xs"
                    >
                      Authorize Change
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReviewProfile(pr.id, false)}
                      className="px-3.5 py-1.5 rounded-lg border border-rose-200 text-rose-700 font-semibold text-xs hover:bg-rose-50 focus-visible:ring-2 focus-visible:ring-rose-950 focus-visible:outline-none transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: Broadcast Campaign Form */}
      {activeTab === 'broadcast' && (
        <div id="panel-broadcast" role="tabpanel" aria-labelledby="tab-broadcast" className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs max-w-2xl space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
              Deploy Cohort Data Collection Task
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Target an entire academic batch or departmental cohort with surveys and questionnaires
            </p>
          </div>

          <form onSubmit={handleBroadcastSubmit} className="space-y-4 text-xs">
            <div>
              <label htmlFor="broadcast-title" className="block font-semibold text-slate-700">
                Task Title
              </label>
              <input
                id="broadcast-title"
                type="text"
                required
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                placeholder="e.g. Industry Placement & Internship Preference Survey"
                className="mt-1 block w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label htmlFor="broadcast-batch" className="block font-semibold text-slate-700">
                  Target Batch
                </label>
                <select
                  id="broadcast-batch"
                  value={broadcastBatch}
                  onChange={(e) => setBroadcastBatch(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 bg-white"
                >
                  <option value="21.1">Batch 21.1 (Final Year)</option>
                  <option value="22.1">Batch 22.1 (Year 3)</option>
                  <option value="23.1">Batch 23.1 (Year 2)</option>
                </select>
              </div>

              <div>
                <label htmlFor="broadcast-dept" className="block font-semibold text-slate-700">
                  Department
                </label>
                <select
                  id="broadcast-dept"
                  value={broadcastDept}
                  onChange={(e) => setBroadcastDept(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 bg-white"
                >
                  <option value="Software Engineering">Software Engineering</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Data Science">Data Science</option>
                </select>
              </div>

              <div>
                <label htmlFor="broadcast-duedate" className="block font-semibold text-slate-700">
                  Submission Due Target
                </label>
                <input
                  id="broadcast-duedate"
                  type="date"
                  required
                  value={broadcastDueDate}
                  onChange={(e) => setBroadcastDueDate(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 bg-white"
                />
              </div>
            </div>

            <div>
              <label htmlFor="broadcast-scope" className="block font-semibold text-slate-700">
                Instructions & Questionnaire Scope
              </label>
              <textarea
                id="broadcast-scope"
                required
                rows={4}
                value={broadcastDesc}
                onChange={(e) => setBroadcastDesc(e.target.value)}
                placeholder="Explain the required information, target links, or submission requirements..."
                className="mt-1 block w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 bg-white"
              />
            </div>

            <button
              type="submit"
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none transition-colors shadow-2xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Broadcast to Mentees</span>
            </button>
          </form>
        </div>
      )}

      {/* Approve Meeting Modal */}
      {approveMeetingModal && (
        <Modal
          isOpen={true}
          onClose={() => setApproveMeetingModal(null)}
          title={`Approve Meeting with ${approveMeetingModal.studentName}`}
          description="Confirm session details and allocate calendar reservation"
        >
          <form onSubmit={handleApproveMeeting} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="approve-date" className="block font-semibold text-slate-700">
                  Confirmed Date
                </label>
                <input
                  id="approve-date"
                  type="date"
                  required
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 bg-white"
                />
              </div>
              <div>
                <label htmlFor="approve-time" className="block font-semibold text-slate-700">
                  Confirmed Start Time
                </label>
                <input
                  id="approve-time"
                  type="time"
                  required
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 bg-white"
                />
              </div>
            </div>

            <div>
              <label htmlFor="approve-url" className="block font-semibold text-slate-700">
                Video Call URL (Optional for Online)
              </label>
              <input
                id="approve-url"
                type="url"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                placeholder="https://meet.google.com/..."
                className="mt-1 block w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 bg-white"
              />
            </div>

            <div>
              <label htmlFor="approve-room" className="block font-semibold text-slate-700">
                Physical Room / Location (If In-Person)
              </label>
              <input
                id="approve-room"
                type="text"
                value={roomLocation}
                onChange={(e) => setRoomLocation(e.target.value)}
                placeholder="Computing Block B, Room 402"
                className="mt-1 block w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 bg-white"
              />
            </div>

            <div>
              <label htmlFor="approve-notes" className="block font-semibold text-slate-700">
                Confirmation Note for Student
              </label>
              <textarea
                id="approve-notes"
                rows={2}
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Confirmed. Please bring your draft portfolio."
                className="mt-1 block w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 bg-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setApproveMeetingModal(null)}
                className="px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none shadow-2xs"
              >
                Confirm & Dispatch Invitation
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Decline Meeting Confirmation Modal */}
      {declineMeetingId !== null && (
        <Modal
          isOpen={true}
          onClose={() => setDeclineMeetingId(null)}
          title="Decline Meeting Request"
          description="Provide a brief explanation for the student regarding this decision"
        >
          <form onSubmit={handleConfirmDeclineMeeting} className="space-y-4 text-xs">
            <div>
              <label htmlFor="decline-explanation" className="block font-semibold text-slate-700">
                Decline Explanation Note
              </label>
              <textarea
                id="decline-explanation"
                required
                rows={3}
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                placeholder="e.g. Unavailable during the requested time slot due to faculty lecture..."
                className="mt-1 block w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 bg-white"
              />
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeclineMeetingId(null)}
                className="px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 focus-visible:ring-2 focus-visible:ring-rose-950 focus-visible:outline-none shadow-2xs"
              >
                Confirm Decline
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
