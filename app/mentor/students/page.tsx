'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { mockStore, useStoreSync } from '@/lib/mockStore';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Modal } from '@/components/common/Modal';
import { StudentHistoryReportModal } from '@/components/reports/StudentHistoryReportModal';
import {
  Search,
  Filter,
  Eye,
  FileText,
  Phone,
  MapPin,
  Clock,
  Printer,
} from 'lucide-react';
import { ProgressStatus, StudentProfileResponse } from '@/types';

export default function MentorStudentsPage() {
  useStoreSync();
  const { user } = useAuth();
  const mentorUserId = user?.id || 18;

  const [students, setStudents] = useState(() =>
    mockStore.getStudents().filter((s) => s.allocatedMentorId === mentorUserId)
  );

  useEffect(() => {
    return mockStore.subscribe(() => {
      setStudents([...mockStore.getStudents().filter((s) => s.allocatedMentorId === mentorUserId)]);
    });
  }, [mentorUserId]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Dossier Modal state
  const [selectedStudent, setSelectedStudent] = useState<StudentProfileResponse | null>(null);
  // Longitudinal History Report Modal state
  const [historyReportStudent, setHistoryReportStudent] = useState<StudentProfileResponse | null>(null);

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'ALL' || s.latestProgressStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const selectedStudentNotes = selectedStudent
    ? mockStore.getSessionNotes(mentorUserId, user?.role).filter((n) => n.studentUserId === selectedStudent.userId)
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Assigned Student Roster</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Active mentees under your supervision ({students.length} Allocated Students)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/mentor/slots"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none transition-colors"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Generate Meeting Slots</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            aria-label="Search mentees by name or student ID"
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or student ID..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <label htmlFor="mentee-status-filter" className="text-xs text-slate-600 font-medium">
            Progress:
          </label>
          <select
            id="mentee-status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 bg-white"
          >
            <option value="ALL">All Statuses</option>
            <option value={ProgressStatus.ON_TRACK}>On Track</option>
            <option value={ProgressStatus.NEEDS_ATTENTION}>Needs Attention</option>
            <option value={ProgressStatus.AT_RISK}>At Risk</option>
            <option value={ProgressStatus.CRITICAL}>Critical</option>
          </select>
        </div>
      </div>

      {/* Roster Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <caption className="sr-only">Assigned Student Roster and Progress Status</caption>
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
              <tr>
                <th scope="col" className="px-5 py-3.5">Student</th>
                <th scope="col" className="px-5 py-3.5">Academic Cohort</th>
                <th scope="col" className="px-5 py-3.5">GPA</th>
                <th scope="col" className="px-5 py-3.5">Risk Rating</th>
                <th scope="col" className="px-5 py-3.5">Progress Assessment</th>
                <th scope="col" className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-xs text-slate-500">
                    No matching students found in your roster.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-900">{s.fullName}</div>
                      <div className="font-mono text-[11px] text-slate-500">{s.studentId}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="text-slate-900 font-medium">{s.department}</div>
                      <div className="text-[11px] text-slate-500">Batch {s.batch} • {s.intake}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-bold text-slate-900">{s.currentGpa.toFixed(2)}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge type="risk" value={s.riskStatus} />
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge
                        type="progress"
                        value={s.latestProgressStatus || ProgressStatus.ON_TRACK}
                      />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedStudent(s)}
                          aria-label={`View academic profile and dossier for ${s.fullName}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Profile & Notes</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setHistoryReportStudent(s)}
                          aria-label={`Generate longitudinal history report for ${s.fullName}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold hover:bg-indigo-100 focus-visible:ring-2 focus-visible:ring-indigo-950 focus-visible:outline-none transition-colors"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>History Report</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Dossier Modal */}
      {selectedStudent && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedStudent(null)}
          title={`Student Profile: ${selectedStudent.fullName}`}
          description={`ID: ${selectedStudent.studentId} • Batch: ${selectedStudent.batch}`}
          maxWidth="2xl"
        >
          <div className="space-y-5 text-xs">
            {/* Academic Overview */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <span className="text-[11px] text-slate-500 font-medium block">Current GPA</span>
                <span className="text-base font-bold text-slate-900">{selectedStudent.currentGpa.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 font-medium block">Progress Rating</span>
                <div className="mt-0.5">
                  <StatusBadge type="progress" value={selectedStudent.latestProgressStatus || 'ON_TRACK'} />
                </div>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 font-medium block">System Risk Index</span>
                <div className="mt-0.5">
                  <StatusBadge type="risk" value={selectedStudent.riskStatus} />
                </div>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 font-medium block">Enrolled Degree</span>
                <span className="font-semibold text-slate-800 truncate block" title={selectedStudent.degree}>
                  {selectedStudent.degree}
                </span>
              </div>
            </div>

            {/* Contact & Emergency info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-lg border border-slate-200 space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Parent / Guardian
                </span>
                <p className="font-bold text-slate-900">{selectedStudent.parentName || 'Not supplied'}</p>
                <div className="text-slate-600 flex items-center gap-1 mt-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {selectedStudent.parentPhone ? (
                    <a href={`tel:${selectedStudent.parentPhone}`} className="hover:underline">
                      {selectedStudent.parentPhone}
                    </a>
                  ) : (
                    <span>No phone</span>
                  )}
                </div>
              </div>

              <div className="p-3.5 rounded-lg border border-slate-200 space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Emergency Contact
                </span>
                <p className="font-bold text-slate-900">{selectedStudent.emergencyContactName || 'Not supplied'}</p>
                <div className="text-slate-600 flex items-center gap-1 mt-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {selectedStudent.emergencyContactPhone ? (
                    <a href={`tel:${selectedStudent.emergencyContactPhone}`} className="hover:underline">
                      {selectedStudent.emergencyContactPhone}
                    </a>
                  ) : (
                    <span>No phone</span>
                  )}
                </div>
              </div>

              <div className="sm:col-span-2 p-3.5 rounded-lg border border-slate-200 space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Registered Permanent Address
                </span>
                <p className="text-slate-700 flex items-start gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>{selectedStudent.permanentAddress || 'Address not registered'}</span>
                </p>
              </div>
            </div>

            {/* Session Notes History for this student */}
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Logged Consultation History
                </span>
                <Link
                  href={`/mentor/sessions?studentId=${selectedStudent.userId}`}
                  className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 focus-visible:ring-1 focus-visible:ring-indigo-800 rounded"
                >
                  + Record New Session Note
                </Link>
              </div>

              <div className="space-y-3">
                {selectedStudentNotes.length === 0 ? (
                  <p className="text-xs text-slate-500 py-3 text-center">No session notes recorded yet for this student.</p>
                ) : (
                  selectedStudentNotes.map((note) => (
                    <div
                      key={note.id}
                      className={`p-3 rounded-lg border text-xs space-y-2 ${
                        note.isPrivate ? 'bg-amber-50/50 border-amber-200' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">
                            {note.createdAt.slice(0, 10)}
                          </span>
                          <StatusBadge type="progress" value={note.progressStatus} />
                          {note.isPrivate && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-900">
                              CONFIDENTIAL
                            </span>
                          )}
                        </div>
                        {note.followUpDate && (
                          <span className="text-[11px] text-slate-500">Target: {note.followUpDate}</span>
                        )}
                      </div>
                      <p className="text-slate-700 leading-relaxed">{note.discussionNotes}</p>
                      <div className="p-2 rounded bg-white border border-slate-200 text-slate-800 text-[11px] whitespace-pre-line">
                        <span className="font-semibold block mb-0.5 text-slate-900">Action Items:</span>
                        {note.actionItems}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  const target = selectedStudent;
                  setSelectedStudent(null);
                  setHistoryReportStudent(target);
                }}
                className="px-3 py-2 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold hover:bg-indigo-100 focus-visible:ring-2 focus-visible:ring-indigo-950 focus-visible:outline-none inline-flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Generate Full History Dossier</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedStudent(null)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none"
                >
                  Close
                </button>
                <Link
                  href={`/mentor/sessions?studentId=${selectedStudent.userId}`}
                  className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none inline-flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Log Session Note</span>
                </Link>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Longitudinal Student History Dossier Report Modal */}
      <StudentHistoryReportModal
        isOpen={Boolean(historyReportStudent)}
        onClose={() => setHistoryReportStudent(null)}
        student={historyReportStudent}
      />
    </div>
  );
}
