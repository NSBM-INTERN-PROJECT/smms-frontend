'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { mockStore } from '@/lib/mockStore';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Clock, Send, CheckCircle2, HelpCircle } from 'lucide-react';
import { Role } from '@/types';

export default function RequestMeetingPage() {
  const { user } = useAuth();
  const studentUserId = user?.id || 42;

  // Retrieve assigned mentor dynamically
  const summary = mockStore.getStudentDashboardSummary(studentUserId);
  const mentor = mockStore.getMentorByUserId(summary.mentorUserId);

  const todayStr = new Date().toISOString().split('T')[0];
  const [proposedDate, setProposedDate] = useState(todayStr);
  const [proposedTime, setProposedTime] = useState('14:00');
  const [topic, setTopic] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const [requests, setRequests] = useState(() =>
    mockStore.getMeetingRequests(Role.STUDENT, studentUserId)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mentorId = mentor?.userId || 18;
    mockStore.createMeetingRequest(
      studentUserId,
      mentorId,
      proposedDate,
      `${proposedTime}:00`,
      topic
    );

    setRequests(mockStore.getMeetingRequests(Role.STUDENT, studentUserId));
    setTopic('');
    const mentorName = mentor?.fullName || 'your mentor';
    setToastMessage(`Consultation request successfully submitted to ${mentorName}.`);
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
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Request Mentoring Consultation</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Propose a consultation time with your designated academic mentor ({mentor?.fullName || 'Assigned Mentor'})
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Request Form */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Clock className="w-4 h-4 text-slate-500" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
              Propose Consultation Time
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label htmlFor="meeting-date" className="block font-semibold text-slate-700">
                Proposed Meeting Date
              </label>
              <input
                id="meeting-date"
                type="date"
                required
                min={todayStr}
                value={proposedDate}
                onChange={(e) => setProposedDate(e.target.value)}
                className="mt-1 block w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 bg-white"
              />
            </div>

            <div>
              <label htmlFor="meeting-time" className="block font-semibold text-slate-700">
                Proposed Start Time
              </label>
              <input
                id="meeting-time"
                type="time"
                required
                value={proposedTime}
                onChange={(e) => setProposedTime(e.target.value)}
                className="mt-1 block w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 bg-white"
              />
            </div>

            <div>
              <label htmlFor="meeting-topic" className="block font-semibold text-slate-700">
                Discussion Agenda & Goals
              </label>
              <textarea
                id="meeting-topic"
                required
                rows={4}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Detail what you wish to discuss (e.g. thesis topic selection, coursework doubts, career guidance)..."
                className="mt-1 block w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 bg-white"
              />
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-start gap-2 text-[11px] text-slate-600">
              <HelpCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <span>
                Your mentor will review your proposal. Upon approval, you will receive a calendar confirmation with meeting details.
              </span>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none transition-colors shadow-2xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Consultation Request</span>
            </button>
          </form>
        </div>

        {/* Previous Requests History */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
              Submitted Consultation Requests
            </h2>
            <span className="text-[11px] text-slate-500">{requests.length} Requests</span>
          </div>

          <div className="mt-4 divide-y divide-slate-100">
            {requests.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500">
                No consultation requests submitted yet.
              </div>
            ) : (
              requests.map((r) => (
                <div key={r.id} className="py-4 text-xs space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">
                        {r.proposedDate} at {r.proposedTime.slice(0, 5)}
                      </span>
                      <StatusBadge type="request" value={r.status} />
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono">
                      Submitted on {r.createdAt.slice(0, 10)}
                    </span>
                  </div>

                  <p className="text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-relaxed">
                    {r.topic}
                  </p>

                  {r.reviewNotes && (
                    <div className="text-[11px] p-2.5 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-900">
                      <span className="font-semibold">Mentor Response:</span> {r.reviewNotes}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
