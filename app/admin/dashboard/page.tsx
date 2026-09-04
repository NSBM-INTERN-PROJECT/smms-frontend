'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { mockStore } from '@/lib/mockStore';
import { StatCard } from '@/components/common/StatCard';
import { StatusBadge } from '@/components/common/StatusBadge';
import {
  Users,
  GraduationCap,
  CalendarCheck2,
  AlertTriangle,
  ArrowRight,
  Filter,
  ShieldAlert,
  Search,
  CalendarCheck,
  Printer,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const summary = mockStore.getAdminDashboardSummary();
  const escalations = mockStore.getEscalations().filter((e) => e.status === 'OPEN').slice(0, 3);
  const total = summary.totalStudents || 1;

  const onTrackPct = ((summary.studentsOnTrack / total) * 100).toFixed(1);
  const attentionPct = ((summary.studentsNeedsAttention / total) * 100).toFixed(1);
  const atRiskPct = ((summary.studentsAtRisk / total) * 100).toFixed(1);
  const criticalPct = ((summary.studentsCritical / total) * 100).toFixed(1);

  // Institutional Attendance Registry State
  const [students] = useState(() => mockStore.getStudents());
  const [attendanceSearchTerm, setAttendanceSearchTerm] = useState('');
  const [attendanceDeptFilter, setAttendanceDeptFilter] = useState('');
  const [attendanceStatusFilter, setAttendanceStatusFilter] = useState<
    'ALL' | 'CRITICAL' | 'BORDERLINE' | 'COMPLIANT'
  >('ALL');

  const filteredStudents = students.filter((s) => {
    const attRate = s.attendanceRate ?? 90;
    const matchesSearch =
      s.fullName.toLowerCase().includes(attendanceSearchTerm.toLowerCase()) ||
      s.studentId.toLowerCase().includes(attendanceSearchTerm.toLowerCase());
    const matchesDept = !attendanceDeptFilter || s.department === attendanceDeptFilter;
    let matchesStatus = true;
    if (attendanceStatusFilter === 'CRITICAL') matchesStatus = attRate < 75;
    else if (attendanceStatusFilter === 'BORDERLINE')
      matchesStatus = attRate >= 75 && attRate < 80;
    else if (attendanceStatusFilter === 'COMPLIANT') matchesStatus = attRate >= 80;

    return matchesSearch && matchesDept && matchesStatus;
  });

  const totalMonitored = students.length;
  const compliantCount = students.filter((s) => (s.attendanceRate ?? 90) >= 80).length;
  const borderlineCount = students.filter(
    (s) => (s.attendanceRate ?? 90) >= 75 && (s.attendanceRate ?? 90) < 80
  ).length;
  const criticalCount = students.filter((s) => (s.attendanceRate ?? 90) < 75).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            University Mentoring Executive Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Central monitoring intelligence, cohort distribution overview, and institutional escalations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/allocations"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none transition-colors shadow-2xs"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Allocation Hub</span>
          </Link>
          <Link
            href="/admin/mentor-view"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none transition-colors"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Mentor Directory</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Cohort Allocation Rate"
          value={`${summary.allocationPercentage}%`}
          badge={`${summary.unallocatedStudents} Unallocated`}
          badgeVariant="warning"
          subtitle={`${summary.activeAllocations} of ${summary.totalStudents} Assigned`}
          icon={Users}
        />
        <StatCard
          title="Active Mentors"
          value={summary.totalMentors}
          badge="Faculty Roster"
          badgeVariant="neutral"
          subtitle="Supervising Academic Faculties"
          icon={GraduationCap}
        />
        <StatCard
          title="Completed Consultations"
          value={summary.totalMeetingsCompleted}
          badge="91.8% Attendance"
          badgeVariant="success"
          subtitle="Cumulative logged sessions"
          icon={CalendarCheck2}
        />
        <StatCard
          title="Open Escalations"
          value={summary.openEscalations}
          badge={summary.openEscalations > 0 ? 'Action Required' : 'Clear'}
          badgeVariant={summary.openEscalations > 0 ? 'danger' : 'success'}
          subtitle="Academic, attendance, wellbeing"
          icon={AlertTriangle}
        />
      </div>

      {/* Cohort Risk Distribution Breakdown */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
              University-Wide Student Progress Distribution
            </h2>
            <p className="text-[11px] text-slate-500">
              Real-time status breakdown across {summary.totalStudents} enrolled undergraduates
            </p>
          </div>
          <Link
            href="/admin/mentor-view"
            className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1 focus-visible:ring-1 focus-visible:ring-indigo-800 rounded"
          >
            <span>Inspect Cohort Directory</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Accessible Progress Bar Stack */}
        <div className="space-y-2">
          <div
            role="progressbar"
            aria-label="Student progress distribution"
            aria-valuenow={summary.studentsOnTrack}
            aria-valuemin={0}
            aria-valuemax={summary.totalStudents}
            className="h-4 w-full rounded-full bg-slate-100 overflow-hidden flex"
          >
            <div
              style={{ width: `${(summary.studentsOnTrack / total) * 100}%` }}
              className="bg-emerald-500 h-full"
              title={`On Track: ${summary.studentsOnTrack} (${onTrackPct}%)`}
            />
            <div
              style={{ width: `${(summary.studentsNeedsAttention / total) * 100}%` }}
              className="bg-amber-400 h-full"
              title={`Needs Attention: ${summary.studentsNeedsAttention} (${attentionPct}%)`}
            />
            <div
              style={{ width: `${(summary.studentsAtRisk / total) * 100}%` }}
              className="bg-orange-500 h-full"
              title={`At Risk: ${summary.studentsAtRisk} (${atRiskPct}%)`}
            />
            <div
              style={{ width: `${(summary.studentsCritical / total) * 100}%` }}
              className="bg-rose-500 h-full"
              title={`Critical: ${summary.studentsCritical} (${criticalPct}%)`}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
            <div className="p-3 rounded-lg bg-emerald-50/80 border border-emerald-200">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-emerald-900 uppercase">On Track</span>
                <span className="font-bold text-emerald-900 text-sm">{summary.studentsOnTrack}</span>
              </div>
              <span className="text-[11px] text-emerald-800 mt-0.5 block font-medium">
                {onTrackPct}% of student body
              </span>
            </div>

            <div className="p-3 rounded-lg bg-amber-50/80 border border-amber-200">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-amber-900 uppercase">Needs Attention</span>
                <span className="font-bold text-amber-900 text-sm">{summary.studentsNeedsAttention}</span>
              </div>
              <span className="text-[11px] text-amber-800 mt-0.5 block font-medium">
                {attentionPct}% minor delays
              </span>
            </div>

            <div className="p-3 rounded-lg bg-orange-50/80 border border-orange-200">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-orange-900 uppercase">At Risk</span>
                <span className="font-bold text-orange-900 text-sm">{summary.studentsAtRisk}</span>
              </div>
              <span className="text-[11px] text-orange-800 mt-0.5 block font-medium">
                {atRiskPct}% deficit risk
              </span>
            </div>

            <div className="p-3 rounded-lg bg-rose-50/80 border border-rose-200">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-rose-900 uppercase">Critical</span>
                <span className="font-bold text-rose-900 text-sm">{summary.studentsCritical}</span>
              </div>
              <span className="text-[11px] text-rose-800 mt-0.5 block font-medium">
                {criticalPct}% probation risk
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Institutional Student Attendance & Absenteeism Registry Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-indigo-600" />
              <h2 className="text-sm font-bold tracking-tight text-slate-900">
                Institutional Student Attendance & Absenteeism Registry
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Faculty-wide attendance records, examination eligibility compliance, and chronic absenteeism tracking
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs flex-wrap">
            <span className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-[11px]">
              {totalMonitored} Students Tracked
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold text-[11px]">
              {compliantCount} Compliant (≥80%)
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 font-semibold text-[11px]">
              {borderlineCount} Borderline (75–79%)
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 font-semibold text-[11px]">
              {criticalCount} Ineligible (&lt;75%)
            </span>
            <Link
              href="/admin/reports"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Official Reports</span>
            </Link>
          </div>
        </div>

        {/* Faceted Filtering Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by student name or ID..."
              value={attendanceSearchTerm}
              onChange={(e) => setAttendanceSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
            />
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={attendanceDeptFilter}
              onChange={(e) => setAttendanceDeptFilter(e.target.value)}
              aria-label="Filter by department"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
            >
              <option value="">All Academic Departments</option>
              <option value="Software Engineering">Software Engineering</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Data Science">Data Science</option>
              <option value="Distributed Systems">Distributed Systems</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={attendanceStatusFilter}
              onChange={(e) =>
                setAttendanceStatusFilter(
                  e.target.value as 'ALL' | 'CRITICAL' | 'BORDERLINE' | 'COMPLIANT'
                )
              }
              aria-label="Filter by compliance status"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
            >
              <option value="ALL">All Compliance Statuses</option>
              <option value="CRITICAL">Critical Absenteeism (&lt;75% - Ineligible)</option>
              <option value="BORDERLINE">Borderline (75%–79% - Warning)</option>
              <option value="COMPLIANT">Compliant (≥80% - Exam Eligible)</option>
            </select>
          </div>
        </div>

        {/* Table of Students */}
        {filteredStudents.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
            No students match the current attendance filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-semibold text-slate-700 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th scope="col" className="p-3">Undergraduate</th>
                  <th scope="col" className="p-3">Department / Batch</th>
                  <th scope="col" className="p-3">Assigned Faculty Mentor</th>
                  <th scope="col" className="p-3">Coursework Attendance</th>
                  <th scope="col" className="p-3">Lab Practical</th>
                  <th scope="col" className="p-3">Consecutive Absences</th>
                  <th scope="col" className="p-3">Exam Eligibility</th>
                  <th scope="col" className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredStudents.map((s) => {
                  const attRate = s.attendanceRate ?? 90;
                  const labRate = s.labAttendanceRate ?? 88;
                  const absences = s.consecutiveAbsences ?? 0;
                  const isCritical = attRate < 75;
                  const isBorderline = !isCritical && attRate < 80;

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-3 font-bold text-slate-900">
                        {s.fullName}
                        <span className="block font-mono text-[11px] font-normal text-slate-500">
                          {s.studentId}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="font-medium text-slate-800">{s.department}</span>
                        <span className="block text-[11px] text-slate-500">Batch {s.batch}</span>
                      </td>
                      <td className="p-3 font-medium text-slate-700">
                        {s.allocatedMentorName ? (
                          <span className="text-slate-900 font-semibold">{s.allocatedMentorName}</span>
                        ) : (
                          <span className="italic text-amber-700">Unallocated</span>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-bold ${
                              isCritical
                                ? 'text-rose-700'
                                : isBorderline
                                ? 'text-amber-700'
                                : 'text-emerald-700'
                            }`}
                          >
                            {attRate.toFixed(1)}%
                          </span>
                          <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              style={{ width: `${Math.min(100, attRate)}%` }}
                              className={`h-full rounded-full ${
                                isCritical
                                  ? 'bg-rose-500'
                                  : isBorderline
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                              }`}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-3 font-semibold text-slate-800">
                        {labRate.toFixed(1)}%
                      </td>
                      <td className="p-3">
                        {absences > 0 ? (
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                              absences >= 2
                                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {absences} missed
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">0</span>
                        )}
                      </td>
                      <td className="p-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${
                            isCritical
                              ? 'bg-rose-50 text-rose-800 border-rose-200'
                              : isBorderline
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          }`}
                        >
                          {isCritical
                            ? 'Exam Ineligible (<75%)'
                            : isBorderline
                            ? 'Warning (75–79%)'
                            : 'Exam Eligible'}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        {isCritical ? (
                          <Link
                            href="/admin/escalations"
                            className="text-[11px] font-bold text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 px-2 py-1 rounded transition-colors"
                          >
                            Triage Referral
                          </Link>
                        ) : (
                          <Link
                            href="/admin/mentor-view"
                            className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
                          >
                            Cohort View
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Main Split: Urgent Escalation Triage & Quick Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Escalation Triage Box */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Critical Escalations Awaiting Committee Action
              </h2>
            </div>
            <Link
              href="/admin/escalations"
              className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1 focus-visible:ring-1 focus-visible:ring-indigo-800 rounded"
            >
              <span>View Escalation Board ({summary.openEscalations})</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {escalations.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                All escalations resolved. No immediate committee triage required.
              </div>
            ) : (
              escalations.map((esc) => (
                <div key={esc.id} className="py-3 text-xs space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900">{esc.studentName}</span>
                      <span className="text-[11px] text-slate-500 font-mono">Batch {esc.studentBatch}</span>
                      <StatusBadge type="escalation" value={esc.status} />
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                        {esc.category}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500">
                      Logged by {esc.mentorName}
                    </span>
                  </div>

                  <p className="text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-relaxed">
                    {esc.description}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>Routing target: <strong className="text-slate-700">{esc.escalatedToRole}</strong></span>
                    <Link
                      href="/admin/escalations"
                      className="font-semibold text-indigo-600 hover:text-indigo-800 focus-visible:ring-1 focus-visible:ring-indigo-800 rounded"
                    >
                      Triage & Resolve →
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Operations Shortcuts */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
              Executive Actions
            </h2>
          </div>

          <div className="space-y-2.5">
            <Link
              href="/admin/allocations"
              className="block p-3 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none transition-all text-xs"
            >
              <div className="flex items-center justify-between font-bold text-slate-900">
                <span>Random Allocation Engine</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Batch distribution wizard for {summary.unallocatedStudents} unassigned students.
              </p>
            </Link>

            <Link
              href="/admin/mentor-view"
              className="block p-3 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none transition-all text-xs"
            >
              <div className="flex items-center justify-between font-bold text-slate-900">
                <span>Mentor Capacity Directory</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Multi-criteria directory filtering across departments, capacity, and student progress.
              </p>
            </Link>

            <Link
              href="/admin/reports"
              className="block p-3 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none transition-all text-xs"
            >
              <div className="flex items-center justify-between font-bold text-slate-900">
                <span>Export Institutional Reports</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Generate CSV datasets and formatted summaries for audit committees.
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
