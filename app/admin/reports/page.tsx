'use client';

import React, { useState } from 'react';
import { mockStore } from '@/lib/mockStore';
import { InstitutionalAttendanceReportModal } from '@/components/reports/InstitutionalAttendanceReportModal';
import {
  FolderDown,
  FileSpreadsheet,
  FileText,
  Download,
  CheckCircle2,
  Calendar,
  Building,
  Printer,
  CalendarCheck,
} from 'lucide-react';

export default function AdminReportsPage() {
  const [department, setDepartment] = useState('ALL');
  const [batch, setBatch] = useState('21.1');
  const [attendanceFilter, setAttendanceFilter] = useState<'ALL' | 'GOOD' | 'BORDERLINE' | 'CRITICAL'>('ALL');
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const triggerDownload = (filename: string, content: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
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

  const exportAttendanceCSV = () => {
    const cohortStudents = mockStore.getStudents().filter((s) => {
      const matchDept = department === 'ALL' || s.department === department;
      const matchBatch = !batch || s.batch === batch;
      const rate = s.attendanceRate ?? 85;
      let matchAttendance = true;
      if (attendanceFilter === 'GOOD') matchAttendance = rate >= 80;
      else if (attendanceFilter === 'BORDERLINE') matchAttendance = rate >= 75 && rate < 80;
      else if (attendanceFilter === 'CRITICAL') matchAttendance = rate < 75;
      return matchDept && matchBatch && matchAttendance;
    });

    let csv = `FACULTY ATTENDANCE & EXAMINATION ELIGIBILITY REGISTRY\n`;
    csv += `Department,"${department}"\n`;
    csv += `Batch,"${batch}"\n`;
    csv += `Attendance Filter,"${attendanceFilter}"\n`;
    csv += `Export Timestamp,"${new Date().toISOString()}"\n\n`;

    csv += `Student ID,Full Name,Department,Batch,Intake,Coursework Attendance %,Lab Attendance %,Consecutive Absences,Compliance Tier,Examination Status,Assigned Mentor\n`;
    cohortStudents.forEach((s) => {
      const lecture = s.attendanceRate ?? 85;
      const lab = s.labAttendanceRate ?? 90;
      const absences = s.consecutiveAbsences ?? 0;
      let status = 'ELIGIBLE';
      let band = 'Good (≥80%)';
      if (lecture < 75) {
        status = 'DEBARRED / INELIGIBLE';
        band = 'Critical (<75%)';
      } else if (lecture < 80 || absences >= 3) {
        status = 'CONDITIONAL REVIEW';
        band = 'Borderline (75%–79%)';
      }
      csv += `"${s.studentId}","${s.fullName}","${s.department}","${s.batch}","${s.intake}",${lecture},${lab},${absences},"${band}","${status}","${s.allocatedMentorName || 'Unassigned'}"\n`;
    });

    const deptSlug = department === 'ALL' ? 'all_depts' : department.toLowerCase().replace(/\s+/g, '_');
    triggerDownload(`attendance_audit_${deptSlug}_batch_${batch}_tier_${attendanceFilter.toLowerCase()}.csv`, csv, 'text/csv;charset=utf-8;');
  };

  const exportStudentProgressCSV = () => {
    const students = mockStore.getStudents().filter((s) => {
      const matchDept = department === 'ALL' || s.department === department;
      const matchBatch = !batch || s.batch === batch;
      return matchDept && matchBatch;
    });

    let csv = 'Student ID,Full Name,Department,Batch,GPA,Risk Rating,Progress Assessment\n';
    students.forEach((s) => {
      csv += `"${s.studentId}","${s.fullName}","${s.department}","${s.batch}",${s.currentGpa},"${s.riskStatus}","${s.latestProgressStatus || 'ON_TRACK'}"\n`;
    });

    const deptSlug = department === 'ALL' ? 'all_depts' : department.toLowerCase().replace(/\s+/g, '_');
    triggerDownload(`student_progress_${deptSlug}_batch_${batch}.csv`, csv, 'text/csv;charset=utf-8;');
  };

  const exportAllocationsCSV = () => {
    const allocs = mockStore.getAllocations().filter((a) => {
      const matchDept = department === 'ALL' || a.department === department;
      const matchBatch = !batch || a.batch === batch;
      return matchDept && matchBatch;
    });

    let csv = 'Student ID,Student Name,Mentor Name,Department,Batch,Allocation Type,Status,Allocated Date\n';
    allocs.forEach((a) => {
      csv += `"${a.studentIdNumber}","${a.studentName}","${a.mentorName}","${a.department}","${a.batch}","${a.allocationType}","${a.status}","${a.allocatedAt}"\n`;
    });

    const deptSlug = department === 'ALL' ? 'all_depts' : department.toLowerCase().replace(/\s+/g, '_');
    triggerDownload(`allocations_${deptSlug}_batch_${batch}.csv`, csv, 'text/csv;charset=utf-8;');
  };

  const exportEscalationsCSV = () => {
    const escs = mockStore.getEscalations().filter((e) => {
      const matchBatch = !batch || e.studentBatch === batch;
      return matchBatch;
    });

    let csv = 'ID,Student Name,Batch,Mentor Name,Category,Status,Description,Resolution Notes,Created At\n';
    escs.forEach((e) => {
      csv += `${e.id},"${e.studentName}","${e.studentBatch || ''}","${e.mentorName || ''}","${e.category}","${e.status}","${e.description}","${e.resolutionNotes || ''}","${e.createdAt}"\n`;
    });

    triggerDownload(`escalations_audit_batch_${batch}.csv`, csv, 'text/csv;charset=utf-8;');
  };

  const exportEscalationsSummary = () => {
    const escs = mockStore.getEscalations().filter((e) => {
      const matchBatch = !batch || e.studentBatch === batch;
      return matchBatch;
    });

    let textDoc = 'SMMS INSTITUTIONAL ESCALATIONS AUDIT SUMMARY\n';
    textDoc += '==================================================\n';
    textDoc += `Cohort Batch Filter: ${batch} | Department: ${department}\n`;
    textDoc += `Generated: ${new Date().toISOString()}\n`;
    textDoc += '==================================================\n\n';

    escs.forEach((e) => {
      textDoc += `Incident #${e.id} [${e.status}] - Category: ${e.category}\n`;
      textDoc += `Student: ${e.studentName} (Batch: ${e.studentBatch}) | Reporter: ${e.mentorName}\n`;
      textDoc += `Description:\n${e.description}\n`;
      if (e.resolutionNotes) {
        textDoc += `Resolution Outcome: ${e.resolutionNotes}\n`;
      }
      textDoc += '--------------------------------------------------\n';
    });

    triggerDownload(`escalations_audit_summary_batch_${batch}.txt`, textDoc, 'text/plain');
  };

  // Pre-calculate attendance stats for the current filter
  const cohortStudents = mockStore.getStudents().filter((s) => {
    const matchDept = department === 'ALL' || s.department === department;
    const matchBatch = !batch || s.batch === batch;
    return matchDept && matchBatch;
  });
  const goodAttendanceCount = cohortStudents.filter((s) => (s.attendanceRate ?? 85) >= 80).length;
  const borderlineAttendanceCount = cohortStudents.filter((s) => {
    const r = s.attendanceRate ?? 85;
    return r >= 75 && r < 80;
  }).length;
  const criticalAttendanceCount = cohortStudents.filter((s) => (s.attendanceRate ?? 85) < 75).length;

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
          Official Reports & Data Exports
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Generate filtered attendance registries, CSV tables, and print-ready audit dossiers for faculty boards and examination clearance
        </p>
      </div>

      {/* Filter Parameters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Building className="w-4 h-4 text-slate-400 shrink-0" />
            <label htmlFor="report-dept" className="font-semibold text-slate-700 whitespace-nowrap">
              Faculty / Dept:
            </label>
            <select
              id="report-dept"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 bg-white"
            >
              <option value="ALL">All University Departments</option>
              <option value="Software Engineering">Software Engineering</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Data Science">Data Science</option>
            </select>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
            <label htmlFor="report-batch" className="font-semibold text-slate-700 whitespace-nowrap">
              Cohort Batch:
            </label>
            <select
              id="report-batch"
              value={batch}
              onChange={(e) => setBatch(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 bg-white"
            >
              <option value="21.1">Batch 21.1 (Final Year)</option>
              <option value="22.1">Batch 22.1 (Year 3)</option>
              <option value="23.1">Batch 23.1 (Year 2)</option>
            </select>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <CalendarCheck className="w-4 h-4 text-slate-400 shrink-0" />
            <label htmlFor="report-attendance-tier" className="font-semibold text-slate-700 whitespace-nowrap">
              Attendance Tier:
            </label>
            <select
              id="report-attendance-tier"
              value={attendanceFilter}
              onChange={(e) => setAttendanceFilter(e.target.value as 'ALL' | 'GOOD' | 'BORDERLINE' | 'CRITICAL')}
              className="px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 bg-white"
            >
              <option value="ALL">All Attendance Levels ({cohortStudents.length})</option>
              <option value="GOOD">Good Attendance (≥80% - {goodAttendanceCount})</option>
              <option value="BORDERLINE">Borderline Warning (75–79% - {borderlineAttendanceCount})</option>
              <option value="CRITICAL">Critical Ineligible (&lt;75% - {criticalAttendanceCount})</option>
            </select>
          </div>
        </div>
      </div>

      {/* Export Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Student Attendance & Exam Eligibility Registry (NEW) */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">Student Attendance & Examination Eligibility Registry</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
                Official Audit
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Coursework & lab attendance registry with statutory 80% examination clearance compliance, consecutive absences, and multi-criteria filters for {department} (Batch {batch}).
            </p>

            {/* Quick stats chips */}
            <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
              <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200">
                <span className="text-base font-bold text-emerald-800">{goodAttendanceCount}</span>
                <span className="text-[10px] text-emerald-700 block font-medium">Eligible (≥80%)</span>
              </div>
              <div className="p-2 rounded-lg bg-amber-50 border border-amber-200">
                <span className="text-base font-bold text-amber-800">{borderlineAttendanceCount}</span>
                <span className="text-[10px] text-amber-700 block font-medium">Borderline (75-79%)</span>
              </div>
              <div className="p-2 rounded-lg bg-rose-50 border border-rose-200">
                <span className="text-base font-bold text-rose-800">{criticalAttendanceCount}</span>
                <span className="text-[10px] text-rose-700 block font-medium">Ineligible (&lt;75%)</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={exportAttendanceCSV}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Filtered Attendance CSV</span>
            </button>
            <button
              type="button"
              onClick={() => setIsAttendanceModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Generate Printable / PDF Audit Dossier</span>
            </button>
          </div>
        </div>

        {/* Card 2: Student Progress Report */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">Student Progress Registry</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Complete matrix of student GPA, risk status, attended mentoring sessions, and latest faculty evaluations for {department} (Batch {batch}).
            </p>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={exportStudentProgressCSV}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Progress CSV</span>
            </button>
          </div>
        </div>

        {/* Card 3: Mentor Allocation Matrix */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
              <FolderDown className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">Mentor Allocation Matrix</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Official register of active, transferred, and historical student-to-mentor pairings filtered for {department} (Batch {batch}).
            </p>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={exportAllocationsCSV}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Allocations CSV</span>
            </button>
          </div>
        </div>

        {/* Card 4: Institutional Escalation Log */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700">
              <FileText className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">Escalation Audit Log</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Official audit log of academic deficit notices, attendance flags, and committee intervention records for Batch {batch}.
            </p>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={exportEscalationsCSV}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Escalations CSV</span>
            </button>
            <button
              type="button"
              onClick={exportEscalationsSummary}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Download Printable Text Summary</span>
            </button>
          </div>
        </div>
      </div>

      {/* Institutional Attendance Report Modal */}
      <InstitutionalAttendanceReportModal
        isOpen={isAttendanceModalOpen}
        onClose={() => setIsAttendanceModalOpen(false)}
        departmentFilter={department}
        batchFilter={batch}
        attendanceFilter={attendanceFilter}
        onAttendanceFilterChange={(tier) => setAttendanceFilter(tier)}
        onDepartmentFilterChange={(dept) => setDepartment(dept)}
        onBatchFilterChange={(b) => setBatch(b)}
      />
    </div>
  );
}

