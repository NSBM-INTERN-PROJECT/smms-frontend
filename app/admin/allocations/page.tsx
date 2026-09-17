'use client';

import React, { useState, useEffect } from 'react';
import { mockStore, useStoreSync } from '@/lib/mockStore';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Modal } from '@/components/common/Modal';
import {
  Search,
  Sparkles,
  UserPlus,
  ArrowRightLeft,
  CheckCircle2,
  Play,
  Settings2,
} from 'lucide-react';
import { AllocationResponse, AllocationType } from '@/types';

export default function AdminAllocationsPage() {
  useStoreSync();
  const [activeTab, setActiveTab] = useState<'active' | 'unallocated'>('active');
  const [allocations, setAllocations] = useState(() => mockStore.getAllocations());
  const [students, setStudents] = useState(() => mockStore.getStudents());
  const [mentors, setMentors] = useState(() => mockStore.getMentors());

  useEffect(() => {
    return mockStore.subscribe(() => {
      setAllocations([...mockStore.getAllocations()]);
      setStudents([...mockStore.getStudents()]);
      setMentors([...mockStore.getMentors()]);
    });
  }, []);
  const [searchTerm, setSearchTerm] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Manual Allocation Modal
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [selectedStudentUserId, setSelectedStudentUserId] = useState<string>('');
  const [selectedMentorUserId, setSelectedMentorUserId] = useState<string>('');

  // Transfer Modal
  const [transferModalAllocation, setTransferModalAllocation] = useState<AllocationResponse | null>(null);
  const [newMentorUserId, setNewMentorUserId] = useState<string>('');

  // Deactivate Confirmation Modal
  const [deactivateId, setDeactivateId] = useState<number | null>(null);

  // Random Allocation Wizard Modal
  const [isRandomWizardOpen, setIsRandomWizardOpen] = useState(false);
  const [targetBatch, setTargetBatch] = useState('22.1');
  const [targetDept, setTargetDept] = useState('Data Science');
  const [skipFullMentors, setSkipFullMentors] = useState(true);
  const [wizardResult, setWizardResult] = useState<{
    processed: number;
    success: number;
    skipped: number;
  } | null>(null);

  // Mentor Capacity Quotas Modal
  const [isCapacityModalOpen, setIsCapacityModalOpen] = useState(false);

  const handleUpdateCapacity = (mentorUserId: number, newCap: number) => {
    mockStore.updateMentorCapacity(mentorUserId, Math.max(1, newCap));
    setMentors([...mockStore.getMentors()]);
    setToastMessage('Mentor capacity cap successfully updated.');
    setTimeout(() => setToastMessage(''), 3500);
  };

  const unallocatedStudents = students.filter((s) => !s.allocatedMentorId);

  const filteredAllocations = allocations.filter((a) => {
    const term = searchTerm.toLowerCase();
    return (
      a.studentName.toLowerCase().includes(term) ||
      a.studentIdNumber.toLowerCase().includes(term) ||
      a.mentorName.toLowerCase().includes(term)
    );
  });

  const handleManualAllocate = (e: React.FormEvent) => {
    e.preventDefault();
    const sId = parseInt(selectedStudentUserId, 10);
    const mId = parseInt(selectedMentorUserId, 10);

    const result = mockStore.allocateStudent(sId, mId, AllocationType.MANUAL);
    if (result) {
      setAllocations([...mockStore.getAllocations()]);
      setStudents([...mockStore.getStudents()]);
      setMentors([...mockStore.getMentors()]);
      setIsManualModalOpen(false);
      setSelectedStudentUserId('');
      setSelectedMentorUserId('');
      setToastMessage('Student successfully paired with mentor.');
      setTimeout(() => setToastMessage(''), 3500);
    }
  };

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (transferModalAllocation && newMentorUserId) {
      const mId = parseInt(newMentorUserId, 10);
      mockStore.transferAllocation(transferModalAllocation.id, mId);
      setAllocations([...mockStore.getAllocations()]);
      setStudents([...mockStore.getStudents()]);
      setMentors([...mockStore.getMentors()]);
      setTransferModalAllocation(null);
      setNewMentorUserId('');
      setToastMessage('Student successfully transferred to new mentor.');
      setTimeout(() => setToastMessage(''), 3500);
    }
  };

  const handleConfirmDeactivate = () => {
    if (!deactivateId) return;
    mockStore.deactivateAllocation(deactivateId);
    setAllocations([...mockStore.getAllocations()]);
    setStudents([...mockStore.getStudents()]);
    setMentors([...mockStore.getMentors()]);
    setDeactivateId(null);
    setToastMessage('Allocation pairing deactivated.');
    setTimeout(() => setToastMessage(''), 3500);
  };

  const runRandomAllocation = () => {
    const unallocatedInBatch = unallocatedStudents.filter((s) => {
      const matchBatch = !targetBatch || s.batch === targetBatch;
      const matchDept = !targetDept || s.department === targetDept;
      return matchBatch && matchDept;
    });

    let success = 0;
    let skipped = 0;

    // Work on a mutable copy of mentors to track capacity dynamically
    const mentorPool = [...mockStore.getMentors()];

    unallocatedInBatch.forEach((student) => {
      // Find eligible mentors matching department or general pool, sorted by lowest load
      const availableMentors = mentorPool
        .filter((m) => (!skipFullMentors || m.currentStudentCount < m.capacity))
        .sort((a, b) => (a.currentStudentCount / a.capacity) - (b.currentStudentCount / b.capacity));

      const eligibleMentor = availableMentors.find(m => m.department === student.department) || availableMentors[0];

      if (eligibleMentor) {
        mockStore.allocateStudent(student.userId, eligibleMentor.userId, AllocationType.RANDOM);
        eligibleMentor.currentStudentCount += 1;
        success++;
      } else {
        skipped++;
      }
    });

    setAllocations([...mockStore.getAllocations()]);
    setStudents([...mockStore.getStudents()]);
    setMentors([...mockStore.getMentors()]);
    setWizardResult({
      processed: unallocatedInBatch.length,
      success,
      skipped,
    });
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
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Allocation Management Hub</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Orchestrate manual pairings, balanced algorithmic distributions, and faculty reassignments
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setIsCapacityModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none transition-colors shadow-2xs"
            title="Configure mentor student capacity limits"
          >
            <Settings2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Mentor Capacities</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setWizardResult(null);
              setIsRandomWizardOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-950 focus-visible:outline-none transition-colors shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Random Allocation Engine</span>
          </button>
          <button
            type="button"
            onClick={() => setIsManualModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none transition-colors shadow-2xs"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Manual Pair</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div role="tablist" aria-label="Allocation views" className="flex items-center gap-2 border-b border-slate-200">
        <button
          type="button"
          role="tab"
          id="tab-active"
          aria-selected={activeTab === 'active'}
          aria-controls="panel-active"
          onClick={() => setActiveTab('active')}
          className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none rounded-t ${
            activeTab === 'active'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Active Pairings ({allocations.length})
        </button>
        <button
          type="button"
          role="tab"
          id="tab-unallocated"
          aria-selected={activeTab === 'unallocated'}
          aria-controls="panel-unallocated"
          onClick={() => setActiveTab('unallocated')}
          className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none rounded-t ${
            activeTab === 'unallocated'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <span>Unallocated Queue</span>
          {unallocatedStudents.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold">
              {unallocatedStudents.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab 1: Active Allocations */}
      {activeTab === 'active' && (
        <div id="panel-active" role="tabpanel" aria-labelledby="tab-active" className="space-y-4">
          {/* Search bar */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              aria-label="Search active pairings by student or mentor name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by student name, ID, or mentor name..."
              className="w-full text-xs text-slate-900 focus:outline-none bg-white"
            />
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <caption className="sr-only">Active Student-Mentor Pairings</caption>
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                  <tr>
                    <th scope="col" className="px-5 py-3.5">Student</th>
                    <th scope="col" className="px-5 py-3.5">Assigned Mentor</th>
                    <th scope="col" className="px-5 py-3.5">Batch / Cohort</th>
                    <th scope="col" className="px-5 py-3.5">Allocation Mode</th>
                    <th scope="col" className="px-5 py-3.5">Status</th>
                    <th scope="col" className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAllocations.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-xs text-slate-500">
                        {searchTerm ? `No allocations matching "${searchTerm}"` : 'No allocation pairings found.'}
                      </td>
                    </tr>
                  ) : (
                    filteredAllocations.map((alloc) => (
                      <tr key={alloc.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="font-bold text-slate-900">{alloc.studentName}</div>
                          <div className="font-mono text-[11px] text-slate-500">{alloc.studentIdNumber}</div>
                        </td>
                        <td className="px-5 py-3.5 font-medium text-slate-800">
                          {alloc.mentorName}
                        </td>
                        <td className="px-5 py-3.5 text-slate-600">
                          Batch {alloc.batch} • {alloc.department}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                            {alloc.allocationType}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <StatusBadge type="allocation" value={alloc.status} />
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          {alloc.status === 'ACTIVE' && (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setTransferModalAllocation(alloc)}
                                aria-label={`Transfer ${alloc.studentName} to another mentor`}
                                className="px-2.5 py-1 rounded border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none transition-colors flex items-center gap-1"
                              >
                                <ArrowRightLeft className="w-3 h-3" />
                                <span>Transfer</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeactivateId(alloc.id)}
                                aria-label={`Deactivate allocation for ${alloc.studentName}`}
                                className="px-2.5 py-1 rounded border border-rose-200 text-rose-700 text-xs font-medium hover:bg-rose-50 focus-visible:ring-2 focus-visible:ring-rose-950 focus-visible:outline-none transition-colors"
                              >
                                Deactivate
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Unallocated Queue */}
      {activeTab === 'unallocated' && (
        <div id="panel-unallocated" role="tabpanel" aria-labelledby="tab-unallocated" className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h2 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Undergraduates Requiring Mentor Assignment
            </h2>
            <span className="text-xs text-slate-500">{unallocatedStudents.length} Students Pending</span>
          </div>

          <div className="divide-y divide-slate-100">
            {unallocatedStudents.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500">
                All students currently paired with mentors.
              </div>
            ) : (
              unallocatedStudents.map((s) => (
                <div key={s.id} className="p-4 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{s.fullName}</span>
                      <span className="font-mono text-[11px] text-slate-500">{s.studentId}</span>
                      <StatusBadge type="risk" value={s.riskStatus} />
                    </div>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      {s.degree} • Batch {s.batch} • GPA: {s.currentGpa.toFixed(2)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStudentUserId(s.userId.toString());
                      setIsManualModalOpen(true);
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none transition-colors self-end sm:self-center"
                  >
                    Assign Mentor
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Modal: Manual Allocation */}
      <Modal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        title="Manual Mentor Allocation"
        description="Pair an undergraduate directly with a designated faculty mentor"
      >
        <form onSubmit={handleManualAllocate} className="space-y-4 text-xs">
          <div>
            <label htmlFor="manual-student-select" className="block font-semibold text-slate-700">
              Target Student
            </label>
            <select
              id="manual-student-select"
              required
              value={selectedStudentUserId}
              onChange={(e) => setSelectedStudentUserId(e.target.value)}
              className="mt-1 block w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 bg-white"
            >
              <option value="">Select Student...</option>
              {students.map((s) => (
                <option key={s.userId} value={s.userId}>
                  {s.fullName} ({s.studentId}) - {s.department}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="manual-mentor-select" className="block font-semibold text-slate-700">
              Target Faculty Mentor
            </label>
            <select
              id="manual-mentor-select"
              required
              value={selectedMentorUserId}
              onChange={(e) => setSelectedMentorUserId(e.target.value)}
              className="mt-1 block w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 bg-white"
            >
              <option value="">Select Mentor...</option>
              {mentors.map((m) => (
                <option key={m.userId} value={m.userId}>
                  {m.fullName} ({m.department}) • Capacity: {m.currentStudentCount}/{m.capacity}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsManualModalOpen(false)}
              className="px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none"
            >
              Confirm Pairing
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Transfer Allocation */}
      {transferModalAllocation && (
        <Modal
          isOpen={true}
          onClose={() => {
            setTransferModalAllocation(null);
            setNewMentorUserId('');
          }}
          title={`Transfer ${transferModalAllocation.studentName}`}
          description={`Currently assigned to: ${transferModalAllocation.mentorName}`}
        >
          <form onSubmit={handleTransferSubmit} className="space-y-4 text-xs">
            <div>
              <label htmlFor="transfer-mentor-select" className="block font-semibold text-slate-700">
                Reassign to New Mentor
              </label>
              <select
                id="transfer-mentor-select"
                required
                value={newMentorUserId}
                onChange={(e) => setNewMentorUserId(e.target.value)}
                className="mt-1 block w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 bg-white"
              >
                <option value="">Choose new faculty mentor...</option>
                {mentors
                  .filter((m) => m.userId !== transferModalAllocation.mentorUserId)
                  .map((m) => (
                    <option key={m.userId} value={m.userId}>
                      {m.fullName} ({m.department}) • Capacity: {m.currentStudentCount}/{m.capacity}
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setTransferModalAllocation(null);
                  setNewMentorUserId('');
                }}
                className="px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none"
              >
                Transfer Mentee
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Confirmation Modal: Deactivate Allocation */}
      {deactivateId !== null && (
        <Modal
          isOpen={true}
          onClose={() => setDeactivateId(null)}
          title="Confirm Deactivation"
          description="Are you sure you want to deactivate this mentor-mentee pairing?"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600">
              This action will release the student back to the unallocated queue. Future scheduled meetings will need to be reassigned.
            </p>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeactivateId(null)}
                className="px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeactivate}
                className="px-4 py-2 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 focus-visible:ring-2 focus-visible:ring-rose-950 focus-visible:outline-none"
              >
                Confirm Deactivation
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: Random Allocation Wizard */}
      <Modal
        isOpen={isRandomWizardOpen}
        onClose={() => setIsRandomWizardOpen(false)}
        title="Random Allocation Engine Wizard"
        description="Automated balanced heuristic distribution of unallocated students to available faculty capacity"
      >
        <div className="space-y-4 text-xs">
          {!wizardResult ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="wizard-batch" className="block font-semibold text-slate-700">
                    Target Batch
                  </label>
                  <select
                    id="wizard-batch"
                    value={targetBatch}
                    onChange={(e) => setTargetBatch(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 bg-white"
                  >
                    <option value="">All Batches</option>
                    <option value="21.1">Batch 21.1</option>
                    <option value="22.1">Batch 22.1</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="wizard-dept" className="block font-semibold text-slate-700">
                    Target Department
                  </label>
                  <select
                    id="wizard-dept"
                    value={targetDept}
                    onChange={(e) => setTargetDept(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 bg-white"
                  >
                    <option value="">All Departments</option>
                    <option value="Software Engineering">Software Engineering</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Data Science">Data Science</option>
                  </select>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center gap-2.5">
                <input
                  type="checkbox"
                  id="skip-full"
                  checked={skipFullMentors}
                  onChange={(e) => setSkipFullMentors(e.target.checked)}
                  className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                />
                <label htmlFor="skip-full" className="text-slate-700 cursor-pointer font-medium">
                  Respect Mentor Caps (Skip faculty members at maximum student capacity)
                </label>
              </div>

              <div className="p-3 rounded-lg bg-indigo-50/70 border border-indigo-200 text-indigo-900 space-y-1">
                <span className="font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  Algorithm Specification
                </span>
                <p className="text-[11px] text-indigo-800 leading-relaxed">
                  Students will be balanced evenly across faculty mentors within the departmental roster without violating capacity caps.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRandomWizardOpen(false)}
                  className="px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={runRandomAllocation}
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-950 focus-visible:outline-none flex items-center gap-1.5 shadow-2xs"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Execute Allocation Algorithm</span>
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-4 text-center py-4">
              <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900">Allocation Engine Completed</h4>
                <p className="text-xs text-slate-500 mt-1">
                  The random distribution algorithm executed successfully.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-[11px] text-slate-500 block font-medium">Processed</span>
                  <span className="font-bold text-slate-900 text-sm">{wizardResult.processed}</span>
                </div>
                <div>
                  <span className="text-[11px] text-emerald-800 block font-medium">Assigned</span>
                  <span className="font-bold text-emerald-800 text-sm">{wizardResult.success}</span>
                </div>
                <div>
                  <span className="text-[11px] text-amber-800 block font-medium">Skipped</span>
                  <span className="font-bold text-amber-800 text-sm">{wizardResult.skipped}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsRandomWizardOpen(false)}
                className="w-full py-2.5 px-4 rounded-lg bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none"
              >
                Return to Allocation Hub
              </button>
            </div>
          )}
        </div>
      </Modal>

      {/* Mentor Capacity Quotas Modal */}
      <Modal
        isOpen={isCapacityModalOpen}
        onClose={() => setIsCapacityModalOpen(false)}
        title="Mentor Student Capacity Quotas"
        description="View and configure the maximum mentee capacity limits for each faculty mentor."
        maxWidth="xl"
      >
        <div className="space-y-4">
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-semibold text-slate-700 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th scope="col" className="p-3">Faculty Mentor</th>
                  <th scope="col" className="p-3">Department</th>
                  <th scope="col" className="p-3">Current Mentees</th>
                  <th scope="col" className="p-3">Capacity Cap</th>
                  <th scope="col" className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {mentors.map((m) => {
                  const isFull = m.currentStudentCount >= m.capacity;
                  return (
                    <tr key={m.id} className="hover:bg-slate-50/50">
                      <td className="p-3 font-bold text-slate-900">{m.fullName}</td>
                      <td className="p-3">{m.department}</td>
                      <td className="p-3">
                        <span className={`font-semibold ${isFull ? 'text-rose-600 font-bold' : 'text-slate-800'}`}>
                          {m.currentStudentCount}
                        </span>
                        <span className="text-slate-400"> / {m.capacity}</span>
                      </td>
                      <td className="p-3">
                        <input
                          type="number"
                          min={1}
                          max={50}
                          defaultValue={m.capacity}
                          id={`cap-input-${m.id}`}
                          aria-label={`Capacity for ${m.fullName}`}
                          className="w-16 px-2 py-1 border border-slate-200 rounded text-xs font-bold text-slate-900 bg-white"
                        />
                      </td>
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            const input = document.getElementById(`cap-input-${m.id}`) as HTMLInputElement;
                            if (input) {
                              handleUpdateCapacity(m.userId, parseInt(input.value, 10));
                            }
                          }}
                          className="px-2.5 py-1 rounded bg-slate-900 text-white text-[11px] font-semibold hover:bg-slate-800 transition-colors"
                        >
                          Save
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCapacityModalOpen(false)}
              className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
