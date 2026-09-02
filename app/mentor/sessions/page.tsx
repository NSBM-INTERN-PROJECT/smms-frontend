'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { mockStore } from '@/lib/mockStore';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Modal } from '@/components/common/Modal';
import { StudentHistoryReportModal } from '@/components/reports/StudentHistoryReportModal';
import {
  FileText,
  AlertTriangle,
  Send,
  CheckCircle2,
  Lock,
  ShieldAlert,
  Printer,
} from 'lucide-react';
import {
  EscalationCategory,
  EscalationRole,
  ProgressStatus,
  Role,
  StudentProfileResponse,
} from '@/types';

function SessionsContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const mentorUserId = user?.id || 18;

  const urlStudentId = searchParams.get('studentId');
  const urlMeetingId = searchParams.get('meetingId');

  const [students] = useState(() =>
    mockStore.getStudents().filter((s) => s.allocatedMentorId === mentorUserId)
  );
  const [notes, setNotes] = useState(() => mockStore.getSessionNotes(mentorUserId, Role.MENTOR));
  const [escalations, setEscalations] = useState(() =>
    mockStore.getEscalations().filter((e) => e.mentorUserId === mentorUserId)
  );

  // New Session Note form state
  const initialStudentId = urlStudentId || students[0]?.userId.toString() || '42';
  const [selectedStudentUserId, setSelectedStudentUserId] = useState<string>(initialStudentId);
  const [meetingIdInput] = useState<number>(urlMeetingId ? parseInt(urlMeetingId, 10) : 101);

  const [discussionNotes, setDiscussionNotes] = useState('');
  const [actionItems, setActionItems] = useState('');
  const [progressStatus, setProgressStatus] = useState<ProgressStatus>(ProgressStatus.ON_TRACK);
  const [followUpDate, setFollowUpDate] = useState('2026-10-15');
  const [isPrivate, setIsPrivate] = useState(false);

  // Escalation Modal state
  const [isEscalateOpen, setIsEscalateOpen] = useState(false);
  const [escalateStudentUserId, setEscalateStudentUserId] = useState<string>(initialStudentId);
  const [escalateCategory, setEscalateCategory] = useState<EscalationCategory>(
    EscalationCategory.ACADEMIC
  );
  const [escalateRole, setEscalateRole] = useState<EscalationRole>(EscalationRole.COORDINATOR);
  const [escalateDescription, setEscalateDescription] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Longitudinal History Report Modal state
  const [historyReportStudent, setHistoryReportStudent] = useState<StudentProfileResponse | null>(null);

  const [prevUrlStudentId, setPrevUrlStudentId] = useState(urlStudentId);
  if (urlStudentId !== prevUrlStudentId) {
    setPrevUrlStudentId(urlStudentId);
    if (urlStudentId) {
      setSelectedStudentUserId(urlStudentId);
      setEscalateStudentUserId(urlStudentId);
    }
  }

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    const sId = parseInt(selectedStudentUserId, 10);
    const student = students.find((s) => s.userId === sId);

    mockStore.createSessionNote({
      meetingId: meetingIdInput,
      mentorUserId,
      studentUserId: sId,
      studentName: student?.fullName || 'Student',
      discussionNotes,
      actionItems,
      progressStatus,
      followUpDate,
      isPrivate,
    });

    setNotes([...mockStore.getSessionNotes(mentorUserId, Role.MENTOR)]);
    setDiscussionNotes('');
    setActionItems('');
    setIsPrivate(false);
    setToastMessage('Mentoring session note successfully documented.');
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleRaiseEscalation = (e: React.FormEvent) => {
    e.preventDefault();
    const sId = parseInt(escalateStudentUserId, 10);
    const student = students.find((s) => s.userId === sId);

    mockStore.createEscalation({
      mentorUserId,
      mentorName: user?.fullName || 'Dr. Grace Hopper',
      studentUserId: sId,
      studentName: student?.fullName || 'Student',
      studentBatch: student?.batch || '21.1',
      category: escalateCategory,
      description: escalateDescription,
      escalatedToRole: escalateRole,
    });

    setEscalations([
      ...mockStore.getEscalations().filter((e) => e.mentorUserId === mentorUserId),
    ]);
    setIsEscalateOpen(false);
    setEscalateDescription('');
    setToastMessage('Institutional escalation successfully dispatched.');
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Session Notes & Escalations
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Log official consultation outcomes, assign student action items, or raise critical interventions
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => {
              const currentStudent = students.find((s) => s.userId === parseInt(selectedStudentUserId, 10));
              if (currentStudent) setHistoryReportStudent(currentStudent);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none transition-colors shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Generate Mentee History Report</span>
          </button>
          <button
            type="button"
            onClick={() => setIsEscalateOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 focus-visible:ring-2 focus-visible:ring-rose-950 focus-visible:outline-none transition-colors self-start sm:self-auto shadow-2xs"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Raise Critical Escalation</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form: Log Session Note */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <FileText className="w-4 h-4 text-slate-500" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
              Log Session Outcome
            </h2>
          </div>

          <form onSubmit={handleCreateNote} className="space-y-4 text-xs">
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="session-mentee" className="block font-semibold text-slate-700">
                  Select Mentee
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const currentStudent = students.find((s) => s.userId === parseInt(selectedStudentUserId, 10));
                    if (currentStudent) setHistoryReportStudent(currentStudent);
                  }}
                  className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  Full History Dossier →
                </button>
              </div>
              <select
                id="session-mentee"
                value={selectedStudentUserId}
                onChange={(e) => setSelectedStudentUserId(e.target.value)}
                className="mt-1 block w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 bg-white"
              >
                {students.map((s) => (
                  <option key={s.userId} value={s.userId}>
                    {s.fullName} ({s.studentId})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="session-progress" className="block font-semibold text-slate-700">
                Progress Assessment
              </label>
              <select
                id="session-progress"
                value={progressStatus}
                onChange={(e) => setProgressStatus(e.target.value as ProgressStatus)}
                className="mt-1 block w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 bg-white"
              >
                <option value={ProgressStatus.ON_TRACK}>ON TRACK (Satisfactory)</option>
                <option value={ProgressStatus.NEEDS_ATTENTION}>NEEDS ATTENTION (Minor Lag)</option>
                <option value={ProgressStatus.AT_RISK}>AT RISK (Academic Concern)</option>
                <option value={ProgressStatus.CRITICAL}>CRITICAL (Imminent Failure)</option>
              </select>
            </div>

            <div>
              <label htmlFor="session-notes" className="block font-semibold text-slate-700">
                Discussion Notes
              </label>
              <textarea
                id="session-notes"
                required
                rows={3}
                value={discussionNotes}
                onChange={(e) => setDiscussionNotes(e.target.value)}
                placeholder="Key challenges identified, academic topics discussed, feedback given..."
                className="mt-1 block w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 bg-white"
              />
            </div>

            <div>
              <label htmlFor="session-actions" className="block font-semibold text-slate-700">
                Action Items Checklist
              </label>
              <textarea
                id="session-actions"
                required
                rows={3}
                value={actionItems}
                onChange={(e) => setActionItems(e.target.value)}
                placeholder="1. Complete coursework draft&#10;2. Meet teaching assistant&#10;3. Submit weekly update"
                className="mt-1 block w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 bg-white"
              />
            </div>

            <div>
              <label htmlFor="session-followup" className="block font-semibold text-slate-700">
                Target Follow-Up Date
              </label>
              <input
                id="session-followup"
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="mt-1 block w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 bg-white"
              />
            </div>

            <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200/80 flex items-start gap-2.5">
              <input
                type="checkbox"
                id="private-note-toggle"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
              />
              <label htmlFor="private-note-toggle" className="text-[11px] text-amber-900 cursor-pointer">
                <span className="font-bold flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Private Note (Confidential)
                </span>
                Restricts visibility strictly to faculty mentors and academic coordinators.
              </label>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none transition-colors shadow-2xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Record Session Note</span>
            </button>
          </form>
        </div>

        {/* History List: Notes & Active Escalations */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Escalations Section */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Open Institutional Escalations
                </h2>
              </div>
              <span className="text-[11px] font-semibold text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                {escalations.length} Active Flags
              </span>
            </div>

            <div className="mt-4 divide-y divide-slate-100">
              {escalations.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-500">
                  No active escalations lodged under your account.
                </div>
              ) : (
                escalations.map((esc) => (
                  <div key={esc.id} className="py-3 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900">{esc.studentName}</span>
                        <StatusBadge type="escalation" value={esc.status} />
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                          {esc.category}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {esc.createdAt.slice(0, 10)}
                      </span>
                    </div>

                    <p className="text-slate-700 bg-rose-50/40 p-2.5 rounded-lg border border-rose-100 leading-relaxed">
                      {esc.description}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                      <span>Assigned to: <strong className="text-slate-700">{esc.escalatedToRole}</strong></span>
                      {esc.resolutionNotes && (
                        <span className="text-emerald-800 font-medium">Resolution: {esc.resolutionNotes}</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Session Notes Archive */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Consultation History Records
              </h2>
              <span className="text-[11px] text-slate-500">{notes.length} Records</span>
            </div>

            <div className="mt-4 divide-y divide-slate-100">
              {notes.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">No session notes recorded yet.</div>
              ) : (
                notes.map((n) => (
                  <div key={n.id} className="py-4 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{n.studentName}</span>
                        <StatusBadge type="progress" value={n.progressStatus} />
                        {n.isPrivate && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                            CONFIDENTIAL
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {n.createdAt.slice(0, 10)}
                      </span>
                    </div>

                    <p className="text-slate-700 leading-relaxed">{n.discussionNotes}</p>

                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-slate-700 text-[11px] whitespace-pre-line">
                      <span className="font-semibold text-slate-900 block mb-0.5">Action Items:</span>
                      {n.actionItems}
                    </div>

                    {n.followUpDate && (
                      <p className="text-[11px] text-slate-500">
                        Follow-up scheduled target: <span className="font-semibold text-slate-700">{n.followUpDate}</span>
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Raise Escalation Modal */}
      <Modal
        isOpen={isEscalateOpen}
        onClose={() => setIsEscalateOpen(false)}
        title="Raise Student Support Escalation"
        description="Escalate severe academic, attendance, or wellbeing distress for formal committee review"
      >
        <form onSubmit={handleRaiseEscalation} className="space-y-4 text-xs">
          <div>
            <label htmlFor="escalate-student" className="block font-semibold text-slate-700">
              Target Mentee
            </label>
            <select
              id="escalate-student"
              value={escalateStudentUserId}
              onChange={(e) => setEscalateStudentUserId(e.target.value)}
              className="mt-1 block w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 bg-white"
            >
              {students.map((s) => (
                <option key={s.userId} value={s.userId}>
                  {s.fullName} ({s.studentId})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="escalate-category" className="block font-semibold text-slate-700">
                Escalation Category
              </label>
              <select
                id="escalate-category"
                value={escalateCategory}
                onChange={(e) => setEscalateCategory(e.target.value as EscalationCategory)}
                className="mt-1 block w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 bg-white"
              >
                <option value={EscalationCategory.ACADEMIC}>Academic Failure / Deficit</option>
                <option value={EscalationCategory.ATTENDANCE}>Chronic Absenteeism</option>
                <option value={EscalationCategory.WELLBEING}>Mental Wellbeing / Personal</option>
                <option value={EscalationCategory.DISCIPLINARY}>Disciplinary Infraction</option>
                <option value={EscalationCategory.FINANCIAL}>Financial Distress</option>
              </select>
            </div>

            <div>
              <label htmlFor="escalate-to-role" className="block font-semibold text-slate-700">
                Escalate To
              </label>
              <select
                id="escalate-to-role"
                value={escalateRole}
                onChange={(e) => setEscalateRole(e.target.value as EscalationRole)}
                className="mt-1 block w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 bg-white"
              >
                <option value={EscalationRole.COORDINATOR}>Faculty Coordinator</option>
                <option value={EscalationRole.COUNSELOR}>Student Counseling Center</option>
                <option value={EscalationRole.HEAD_OF_DEPARTMENT}>Head of Department</option>
                <option value={EscalationRole.DEAN}>Dean of Faculty</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="escalate-desc" className="block font-semibold text-slate-700">
              Issue Summary & Observations
            </label>
            <textarea
              id="escalate-desc"
              required
              rows={4}
              value={escalateDescription}
              onChange={(e) => setEscalateDescription(e.target.value)}
              placeholder="State observations, timeline of concerns, and recommended support intervention..."
              className="mt-1 block w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 bg-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEscalateOpen(false)}
              className="px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 focus-visible:ring-2 focus-visible:ring-rose-950 focus-visible:outline-none shadow-2xs"
            >
              Submit Escalation
            </button>
          </div>
        </form>
      </Modal>

      {/* Longitudinal Student History Dossier Report Modal */}
      <StudentHistoryReportModal
        isOpen={Boolean(historyReportStudent)}
        onClose={() => setHistoryReportStudent(null)}
        student={historyReportStudent}
      />
    </div>
  );
}

export default function MentorSessionsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-xs text-slate-500">Loading session records...</div>}>
      <SessionsContent />
    </Suspense>
  );
}
