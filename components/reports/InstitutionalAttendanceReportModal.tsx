'use client';

import React, { useState, useEffect, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { mockStore } from '@/lib/mockStore';
import { StudentProfileResponse } from '@/types';
import {
  Printer,
  Download,
  X,
  Building,
  CheckCircle2,
  CalendarCheck,
} from 'lucide-react';

const emptySubscribe = () => () => {};

interface InstitutionalAttendanceReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  departmentFilter: string;
  batchFilter: string;
  attendanceFilter: 'ALL' | 'GOOD' | 'BORDERLINE' | 'CRITICAL';
  onAttendanceFilterChange?: (tier: 'ALL' | 'GOOD' | 'BORDERLINE' | 'CRITICAL') => void;
  onDepartmentFilterChange?: (dept: string) => void;
  onBatchFilterChange?: (batch: string) => void;
}

export const InstitutionalAttendanceReportModal: React.FC<InstitutionalAttendanceReportModalProps> = ({
  isOpen,
  onClose,
  departmentFilter,
  batchFilter,
  attendanceFilter,
  onAttendanceFilterChange,
  onDepartmentFilterChange,
  onBatchFilterChange,
}) => {
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

  if (!isOpen || !isClient) return null;

  const allStudents = mockStore.getStudents();

  // Cohort baseline students (before attendance filter) for statistics
  const cohortStudents = allStudents.filter((s) => {
    const matchDept = departmentFilter === 'ALL' || s.department === departmentFilter;
    const matchBatch = !batchFilter || s.batch === batchFilter;
    return matchDept && matchBatch;
  });

  // Calculate stats
  const totalMonitored = cohortStudents.length;
  const goodCount = cohortStudents.filter((s) => (s.attendanceRate ?? 85) >= 80).length;
  const borderlineCount = cohortStudents.filter((s) => {
    const r = s.attendanceRate ?? 85;
    return r >= 75 && r < 80;
  }).length;
  const criticalCount = cohortStudents.filter((s) => (s.attendanceRate ?? 85) < 75).length;

  const averageAttendance = totalMonitored > 0
    ? (cohortStudents.reduce((acc, s) => acc + (s.attendanceRate ?? 85), 0) / totalMonitored).toFixed(1)
    : '0.0';

  const averageLabAttendance = totalMonitored > 0
    ? (cohortStudents.reduce((acc, s) => acc + (s.labAttendanceRate ?? 90), 0) / totalMonitored).toFixed(1)
    : '0.0';

  // Apply attendance filter
  const filteredStudents = cohortStudents.filter((s) => {
    const r = s.attendanceRate ?? 85;
    if (attendanceFilter === 'GOOD') return r >= 80;
    if (attendanceFilter === 'BORDERLINE') return r >= 75 && r < 80;
    if (attendanceFilter === 'CRITICAL') return r < 75;
    return true;
  });

  const getEligibility = (student: StudentProfileResponse) => {
    const lecture = student.attendanceRate ?? 85;
    const absences = student.consecutiveAbsences ?? 0;
    if (lecture < 75) {
      return {
        label: 'DEBARRED / INELIGIBLE',
        className: 'bg-rose-50 text-rose-800 border-rose-300',
        band: 'Critical (<75%)',
      };
    }
    if (lecture < 80 || absences >= 3) {
      return {
        label: 'CONDITIONAL REVIEW',
        className: 'bg-amber-50 text-amber-800 border-amber-300',
        band: 'Borderline (75%–79%)',
      };
    }
    return {
      label: 'EXAM ELIGIBLE',
      className: 'bg-emerald-50 text-emerald-800 border-emerald-300',
      band: 'Good (≥80%)',
    };
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    let csv = `FACULTY OF COMPUTING & INFORMATION SYSTEMS - ATTENDANCE & EXAMINATION AUDIT REPORT\n`;
    csv += `Academic Department,"${departmentFilter}"\n`;
    csv += `Cohort Batch,"${batchFilter}"\n`;
    csv += `Attendance Level Filter,"${attendanceFilter}"\n`;
    csv += `Report Generated Date,"${new Date().toISOString()}"\n`;
    csv += `Total Cohort Assessed,${totalMonitored}\n`;
    csv += `Eligible Count (≥80%),${goodCount}\n`;
    csv += `Borderline Count (75-79%),${borderlineCount}\n`;
    csv += `Critical Ineligible Count (<75%),${criticalCount}\n`;
    csv += `Cohort Mean Coursework Attendance,"${averageAttendance}%"\n`;
    csv += `Cohort Mean Lab Attendance,"${averageLabAttendance}%"\n\n`;

    csv += `Student ID,Full Name,Department,Batch,Intake,Coursework Attendance %,Lab Attendance %,Consecutive Absences,Compliance Band,Examination Standing,Assigned Mentor\n`;
    filteredStudents.forEach((s) => {
      const elig = getEligibility(s);
      csv += `"${s.studentId}","${s.fullName}","${s.department}","${s.batch}","${s.intake}",${s.attendanceRate ?? 85},${s.labAttendanceRate ?? 90},${s.consecutiveAbsences ?? 0},"${elig.band}","${elig.label}","${s.allocatedMentorName || 'Unassigned'}"\n`;
    });

    const deptSlug = departmentFilter === 'ALL' ? 'all_depts' : departmentFilter.toLowerCase().replace(/\s+/g, '_');
    const filename = `attendance_audit_${deptSlug}_batch_${batchFilter}_tier_${attendanceFilter.toLowerCase()}.csv`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setToastMessage(`Downloaded ${filename} successfully.`);
    setTimeout(() => setToastMessage(''), 3500);
  };

  return createPortal(
    <div id="report-modal-portal">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="attendance-report-title"
        className="report-backdrop fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 p-2 sm:p-4 md:p-6 flex items-start justify-center"
      >
        <div className="report-card relative w-full max-w-5xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-4">
        {/* Top Control Bar (Hidden on Print) */}
        <div className="no-print sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-indigo-400" />
            <div>
              <h2 id="attendance-report-title" className="text-sm font-bold tracking-tight">
                Institutional Attendance & Examination Eligibility Registry
              </h2>
              <p className="text-[11px] text-slate-400">
                Department: {departmentFilter} • Batch: {batchFilter} • Scope: {attendanceFilter}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Department Select in Modal */}
            {onDepartmentFilterChange && (
              <select
                value={departmentFilter}
                onChange={(e) => onDepartmentFilterChange(e.target.value)}
                aria-label="Filter department in modal"
                className="px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400"
              >
                <option value="ALL">All Depts</option>
                <option value="Software Engineering">Software Eng</option>
                <option value="Computer Science">Comp Science</option>
                <option value="Data Science">Data Science</option>
              </select>
            )}

            {/* Batch Select in Modal */}
            {onBatchFilterChange && (
              <select
                value={batchFilter}
                onChange={(e) => onBatchFilterChange(e.target.value)}
                aria-label="Filter batch in modal"
                className="px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400"
              >
                <option value="21.1">Batch 21.1</option>
                <option value="22.1">Batch 22.1</option>
                <option value="23.1">Batch 23.1</option>
              </select>
            )}

            {/* Quick tier filter buttons inside modal */}
            {onAttendanceFilterChange && (
              <div className="flex items-center rounded-lg bg-slate-800 p-0.5 border border-slate-700 text-xs">
                {(['ALL', 'GOOD', 'BORDERLINE', 'CRITICAL'] as const).map((tier) => (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => onAttendanceFilterChange(tier)}
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                      attendanceFilter === tier
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    {tier === 'ALL'
                      ? 'All'
                      : tier === 'GOOD'
                      ? 'Good (≥80%)'
                      : tier === 'BORDERLINE'
                      ? 'Borderline'
                      : 'Critical (<75%)'}
                  </button>
                ))}
              </div>
            )}

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
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors shadow-2xs focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:outline-none"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close report modal"
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

        {/* Printable Document Content */}
        <div className="printable-report-area p-6 sm:p-8 space-y-6 text-slate-900 bg-white">
          {/* Institutional Letterhead */}
          <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Building className="w-6 h-6 text-slate-800 shrink-0" />
                <div>
                  <span className="text-xs uppercase tracking-widest font-extrabold text-slate-600 block">
                    National University Faculty of Computing & Information Systems
                  </span>
                  <h1 className="text-lg font-bold tracking-tight text-slate-950">
                    Official Student Attendance & Examination Eligibility Registry
                  </h1>
                </div>
              </div>
              <p className="text-xs text-slate-600 mt-2 font-medium">
                Mandatory Academic Board & Examination Registry Clearance Document
              </p>
            </div>

            <div className="text-right sm:border-l sm:border-slate-200 sm:pl-4 text-xs space-y-0.5">
              <div className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
                Registry Audit ID
              </div>
              <div className="font-mono font-bold text-slate-900">
                ATT-{batchFilter}-{new Date().getFullYear()}
              </div>
              <div className="text-[11px] text-slate-500">
                Generated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="text-[10px] text-slate-500">
                Audited Scope: {departmentFilter === 'ALL' ? 'All Departments' : departmentFilter} (Batch {batchFilter})
              </div>
            </div>
          </div>

          {/* Section 1: Executive Cohort Attendance Summary Stats */}
          <div className="print-page-break-inside-avoid space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1">
              1. Institutional Cohort Compliance Matrix
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Assessed Cohort</span>
                <span className="text-lg font-bold text-slate-900">{totalMonitored}</span>
                <span className="text-[10px] text-slate-500 block">100% Tracked</span>
              </div>

              <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/50">
                <span className="text-[10px] uppercase font-bold text-emerald-900 block">Eligible (≥80%)</span>
                <span className="text-lg font-bold text-emerald-900">{goodCount}</span>
                <span className="text-[10px] text-emerald-800 block font-medium">
                  {totalMonitored > 0 ? ((goodCount / totalMonitored) * 100).toFixed(0) : 0}% of cohort
                </span>
              </div>

              <div className="p-3 rounded-xl border border-amber-200 bg-amber-50/50">
                <span className="text-[10px] uppercase font-bold text-amber-900 block">Borderline (75–79%)</span>
                <span className="text-lg font-bold text-amber-900">{borderlineCount}</span>
                <span className="text-[10px] text-amber-800 block font-medium">
                  {totalMonitored > 0 ? ((borderlineCount / totalMonitored) * 100).toFixed(0) : 0}% warning
                </span>
              </div>

              <div className="p-3 rounded-xl border border-rose-200 bg-rose-50/50">
                <span className="text-[10px] uppercase font-bold text-rose-900 block">Ineligible (&lt;75%)</span>
                <span className="text-lg font-bold text-rose-900">{criticalCount}</span>
                <span className="text-[10px] text-rose-800 block font-medium">
                  {totalMonitored > 0 ? ((criticalCount / totalMonitored) * 100).toFixed(0) : 0}% debarred
                </span>
              </div>

              <div className="p-3 rounded-xl border border-indigo-200 bg-indigo-50/50">
                <span className="text-[10px] uppercase font-bold text-indigo-900 block">Mean Attendance</span>
                <span className="text-lg font-bold text-indigo-950">{averageAttendance}%</span>
                <span className="text-[10px] text-indigo-800 block font-medium">
                  Lab: {averageLabAttendance}%
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Filtered Student Registry Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                2. Student Attendance & Examination Qualification Roster ({filteredStudents.length} Students)
              </h3>
              <span className="text-[11px] text-slate-500 font-medium">
                Active Filter: <strong className="text-slate-800">{attendanceFilter}</strong>
              </span>
            </div>

            {filteredStudents.length === 0 ? (
              <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 text-center">
                No students match the criteria for the selected attendance tier and department.
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-[11px] font-semibold text-slate-700 uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th scope="col" className="px-3.5 py-2.5">Student ID & Name</th>
                      <th scope="col" className="px-3.5 py-2.5">Academic Cohort</th>
                      <th scope="col" className="px-3.5 py-2.5">Coursework</th>
                      <th scope="col" className="px-3.5 py-2.5">Practical Lab</th>
                      <th scope="col" className="px-3.5 py-2.5">Absences</th>
                      <th scope="col" className="px-3.5 py-2.5">Exam Qualification</th>
                      <th scope="col" className="px-3.5 py-2.5">Assigned Faculty Mentor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredStudents.map((s) => {
                      const elig = getEligibility(s);
                      const lecture = s.attendanceRate ?? 85;
                      const lab = s.labAttendanceRate ?? 90;
                      const absences = s.consecutiveAbsences ?? 0;

                      return (
                        <tr key={s.id} className="hover:bg-slate-50/70">
                          <td className="px-3.5 py-2.5">
                            <div className="font-bold text-slate-900">{s.fullName}</div>
                            <div className="font-mono text-[11px] text-slate-500">{s.studentId}</div>
                          </td>
                          <td className="px-3.5 py-2.5">
                            <div className="font-medium text-slate-800">{s.department}</div>
                            <div className="text-[11px] text-slate-500">Batch {s.batch} • {s.intake}</div>
                          </td>
                          <td className="px-3.5 py-2.5">
                            <span className={`font-bold ${lecture < 75 ? 'text-rose-600' : lecture < 80 ? 'text-amber-600' : 'text-emerald-700'}`}>
                              {lecture}%
                            </span>
                          </td>
                          <td className="px-3.5 py-2.5">
                            <span className={`font-semibold ${lab < 75 ? 'text-rose-600' : lab < 80 ? 'text-amber-600' : 'text-slate-800'}`}>
                              {lab}%
                            </span>
                          </td>
                          <td className="px-3.5 py-2.5">
                            <span className={`font-bold ${absences >= 3 ? 'text-rose-600' : 'text-slate-800'}`}>
                              {absences} {absences === 1 ? 'day' : 'days'}
                            </span>
                          </td>
                          <td className="px-3.5 py-2.5">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${elig.className}`}>
                              {elig.label}
                            </span>
                          </td>
                          <td className="px-3.5 py-2.5">
                            <span className="font-medium text-slate-800">
                              {s.allocatedMentorName || 'Unassigned'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Section 3: Statutory Certification & Endorsements */}
          <div className="print-page-break-inside-avoid pt-6 border-t-2 border-slate-900 grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
            <div className="space-y-6">
              <div>
                <span className="font-bold text-slate-900 block">Faculty Attendance Officer:</span>
                <span className="text-[11px] text-slate-500 block">
                  Attendance records verified against biometric and laboratory logs.
                </span>
              </div>
              <div className="pt-8 border-b border-slate-400">
                <span className="text-[11px] text-slate-600">Authorized Signature & Date</span>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <span className="font-bold text-slate-900 block">Head of Academic Department:</span>
                <span className="text-[11px] text-slate-500 block">
                  Coursework compliance and examination eligibility confirmed.
                </span>
              </div>
              <div className="pt-8 border-b border-slate-400">
                <span className="text-[11px] text-slate-600">Department Head Signature</span>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <span className="font-bold text-slate-900 block">Dean of Academic Affairs:</span>
                <span className="text-[11px] text-slate-500 block">
                  Approved for official semester examination candidate scheduling.
                </span>
              </div>
              <div className="pt-8 border-b border-slate-400">
                <span className="text-[11px] text-slate-600">Dean / Registrar Official Seal</span>
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
