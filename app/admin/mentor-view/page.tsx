'use client';

import React, { useState } from 'react';
import { mockStore } from '@/lib/mockStore';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Modal } from '@/components/common/Modal';
import {
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Settings2,
  UserPlus,
  ArrowRightLeft,
  UserMinus,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
} from 'lucide-react';
import { MentorProfileResponse, StudentProfileResponse, ProgressStatus } from '@/types';

export default function AdminMentorFilterGridPage() {
  const [mentorsList, setMentorsList] = useState(() => mockStore.getMentors());
  const [studentsList, setStudentsList] = useState(() => mockStore.getStudents());
  const [toastMessage, setToastMessage] = useState('');

  // Filters
  const [department, setDepartment] = useState('');
  const [specializationQuery, setSpecializationQuery] = useState('');
  const [batch, setBatch] = useState('');
  const [progressStatus, setProgressStatus] = useState<string>('ALL');
  const [maxCapacityFilter, setMaxCapacityFilter] = useState<number>(20);

  // Accordion expansion state
  const [expandedMentors, setExpandedMentors] = useState<Record<number, boolean>>({
    18: true, // Expand Dr. Grace Hopper by default
  });

  // Modals state
  // 1. Adjust Capacity Modal
  const [capacityModalMentor, setCapacityModalMentor] = useState<MentorProfileResponse | null>(null);
  const [newCapacityInput, setNewCapacityInput] = useState<number>(10);

  // 2. Allocate Student Modal
  const [allocateModalMentor, setAllocateModalMentor] = useState<MentorProfileResponse | null>(null);
  const [selectedStudentToAllocate, setSelectedStudentToAllocate] = useState<string>('');

  // 3. Transfer Student Modal
  const [transferModalData, setTransferModalData] = useState<{
    student: StudentProfileResponse;
    currentMentor: MentorProfileResponse;
  } | null>(null);
  const [targetMentorUserId, setTargetMentorUserId] = useState<string>('');

  // 4. Unassign Student Modal
  const [unassignModalData, setUnassignModalData] = useState<{
    student: StudentProfileResponse;
    mentor: MentorProfileResponse;
  } | null>(null);

  const refreshData = () => {
    setMentorsList([...mockStore.getMentors()]);
    setStudentsList([...mockStore.getStudents()]);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Capacity calculations
  const totalCapacity = mentorsList.reduce((sum, m) => sum + m.capacity, 0);
  const totalAllocated = mentorsList.reduce((sum, m) => sum + m.currentStudentCount, 0);
  const availableSeats = Math.max(0, totalCapacity - totalAllocated);

  // Multi-Criteria Filtering
  const filteredMentors = mentorsList
    .filter((m) => {
      if (department && m.department !== department) return false;
      if (
        specializationQuery &&
        !m.specialization.toLowerCase().includes(specializationQuery.toLowerCase())
      )
        return false;
      if (m.capacity > maxCapacityFilter) return false;
      return true;
    })
    .map((m) => {
      const assignedStudents = studentsList.filter((s) => {
        if (s.allocatedMentorId !== m.userId) return false;
        if (batch && s.batch !== batch) return false;
        if (progressStatus !== 'ALL' && s.latestProgressStatus !== progressStatus) return false;
        return true;
      });

      return {
        ...m,
        assignedStudents,
      };
    });

  const toggleExpand = (mentorId: number) => {
    setExpandedMentors((prev) => ({
      ...prev,
      [mentorId]: !prev[mentorId],
    }));
  };

  const resetFilters = () => {
    setDepartment('');
    setSpecializationQuery('');
    setBatch('');
    setProgressStatus('ALL');
    setMaxCapacityFilter(20);
  };

  // Action handlers
  const handleOpenCapacityModal = (mentor: MentorProfileResponse) => {
    setCapacityModalMentor(mentor);
    setNewCapacityInput(mentor.capacity);
  };

  const handleSaveCapacity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!capacityModalMentor) return;
    const validatedCap = Math.max(1, newCapacityInput);
    mockStore.updateMentorCapacity(capacityModalMentor.userId, validatedCap);
    refreshData();
    showToast(`Capacity limit for ${capacityModalMentor.fullName} updated to ${validatedCap} students.`);
    setCapacityModalMentor(null);
  };

  const handleOpenAllocateModal = (mentor: MentorProfileResponse) => {
    setAllocateModalMentor(mentor);
    const unallocated = studentsList.filter((s) => !s.allocatedMentorId);
    setSelectedStudentToAllocate(unallocated[0] ? unallocated[0].userId.toString() : '');
  };

  const handleSaveAllocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allocateModalMentor || !selectedStudentToAllocate) return;
    const sId = parseInt(selectedStudentToAllocate, 10);
    mockStore.allocateStudent(sId, allocateModalMentor.userId);
    refreshData();
    const student = studentsList.find((s) => s.userId === sId);
    showToast(`${student?.fullName || 'Student'} allocated to ${allocateModalMentor.fullName}.`);
    setAllocateModalMentor(null);
  };

  const handleOpenTransferModal = (
    student: StudentProfileResponse,
    currentMentor: MentorProfileResponse
  ) => {
    setTransferModalData({ student, currentMentor });
    const otherMentors = mentorsList.filter((m) => m.userId !== currentMentor.userId);
    setTargetMentorUserId(otherMentors[0] ? otherMentors[0].userId.toString() : '');
  };

  const handleSaveTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferModalData || !targetMentorUserId) return;
    const targetId = parseInt(targetMentorUserId, 10);
    mockStore.transferStudent(transferModalData.student.userId, targetId);
    refreshData();
    const newMentor = mentorsList.find((m) => m.userId === targetId);
    showToast(`${transferModalData.student.fullName} transferred to ${newMentor?.fullName || 'new mentor'}.`);
    setTransferModalData(null);
  };

  const handleOpenUnassignModal = (
    student: StudentProfileResponse,
    mentor: MentorProfileResponse
  ) => {
    setUnassignModalData({ student, mentor });
  };

  const handleConfirmUnassign = () => {
    if (!unassignModalData) return;
    mockStore.unallocateStudent(unassignModalData.student.userId);
    refreshData();
    showToast(`${unassignModalData.student.fullName} unassigned and returned to unallocated cohort pool.`);
    setUnassignModalData(null);
  };

  const unallocatedStudents = studentsList.filter((s) => !s.allocatedMentorId);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 shadow-xs"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & High-Level Capacity Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Mentor & Cohort Directory
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure mentor student capacity caps, reassign mentees, and inspect academic progress
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={resetFilters}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none transition-colors"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Capacity Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Faculty Mentors
          </span>
          <span className="text-lg font-bold text-slate-900 mt-1 block">
            {mentorsList.length}
          </span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Total Capacity Quota
          </span>
          <span className="text-lg font-bold text-slate-900 mt-1 block">
            {totalCapacity} Seats
          </span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Allocated Mentees
          </span>
          <span className="text-lg font-bold text-slate-900 mt-1 block">
            {totalAllocated} Students
          </span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Available Headroom
          </span>
          <span className="text-lg font-bold text-emerald-700 mt-1 block">
            {availableSeats} Seats
          </span>
        </div>
      </div>

      {/* Multi-Criteria Filter Panel */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-700">
          <SlidersHorizontal className="w-4 h-4 text-slate-500" />
          <span>Faceted Query Parameters</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          {/* Department */}
          <div>
            <label htmlFor="filter-dept" className="block font-semibold text-slate-700 mb-1">
              Academic Department
            </label>
            <select
              id="filter-dept"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 bg-white"
            >
              <option value="">All Departments</option>
              <option value="Software Engineering">Software Engineering</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Distributed Systems">Distributed Systems</option>
            </select>
          </div>

          {/* Specialization Search */}
          <div>
            <label htmlFor="filter-spec" className="block font-semibold text-slate-700 mb-1">
              Specialization Keyword
            </label>
            <input
              id="filter-spec"
              type="text"
              value={specializationQuery}
              onChange={(e) => setSpecializationQuery(e.target.value)}
              placeholder="e.g. Algorithms, Cloud..."
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 bg-white"
            />
          </div>

          {/* Batch */}
          <div>
            <label htmlFor="filter-batch" className="block font-semibold text-slate-700 mb-1">
              Student Batch
            </label>
            <select
              id="filter-batch"
              value={batch}
              onChange={(e) => setBatch(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 bg-white"
            >
              <option value="">All Batches</option>
              <option value="21.1">Batch 21.1</option>
              <option value="22.1">Batch 22.1</option>
            </select>
          </div>

          {/* Student Progress Status */}
          <div>
            <label htmlFor="filter-progress" className="block font-semibold text-slate-700 mb-1">
              Student Progress Status
            </label>
            <select
              id="filter-progress"
              value={progressStatus}
              onChange={(e) => setProgressStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 bg-white"
            >
              <option value="ALL">All Outcomes</option>
              <option value={ProgressStatus.ON_TRACK}>On Track</option>
              <option value={ProgressStatus.NEEDS_ATTENTION}>Needs Attention</option>
              <option value={ProgressStatus.AT_RISK}>At Risk</option>
              <option value={ProgressStatus.CRITICAL}>Critical</option>
            </select>
          </div>

          {/* Max Capacity Slider */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="filter-capacity" className="font-semibold text-slate-700">
                Max Capacity Filter
              </label>
              <span className="text-[11px] font-bold text-slate-900">≤ {maxCapacityFilter}</span>
            </div>
            <input
              id="filter-capacity"
              type="range"
              min={5}
              max={25}
              value={maxCapacityFilter}
              onChange={(e) => setMaxCapacityFilter(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
            />
          </div>
        </div>
      </div>

      {/* Filtered Mentors Grid */}
      <div className="space-y-4">
        {filteredMentors.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-xs">
            No mentors or students matched the combined criteria filter parameters.
          </div>
        ) : (
          filteredMentors.map((mentor) => {
            const isExpanded = !!expandedMentors[mentor.userId];
            const capacityRatio =
              mentor.capacity > 0 ? mentor.currentStudentCount / mentor.capacity : 0;
            const isFull = mentor.currentStudentCount >= mentor.capacity;

            return (
              <div
                key={mentor.id}
                className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden transition-all"
              >
                {/* Mentor Card Header Container */}
                <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left: Mentor Details (Clickable for Accordion Toggle) */}
                  <div
                    onClick={() => toggleExpand(mentor.userId)}
                    className="flex items-start gap-3.5 cursor-pointer flex-1 select-none"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleExpand(mentor.userId);
                      }
                    }}
                    aria-expanded={isExpanded}
                    aria-label={`Toggle details for ${mentor.fullName}`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs shrink-0">
                      {mentor.fullName
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-sm font-bold text-slate-900">{mentor.fullName}</h2>
                        <span className="text-xs text-slate-500 font-medium">
                          ({mentor.designation})
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200">
                          {mentor.department}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        Domain: <span className="text-slate-800 font-medium">{mentor.specialization}</span>
                      </p>
                    </div>
                  </div>

                  {/* Right: Capacity Indicator & Dedicated Action Buttons */}
                  <div className="flex items-center gap-3 shrink-0 flex-wrap self-end md:self-center">
                    {/* Mentee Load Progress Bar */}
                    <div className="w-36 text-right">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                        <span>Mentee Load</span>
                        <span className={isFull ? 'text-rose-600 font-bold' : ''}>
                          {mentor.currentStudentCount} / {mentor.capacity}
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          style={{ width: `${Math.min(100, capacityRatio * 100)}%` }}
                          className={`h-full rounded-full transition-all ${
                            capacityRatio >= 1
                              ? 'bg-rose-500'
                              : capacityRatio >= 0.8
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Change / Adjust Capacity Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenCapacityModal(mentor);
                      }}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none transition-colors inline-flex items-center gap-1.5 shadow-2xs"
                      title="Change maximum allocated students limit"
                    >
                      <Settings2 className="w-3.5 h-3.5 text-slate-500" />
                      <span>Adjust Cap</span>
                    </button>

                    {/* Allocate Student to this Mentor Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenAllocateModal(mentor);
                      }}
                      disabled={unallocatedStudents.length === 0}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none transition-colors inline-flex items-center gap-1.5 shadow-2xs"
                      title="Assign an unallocated student directly to this mentor"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>+ Allocate</span>
                    </button>

                    {/* Accordion Chevron Button */}
                    <button
                      type="button"
                      onClick={() => toggleExpand(mentor.userId)}
                      aria-expanded={isExpanded}
                      aria-label={isExpanded ? `Collapse ${mentor.fullName}` : `Expand ${mentor.fullName}`}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none transition-colors"
                    >
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Students Breakdown */}
                {isExpanded && (
                  <div className="border-t border-slate-100 bg-slate-50/40 p-5 space-y-3">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      <span>Assigned Mentees ({mentor.assignedStudents.length})</span>
                      <span>Manage Pairings & Outcomes</span>
                    </div>

                    {mentor.assignedStudents.length === 0 ? (
                      <div className="py-4 text-center bg-white rounded-lg border border-dashed border-slate-200">
                        <p className="text-xs text-slate-500 italic">
                          No students currently assigned under this mentor match the chosen criteria.
                        </p>
                        {unallocatedStudents.length > 0 && (
                          <button
                            type="button"
                            onClick={() => handleOpenAllocateModal(mentor)}
                            className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>Allocate an unassigned student now</span>
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {mentor.assignedStudents.map((s) => (
                          <div
                            key={s.id}
                            className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs space-y-2 flex flex-col justify-between"
                          >
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-900 text-xs">{s.fullName}</span>
                                <StatusBadge
                                  type="progress"
                                  value={s.latestProgressStatus || 'ON_TRACK'}
                                />
                              </div>
                              <div className="text-[11px] text-slate-500 flex items-center justify-between">
                                <span>ID: {s.studentId}</span>
                                <span>Batch {s.batch}</span>
                                <span className="font-bold text-slate-800">GPA: {s.currentGpa.toFixed(2)}</span>
                              </div>
                              <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[11px]">
                                <span className="text-slate-500">Risk Assessment:</span>
                                <StatusBadge type="risk" value={s.riskStatus} />
                              </div>
                            </div>

                            {/* Mentee Reallocation & Transfer Actions */}
                            <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-1.5 text-xs">
                              <button
                                type="button"
                                onClick={() => handleOpenTransferModal(s, mentor)}
                                className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors inline-flex items-center gap-1"
                                title="Transfer to another faculty mentor"
                              >
                                <ArrowRightLeft className="w-3 h-3" />
                                <span>Transfer</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenUnassignModal(s, mentor)}
                                className="px-2 py-1 text-[11px] font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-md transition-colors inline-flex items-center gap-1"
                                title="Remove assignment and return student to unallocated pool"
                              >
                                <UserMinus className="w-3 h-3" />
                                <span>Unassign</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 1. ADJUST CAPACITY MODAL */}
      {capacityModalMentor && (
        <Modal
          isOpen={!!capacityModalMentor}
          onClose={() => setCapacityModalMentor(null)}
          title={`Adjust Student Capacity Cap: ${capacityModalMentor.fullName}`}
          description="Update the maximum number of students that can be allocated to this faculty mentor."
        >
          <form onSubmit={handleSaveCapacity} className="space-y-4">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Department:</span>
                <span className="font-semibold text-slate-900">{capacityModalMentor.department}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Currently Assigned Mentees:</span>
                <span className="font-bold text-slate-900">
                  {capacityModalMentor.currentStudentCount} Students
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Current Capacity Cap:</span>
                <span className="font-bold text-slate-900">
                  {capacityModalMentor.capacity} Students
                </span>
              </div>
            </div>

            <div>
              <label htmlFor="input-capacity" className="block text-xs font-semibold text-slate-700 mb-1">
                New Maximum Student Capacity Limit
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="input-capacity"
                  type="number"
                  min={1}
                  max={50}
                  required
                  value={newCapacityInput}
                  onChange={(e) => setNewCapacityInput(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                />
              </div>
            </div>

            {/* Quick Preset Buttons */}
            <div>
              <span className="block text-[11px] font-semibold text-slate-500 mb-1.5">
                Quick Preset Limits:
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                {[5, 8, 10, 12, 15, 20].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setNewCapacityInput(preset)}
                    className={`px-2.5 py-1 rounded text-xs font-semibold border transition-colors ${
                      newCapacityInput === preset
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {preset} Students
                  </button>
                ))}
              </div>
            </div>

            {/* Capacity Warning if Reduced Below Current Load */}
            {newCapacityInput < capacityModalMentor.currentStudentCount && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  The chosen capacity ({newCapacityInput}) is lower than the mentor&apos;s current load (
                  {capacityModalMentor.currentStudentCount} students). This will mark the mentor as over-capacity
                  and block further automated allocations until mentees are reassigned.
                </span>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCapacityModalMentor(null)}
                className="px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
              >
                Save Capacity Cap
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* 2. ALLOCATE STUDENT MODAL */}
      {allocateModalMentor && (
        <Modal
          isOpen={!!allocateModalMentor}
          onClose={() => setAllocateModalMentor(null)}
          title={`Allocate Student to ${allocateModalMentor.fullName}`}
          description={`Assign an unallocated student to this mentor (${allocateModalMentor.currentStudentCount}/${allocateModalMentor.capacity} capacity).`}
        >
          {unallocatedStudents.length === 0 ? (
            <div className="py-4 text-center text-xs text-slate-500">
              All students in the system are currently allocated to mentors.
            </div>
          ) : (
            <form onSubmit={handleSaveAllocation} className="space-y-4">
              <div>
                <label htmlFor="select-student" className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Unallocated Student
                </label>
                <select
                  id="select-student"
                  required
                  value={selectedStudentToAllocate}
                  onChange={(e) => setSelectedStudentToAllocate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                >
                  {unallocatedStudents.map((s) => (
                    <option key={s.id} value={s.userId}>
                      {s.fullName} ({s.studentId}) • {s.department} • Batch {s.batch}
                    </option>
                  ))}
                </select>
              </div>

              {allocateModalMentor.currentStudentCount >= allocateModalMentor.capacity && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    Warning: {allocateModalMentor.fullName} is currently at or above max capacity (
                    {allocateModalMentor.currentStudentCount}/{allocateModalMentor.capacity}).
                    Allocating another student will exceed the quota.
                  </span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAllocateModalMentor(null)}
                  className="px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
                >
                  Confirm Allocation
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}

      {/* 3. TRANSFER / REASSIGN STUDENT MODAL */}
      {transferModalData && (
        <Modal
          isOpen={!!transferModalData}
          onClose={() => setTransferModalData(null)}
          title={`Transfer Mentee: ${transferModalData.student.fullName}`}
          description={`Reassign ${transferModalData.student.fullName} (${transferModalData.student.studentId}) from ${transferModalData.currentMentor.fullName} to another mentor.`}
        >
          <form onSubmit={handleSaveTransfer} className="space-y-4">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Student:</span>
                <span className="font-semibold text-slate-900">
                  {transferModalData.student.fullName} ({transferModalData.student.studentId})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Current Mentor:</span>
                <span className="font-semibold text-slate-900">
                  {transferModalData.currentMentor.fullName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Department:</span>
                <span className="font-semibold text-slate-900">
                  {transferModalData.student.department}
                </span>
              </div>
            </div>

            <div>
              <label htmlFor="select-new-mentor" className="block text-xs font-semibold text-slate-700 mb-1">
                Select Target Faculty Mentor
              </label>
              <select
                id="select-new-mentor"
                required
                value={targetMentorUserId}
                onChange={(e) => setTargetMentorUserId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
              >
                {mentorsList
                  .filter((m) => m.userId !== transferModalData.currentMentor.userId)
                  .map((m) => {
                    const remaining = m.capacity - m.currentStudentCount;
                    return (
                      <option key={m.id} value={m.userId}>
                        {m.fullName} ({m.department}) • Load: {m.currentStudentCount}/{m.capacity} (
                        {remaining > 0 ? `${remaining} seats open` : 'At cap'})
                      </option>
                    );
                  })}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setTransferModalData(null)}
                className="px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors"
              >
                Confirm Reassignment
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* 4. UNASSIGN CONFIRMATION MODAL */}
      {unassignModalData && (
        <Modal
          isOpen={!!unassignModalData}
          onClose={() => setUnassignModalData(null)}
          title="Confirm Student Unassignment"
          description="Remove student allocation and return mentee to unallocated pool."
        >
          <div className="space-y-4">
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-900 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>
                Are you sure you want to remove <strong>{unassignModalData.student.fullName}</strong> (
                {unassignModalData.student.studentId}) from <strong>{unassignModalData.mentor.fullName}</strong>?
                The student will be returned to the unallocated cohort pool and can be assigned manually or via the
                allocation engine.
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setUnassignModalData(null)}
                className="px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmUnassign}
                className="px-4 py-2 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition-colors"
              >
                Confirm Unassign
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
