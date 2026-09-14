'use client';

import React, { useState, useEffect, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { mockStore } from '@/lib/mockStore';
import { StudentProfileResponse, Role } from '@/types';
import { StatusBadge } from '@/components/common/StatusBadge';
import {
  Printer,
  Download,
  X,
  Lock,
  AlertTriangle,
  GraduationCap,
  Building,
  CheckCircle2,
} from 'lucide-react';

const emptySubscribe = () => () => {};

interface StudentHistoryReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentProfileResponse | null;
}

export const StudentHistoryReportModal: React.FC<StudentHistoryReportModalProps> = ({
  isOpen,
  onClose,
  student,
}) => {
  const [includeConfidential, setIncludeConfidential] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  const isClient = useSyncExternalStore(emptySubscribe, () => true, () => false);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('report-modal-open');
    } else {
      document.body.classList.remove('report-modal-open');
    }
    return () => {
      document.body.classList.remove('report-modal-open');
    };
  }, [isOpen]);

  if (!isOpen || !student || !isClient) return null;

  // Retrieve student's session notes
  const allNotes = mockStore.getSessionNotes(undefined, Role.COORDINATOR);
  const studentNotes = allNotes
    .filter((n) => n.studentUserId === student.userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Filter notes based on confidentiality toggle
  const visibleNotes = includeConfidential
    ? studentNotes
    : studentNotes.filter((n) => !n.isPrivate);

  // Retrieve student's consultation meetings
  const allMeetings = mockStore.getMeetings(Role.ADMIN, 0);
  const studentMeetings = allMeetings
    .filter((m) => m.studentUserId === student.userId)
    .sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime());

  // Retrieve student's escalations
  const allEscalations = mockStore.getEscalations();
  const studentEscalations = allEscalations
    .filter((e) => e.studentUserId === student.userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Attendance & Examination Eligibility metrics
  const lectureRate = student.attendanceRate ?? 85;
  const labRate = student.labAttendanceRate ?? 90;
  const consecutiveAbsences = student.consecutiveAbsences ?? 0;

  let examEligibility = 'ELIGIBLE FOR EXAMS';
  let examEligibilityClass = 'bg-emerald-50 text-emerald-800 border-emerald-300';
  if (lectureRate < 75) {
    examEligibility = 'DEBARRED / INELIGIBLE (<75%)';
    examEligibilityClass = 'bg-rose-50 text-rose-800 border-rose-300';
  } else if (lectureRate < 80 || consecutiveAbsences >= 3) {
    examEligibility = 'CONDITIONAL WARNING (75%–79%)';
    examEligibilityClass = 'bg-amber-50 text-amber-800 border-amber-300';
  }

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    let csv = `SMMS LONGITUDINAL STUDENT HISTORY AUDIT REPORT\n`;
    csv += `Student Name,"${student.fullName}"\n`;
    csv += `Student ID,"${student.studentId}"\n`;
    csv += `Department,"${student.department}"\n`;
    csv += `Degree Program,"${student.degree}"\n`;
    csv += `Cohort Batch,"${student.batch}"\n`;
    csv += `Intake,"${student.intake}"\n`;
    csv += `Current CGPA,${student.currentGpa.toFixed(2)}\n`;
    csv += `Academic Risk Status,"${student.riskStatus}"\n`;
    csv += `Progress Rating,"${student.latestProgressStatus || 'ON_TRACK'}"\n`;
    csv += `Assigned Mentor,"${student.allocatedMentorName || 'Unassigned'}"\n`;
    csv += `Lecture Attendance Rate,"${lectureRate}%"\n`;
    csv += `Practical Lab Attendance Rate,"${labRate}%"\n`;
    csv += `Consecutive Absences,${consecutiveAbsences}\n`;
    csv += `Examination Standing,"${examEligibility}"\n`;
    csv += `Report Generated Date,"${new Date().toISOString()}"\n`;
    csv += `Confidential Notes Included,"${includeConfidential ? 'YES' : 'NO (REDACTED)'}"\n\n`;

    // Session Notes Section
    csv += `SECTION 1: CHRONOLOGICAL MENTORING SESSION NOTES\n`;
    csv += `Date,Progress Evaluation,Confidentiality,Target Follow-Up,Discussion Notes,Action Items Checklist\n`;
    visibleNotes.forEach((n) => {
      csv += `"${n.createdAt.slice(0, 10)}","${n.progressStatus}","${n.isPrivate ? 'CONFIDENTIAL' : 'PUBLIC'}","${n.followUpDate || 'None'}","${n.discussionNotes.replace(/"/g, '""')}","${n.actionItems.replace(/"/g, '""')}"\n`;
    });
    csv += `\n`;

    // Meetings Section
    csv += `SECTION 2: CONSULTATION MEETINGS LOG\n`;
    csv += `Date,Time,Mode,Topic,Attendance Outcome,Status,Location/Link\n`;
    studentMeetings.forEach((m) => {
      csv += `"${m.scheduledDate}","${m.scheduledTime}","${m.mode}","${m.topic}","${m.attendanceStatus}","${m.status}","${m.location || m.meetingLink || 'N/A'}"\n`;
    });
    csv += `\n`;

    // Escalations Section
    csv += `SECTION 3: INSTITUTIONAL ESCALATIONS & DEFICIT FLAGS\n`;
    csv += `Incident ID,Category,Date Logged,Reported By,Status,Incident Details,Resolution Notes\n`;
    studentEscalations.forEach((e) => {
      csv += `${e.id},"${e.category}","${e.createdAt}","${e.mentorName || 'Faculty'}","${e.status}","${e.description.replace(/"/g, '""')}","${(e.resolutionNotes || '').replace(/"/g, '""')}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `student_history_${student.studentId}_${student.fullName.toLowerCase().replace(/\s+/g, '_')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setToastMessage('Student history spreadsheet downloaded successfully.');
    setTimeout(() => setToastMessage(''), 3500);
  };

  return createPortal(
    <div id="report-modal-portal">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="student-report-title"
        className="report-backdrop fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 p-2 sm:p-4 md:p-6 flex items-start justify-center"
      >
        <div className="report-card relative w-full max-w-5xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-4">
        {/* Action Header Controls (Hidden on Print) */}
        <div className="no-print sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-indigo-400" />
            <div>
              <h2 id="student-report-title" className="text-sm font-bold tracking-tight">
                Comprehensive Student History Dossier
              </h2>
              <p className="text-[11px] text-slate-400">
                {student.fullName} ({student.studentId}) • Batch {student.batch}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Confidential Toggle */}
            <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs cursor-pointer hover:bg-slate-750">
              <input
                type="checkbox"
                checked={includeConfidential}
                onChange={(e) => setIncludeConfidential(e.target.checked)}
                className="rounded border-slate-600 text-indigo-500 focus:ring-indigo-400"
              />
              <span className="flex items-center gap-1 text-[11px] text-slate-200 font-medium">
                <Lock className="w-3 h-3 text-amber-400" />
                Include Confidential Notes
              </span>
            </label>

            {/* Export CSV Button */}
            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors border border-slate-700 focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:outline-none"
            >
              <Download className="w-3.5 h-3.5 text-slate-300" />
              <span>Export CSV</span>
            </button>

            {/* Print / Save PDF Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors shadow-2xs focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:outline-none"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close report view"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:outline-none"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Toast Feedback */}
        {toastMessage && (
          <div
            role="status"
            className="no-print mx-6 mt-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Printable Document Body */}
        <div className="printable-report-area p-6 sm:p-8 space-y-6 text-slate-900 bg-white">
          {/* Official Academic Header */}
          <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Building className="w-6 h-6 text-slate-800 shrink-0" />
                <div>
                  <span className="text-xs uppercase tracking-widest font-extrabold text-slate-600 block">
                    National University of Sciences & Technology
                  </span>
                  <h1 className="text-lg font-bold tracking-tight text-slate-950">
                    Faculty of Computing & Information Systems
                  </h1>
                </div>
              </div>
              <p className="text-xs text-slate-600 mt-2 font-medium">
                Student Mentoring Management System (SMMS) • Official Longitudinal Dossier
              </p>
            </div>

            <div className="text-right sm:border-l sm:border-slate-200 sm:pl-4 text-xs space-y-0.5">
              <div className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
                Dossier Reference
              </div>
              <div className="font-mono font-bold text-slate-900">
                HST-{student.studentId}-{new Date().getFullYear()}
              </div>
              <div className="text-[11px] text-slate-500">
                Issued: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              </div>
              <div className="text-[10px] text-slate-400">
                Confidentiality: {includeConfidential ? 'RESTRICTED FACULTY ACCESS' : 'PUBLIC SUMMARY'}
              </div>
            </div>
          </div>

          {/* Section 1: Mentee Profile & Academic Status Card */}
          <div className="print-page-break-inside-avoid space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1">
              1. Student Academic & Enrollment Profile
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Full Name</span>
                <span className="font-bold text-slate-900">{student.fullName}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Student ID Number</span>
                <span className="font-mono font-bold text-slate-900">{student.studentId}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Academic Department</span>
                <span className="font-semibold text-slate-800">{student.department}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Cohort Batch & Intake</span>
                <span className="font-semibold text-slate-800">Batch {student.batch} • {student.intake}</span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Degree Program</span>
                <span className="font-semibold text-slate-800">{student.degree}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Cumulative GPA</span>
                <span className="text-sm font-bold text-slate-950">{student.currentGpa.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">System Risk Status</span>
                <div className="mt-0.5">
                  <StatusBadge type="risk" value={student.riskStatus} />
                </div>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Progress Assessment</span>
                <div className="mt-0.5">
                  <StatusBadge type="progress" value={student.latestProgressStatus || 'ON_TRACK'} />
                </div>
              </div>

              <div className="sm:col-span-2">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Assigned Faculty Mentor</span>
                <span className="font-bold text-slate-900">{student.allocatedMentorName || 'Unassigned'}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Parent / Guardian Contact</span>
                <span className="text-slate-800 font-medium">
                  {student.parentName || 'N/A'} {student.parentPhone ? `(${student.parentPhone})` : ''}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Emergency Contact</span>
                <span className="text-slate-800 font-medium">
                  {student.emergencyContactName || 'N/A'} {student.emergencyContactPhone ? `(${student.emergencyContactPhone})` : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Attendance & Examination Standing */}
          <div className="print-page-break-inside-avoid space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1 flex items-center justify-between">
              <span>2. Official Attendance & Examination Eligibility Standing</span>
              <span className="text-[11px] font-normal text-slate-500">
                Minimum Statutory Threshold: 80% Attendance Required for Semester Finals
              </span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  Coursework Lecture Attendance
                </span>
                <div className="flex items-baseline gap-2">
                  <span className={`text-xl font-bold ${lectureRate < 75 ? 'text-rose-600' : lectureRate < 80 ? 'text-amber-600' : 'text-emerald-700'}`}>
                    {lectureRate}%
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {lectureRate >= 80 ? 'Compliant' : 'Deficit'}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  Practical Lab Attendance
                </span>
                <div className="flex items-baseline gap-2">
                  <span className={`text-xl font-bold ${labRate < 75 ? 'text-rose-600' : labRate < 80 ? 'text-amber-600' : 'text-emerald-700'}`}>
                    {labRate}%
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {labRate >= 80 ? 'Compliant' : 'Deficit'}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  Consecutive Absences
                </span>
                <div className="flex items-baseline gap-2">
                  <span className={`text-xl font-bold ${consecutiveAbsences >= 3 ? 'text-rose-600' : 'text-slate-900'}`}>
                    {consecutiveAbsences}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {consecutiveAbsences >= 3 ? 'Critical Warning' : 'Within Bounds'}
                  </span>
                </div>
              </div>

              <div className={`p-3.5 rounded-xl border ${examEligibilityClass} space-y-1`}>
                <span className="text-[10px] uppercase font-bold opacity-80 block">
                  Examination Eligibility Status
                </span>
                <span className="text-xs font-bold block leading-tight">
                  {examEligibility}
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Chronological Mentoring Consultation Notes */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                3. Chronological Mentoring Consultation History ({visibleNotes.length} Logged Sessions)
              </h3>
              {!includeConfidential && (
                <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Confidential notes are currently redacted from this view
                </span>
              )}
            </div>

            {visibleNotes.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 text-center">
                No session notes recorded for this student under the selected confidentiality scope.
              </div>
            ) : (
              <div className="space-y-3">
                {visibleNotes.map((note, idx) => (
                  <div
                    key={note.id}
                    className={`print-page-break-inside-avoid p-4 rounded-xl border text-xs space-y-2 ${
                      note.isPrivate
                        ? 'bg-amber-50/40 border-amber-300'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">Session #{visibleNotes.length - idx}</span>
                        <span className="text-slate-400">•</span>
                        <span className="font-semibold text-slate-700">{note.createdAt.slice(0, 10)}</span>
                        <StatusBadge type="progress" value={note.progressStatus} />
                        {note.isPrivate && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-900 border border-amber-300 flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" />
                            CONFIDENTIAL / RESTRICTED FACULTY RECORD
                          </span>
                        )}
                      </div>
                      {note.followUpDate && (
                        <span className="text-[11px] text-slate-500">
                          Target Follow-Up: <strong className="text-slate-700">{note.followUpDate}</strong>
                        </span>
                      )}
                    </div>

                    <div className="text-slate-800 leading-relaxed whitespace-pre-line">
                      <strong className="block text-[11px] uppercase font-bold text-slate-500 mb-0.5">
                        Discussion Summary & Academic Guidance:
                      </strong>
                      {note.discussionNotes}
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50/80 border border-slate-200 text-slate-800 text-[11px] whitespace-pre-line">
                      <strong className="block text-[11px] uppercase font-bold text-slate-700 mb-1">
                        Mandated Action Items & Next Steps:
                      </strong>
                      {note.actionItems}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 4: Scheduled Consultation Meetings Log */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1">
              4. Consultation Meetings & Engagement Log ({studentMeetings.length} Records)
            </h3>

            {studentMeetings.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 text-center">
                No scheduled consultation meetings recorded in registry.
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-[11px] font-semibold text-slate-700 uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th scope="col" className="px-4 py-2.5">Date & Time</th>
                      <th scope="col" className="px-4 py-2.5">Mode / Venue</th>
                      <th scope="col" className="px-4 py-2.5">Topic</th>
                      <th scope="col" className="px-4 py-2.5">Attendance Status</th>
                      <th scope="col" className="px-4 py-2.5">Meeting Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {studentMeetings.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50/60">
                        <td className="px-4 py-2.5 font-semibold text-slate-900">
                          {m.scheduledDate} at {m.scheduledTime}
                        </td>
                        <td className="px-4 py-2.5">
                          <span className="font-medium text-slate-800">{m.mode}</span>
                          <span className="text-[11px] text-slate-500 block truncate max-w-xs">
                            {m.location || m.meetingLink || 'Campus Office'}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 font-medium text-slate-800">
                          {m.topic}
                        </td>
                        <td className="px-4 py-2.5">
                          <StatusBadge type="attendance" value={m.attendanceStatus} />
                        </td>
                        <td className="px-4 py-2.5">
                          <StatusBadge type="meetingStatus" value={m.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Section 5: Institutional Escalations & Interventions */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1">
              5. Official Interventions & Committee Escalations ({studentEscalations.length} Active Records)
            </h3>

            {studentEscalations.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 text-center">
                Clean Record: No academic or behavioral escalations logged for this mentee.
              </div>
            ) : (
              <div className="space-y-3">
                {studentEscalations.map((esc) => (
                  <div
                    key={esc.id}
                    className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/30 text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                        <span className="font-bold text-slate-900">Notice #{esc.id}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-100 text-rose-800 border border-rose-200">
                          {esc.category}
                        </span>
                        <StatusBadge type="escalation" value={esc.status} />
                      </div>
                      <span className="text-[11px] text-slate-500">
                        Logged: {esc.createdAt.slice(0, 10)} by {esc.mentorName}
                      </span>
                    </div>

                    <p className="text-slate-800 leading-relaxed">{esc.description}</p>

                    {esc.resolutionNotes && (
                      <div className="p-2.5 rounded-lg bg-white border border-emerald-200 text-emerald-900 text-[11px]">
                        <strong>Committee Resolution: </strong>
                        {esc.resolutionNotes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 6: Official Faculty Endorsement & Signatures */}
          <div className="print-page-break-inside-avoid pt-6 border-t-2 border-slate-900 grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs">
            <div className="space-y-6">
              <div>
                <span className="font-bold text-slate-900 block">Assigned Faculty Mentor Verification:</span>
                <span className="text-[11px] text-slate-500 block">
                  I hereby endorse that the above consultation logs, academic records, and attendance assessments represent a true and accurate record of the mentee.
                </span>
              </div>
              <div className="pt-8 border-b border-slate-400">
                <span className="text-[11px] text-slate-600">Faculty Mentor Signature & Date</span>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <span className="font-bold text-slate-900 block">Dean / Coordinator Academic Approval:</span>
                <span className="text-[11px] text-slate-500 block">
                  Certified for official faculty review, examination clearance, and student progression standing.
                </span>
              </div>
              <div className="pt-8 border-b border-slate-400">
                <span className="text-[11px] text-slate-600">Dean of Academic Affairs / Department Head Seal</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>,
  document.body
);
};
