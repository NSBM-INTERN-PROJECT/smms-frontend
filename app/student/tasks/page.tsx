'use client';

import React, { useState, useEffect } from 'react';
import { mockStore, useStoreSync } from '@/lib/mockStore';
import { CheckCircle2, Calendar, User, Check } from 'lucide-react';
import { RecipientStatus } from '@/types';

export default function StudentTasksPage() {
  useStoreSync();
  const [tasks, setTasks] = useState(() => mockStore.getTasks());
  useEffect(() => {
    return mockStore.subscribe(() => {
      setTasks([...mockStore.getTasks()]);
    });
  }, []);
  const [toastMessage, setToastMessage] = useState('');

  const handleMarkSubmitted = (taskId: number) => {
    mockStore.submitTask(taskId);
    setTasks([...mockStore.getTasks()]);
    setToastMessage('Task survey marked as submitted.');
    setTimeout(() => setToastMessage(''), 3000);
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
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Academic Surveys & Tasks</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Surveys, cohort questionnaires, and academic information forms assigned by faculty mentors
        </p>
      </div>

      <div className="space-y-4">
        {tasks.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-xs">
            No questionnaires or surveys currently assigned to you.
          </div>
        ) : (
          tasks.map((task) => {
            const isSubmitted = task.status === RecipientStatus.SUBMITTED;
            return (
              <div
                key={task.id}
                className={`bg-white rounded-xl border p-5 shadow-xs transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isSubmitted ? 'border-slate-200 bg-slate-50/40' : 'border-indigo-200'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="text-sm font-bold text-slate-900">{task.title}</h2>
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md border ${
                        isSubmitted
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {isSubmitted ? 'Submitted' : 'Pending Submission'}
                    </span>
                    <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      Batch {task.batch} • {task.department}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                    {task.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>Issued by {task.creatorMentorName}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Due: {task.dueDate}</span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 self-start md:self-center">
                  {isSubmitted ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
                      <Check className="w-3.5 h-3.5 text-emerald-700" />
                      Completed
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleMarkSubmitted(task.id)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none transition-colors shadow-2xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark as Submitted</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
