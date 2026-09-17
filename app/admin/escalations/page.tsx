'use client';

import React, { useState, useEffect } from 'react';
import { mockStore, useStoreSync } from '@/lib/mockStore';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Modal } from '@/components/common/Modal';
import {
  Search,
  CheckCircle2,
} from 'lucide-react';
import { EscalationCategory, EscalationResponse, EscalationStatus } from '@/types';

export default function AdminEscalationsPage() {
  useStoreSync();
  const [escalations, setEscalations] = useState(() => mockStore.getEscalations());
  useEffect(() => {
    return mockStore.subscribe(() => {
      setEscalations([...mockStore.getEscalations()]);
    });
  }, []);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Resolve Modal state
  const [resolveModalEscalation, setResolveModalEscalation] = useState<EscalationResponse | null>(null);
  const [resolutionStatus, setResolutionStatus] = useState<EscalationStatus>(EscalationStatus.RESOLVED);
  const [resolutionNotes, setResolutionNotes] = useState('');

  const filteredEscalations = escalations.filter((e) => {
    const matchesSearch =
      e.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.mentorName && e.mentorName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      e.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || e.status === statusFilter;
    const matchesCategory = categoryFilter === 'ALL' || e.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (resolveModalEscalation) {
      mockStore.resolveEscalation(resolveModalEscalation.id, resolutionStatus, resolutionNotes);
      setEscalations([...mockStore.getEscalations()]);
      setResolveModalEscalation(null);
      setResolutionNotes('');
      setToastMessage(`Escalation status updated to ${resolutionStatus.replace(/_/g, ' ')}.`);
      setTimeout(() => setToastMessage(''), 3500);
    }
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
          Institutional Escalation Board
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Triage academic risk, chronic absenteeism, and student wellbeing alerts logged by faculty mentors
        </p>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            aria-label="Search student, mentor, or incident description"
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search student, mentor, or incident description..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          <select
            value={statusFilter}
            aria-label="Filter by status"
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 bg-white"
          >
            <option value="ALL">All Statuses</option>
            <option value={EscalationStatus.OPEN}>Open Only</option>
            <option value={EscalationStatus.IN_PROGRESS}>In Progress</option>
            <option value={EscalationStatus.RESOLVED}>Resolved</option>
            <option value={EscalationStatus.CLOSED}>Closed</option>
          </select>

          <select
            value={categoryFilter}
            aria-label="Filter by category"
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 bg-white"
          >
            <option value="ALL">All Categories</option>
            <option value={EscalationCategory.ACADEMIC}>Academic Failure</option>
            <option value={EscalationCategory.ATTENDANCE}>Attendance Deficit</option>
            <option value={EscalationCategory.WELLBEING}>Mental Wellbeing</option>
            <option value={EscalationCategory.DISCIPLINARY}>Disciplinary</option>
            <option value={EscalationCategory.FINANCIAL}>Financial</option>
          </select>
        </div>
      </div>

      {/* Escalation Cards Grid */}
      <div className="space-y-3">
        {filteredEscalations.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-xs">
            No escalations matching filter parameters.
          </div>
        ) : (
          filteredEscalations.map((esc) => (
            <div
              key={esc.id}
              className={`bg-white rounded-xl border p-5 shadow-xs space-y-3 transition-colors ${
                esc.status === 'OPEN' ? 'border-rose-200 bg-rose-50/10' : 'border-slate-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-slate-900 text-sm">{esc.studentName}</span>
                  {esc.studentBatch && (
                    <span className="text-slate-500 text-xs font-mono">Batch {esc.studentBatch}</span>
                  )}
                  <StatusBadge type="escalation" value={esc.status} />
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-800">
                    {esc.category}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">
                  Logged on {esc.createdAt.slice(0, 10)}
                </span>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                {esc.description}
              </p>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 text-xs">
                <div className="flex items-center gap-4 text-slate-500 text-[11px] flex-wrap">
                  <span>
                    Reported by: <strong className="text-slate-800">{esc.mentorName || 'Faculty Mentor'}</strong>
                  </span>
                  <span>
                    Routing target: <strong className="text-slate-800">{esc.escalatedToRole}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {esc.resolutionNotes && (
                    <span className="text-[11px] font-medium text-emerald-800 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                      Resolution: {esc.resolutionNotes}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setResolveModalEscalation(esc);
                      setResolutionStatus(esc.status === EscalationStatus.RESOLVED ? EscalationStatus.CLOSED : EscalationStatus.RESOLVED);
                      setResolutionNotes(esc.resolutionNotes || '');
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none transition-colors shadow-2xs"
                  >
                    {esc.status === 'RESOLVED' || esc.status === 'CLOSED' ? 'Update Case' : 'Triage & Resolve'}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Resolve Escalation Modal */}
      {resolveModalEscalation && (
        <Modal
          isOpen={true}
          onClose={() => setResolveModalEscalation(null)}
          title={`Update Escalation: ${resolveModalEscalation.studentName}`}
          description={`Issue Category: ${resolveModalEscalation.category}`}
        >
          <form onSubmit={handleResolveSubmit} className="space-y-4 text-xs">
            <div>
              <label htmlFor="modal-escalate-status" className="block font-semibold text-slate-700">
                Update Action Status
              </label>
              <select
                id="modal-escalate-status"
                value={resolutionStatus}
                onChange={(e) => setResolutionStatus(e.target.value as EscalationStatus)}
                className="mt-1 block w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 bg-white"
              >
                <option value={EscalationStatus.OPEN}>OPEN (Awaiting Committee Action)</option>
                <option value={EscalationStatus.IN_PROGRESS}>IN PROGRESS (Under Investigation)</option>
                <option value={EscalationStatus.RESOLVED}>RESOLVED (Intervention Formulated)</option>
                <option value={EscalationStatus.CLOSED}>CLOSED (Administrative Case Concluded)</option>
              </select>
            </div>

            <div>
              <label htmlFor="modal-resolution-notes" className="block font-semibold text-slate-700">
                Official Committee Resolution Notes
              </label>
              <textarea
                id="modal-resolution-notes"
                required
                rows={4}
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="State the agreed outcome (e.g. granted study timetable relief, assigned remedial tutor, booked counseling appointment)..."
                className="mt-1 block w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 bg-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setResolveModalEscalation(null)}
                className="px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none shadow-2xs"
              >
                Save Resolution & Update Case
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
