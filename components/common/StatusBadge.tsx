import React from 'react';
import {
  ProgressStatus,
  RiskStatus,
  AttendanceStatus,
  MeetingStatus,
  MeetingMode,
  EscalationStatus,
  AllocationStatus,
  RequestStatus,
  Role,
} from '@/types';

interface StatusBadgeProps {
  type:
    | 'progress'
    | 'risk'
    | 'attendance'
    | 'meetingStatus'
    | 'meetingMode'
    | 'escalation'
    | 'allocation'
    | 'request'
    | 'role';
  value: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ type, value, size = 'sm' }) => {
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';

  if (type === 'progress') {
    switch (value) {
      case ProgressStatus.ON_TRACK:
        colorClasses = 'bg-emerald-50 text-emerald-800 border-emerald-200';
        break;
      case ProgressStatus.NEEDS_ATTENTION:
        colorClasses = 'bg-amber-50 text-amber-800 border-amber-200';
        break;
      case ProgressStatus.AT_RISK:
        colorClasses = 'bg-orange-50 text-orange-800 border-orange-200';
        break;
      case ProgressStatus.CRITICAL:
        colorClasses = 'bg-rose-50 text-rose-800 border-rose-200';
        break;
    }
  } else if (type === 'risk') {
    switch (value) {
      case RiskStatus.LOW:
        colorClasses = 'bg-emerald-50 text-emerald-800 border-emerald-200';
        break;
      case RiskStatus.MEDIUM:
        colorClasses = 'bg-amber-50 text-amber-800 border-amber-200';
        break;
      case RiskStatus.HIGH:
        colorClasses = 'bg-rose-50 text-rose-800 border-rose-200';
        break;
    }
  } else if (type === 'attendance') {
    switch (value) {
      case AttendanceStatus.PRESENT:
        colorClasses = 'bg-emerald-50 text-emerald-800 border-emerald-200';
        break;
      case AttendanceStatus.LATE:
        colorClasses = 'bg-amber-50 text-amber-800 border-amber-200';
        break;
      case AttendanceStatus.ABSENT:
        colorClasses = 'bg-rose-50 text-rose-800 border-rose-200';
        break;
      case AttendanceStatus.EXCUSED:
        colorClasses = 'bg-blue-50 text-blue-800 border-blue-200';
        break;
      case AttendanceStatus.PENDING:
        colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';
        break;
    }
  } else if (type === 'meetingStatus') {
    switch (value) {
      case MeetingStatus.SCHEDULED:
        colorClasses = 'bg-indigo-50 text-indigo-800 border-indigo-200';
        break;
      case MeetingStatus.COMPLETED:
        colorClasses = 'bg-emerald-50 text-emerald-800 border-emerald-200';
        break;
      case MeetingStatus.RESCHEDULED:
        colorClasses = 'bg-amber-50 text-amber-800 border-amber-200';
        break;
      case MeetingStatus.CANCELLED:
        colorClasses = 'bg-rose-50 text-rose-800 border-rose-200';
        break;
    }
  } else if (type === 'meetingMode') {
    switch (value) {
      case MeetingMode.ONLINE:
        colorClasses = 'bg-sky-50 text-sky-800 border-sky-200';
        break;
      case MeetingMode.IN_PERSON:
        colorClasses = 'bg-slate-100 text-slate-800 border-slate-300';
        break;
      case MeetingMode.HYBRID:
        colorClasses = 'bg-purple-50 text-purple-800 border-purple-200';
        break;
    }
  } else if (type === 'escalation') {
    switch (value) {
      case EscalationStatus.OPEN:
        colorClasses = 'bg-rose-50 text-rose-800 border-rose-200';
        break;
      case EscalationStatus.IN_PROGRESS:
        colorClasses = 'bg-amber-50 text-amber-800 border-amber-200';
        break;
      case EscalationStatus.RESOLVED:
      case EscalationStatus.CLOSED:
        colorClasses = 'bg-emerald-50 text-emerald-800 border-emerald-200';
        break;
    }
  } else if (type === 'allocation') {
    switch (value) {
      case AllocationStatus.ACTIVE:
        colorClasses = 'bg-emerald-50 text-emerald-800 border-emerald-200';
        break;
      case AllocationStatus.TRANSFERRED:
        colorClasses = 'bg-blue-50 text-blue-800 border-blue-200';
        break;
      case AllocationStatus.INACTIVE:
        colorClasses = 'bg-slate-100 text-slate-600 border-slate-200';
        break;
    }
  } else if (type === 'request') {
    switch (value) {
      case RequestStatus.APPROVED:
        colorClasses = 'bg-emerald-50 text-emerald-800 border-emerald-200';
        break;
      case RequestStatus.REJECTED:
        colorClasses = 'bg-rose-50 text-rose-800 border-rose-200';
        break;
      case RequestStatus.PENDING:
        colorClasses = 'bg-amber-50 text-amber-800 border-amber-200';
        break;
    }
  } else if (type === 'role') {
    switch (value) {
      case Role.ADMIN:
        colorClasses = 'bg-purple-50 text-purple-800 border-purple-200';
        break;
      case Role.COORDINATOR:
        colorClasses = 'bg-violet-50 text-violet-800 border-violet-200';
        break;
      case Role.MENTOR:
        colorClasses = 'bg-indigo-50 text-indigo-800 border-indigo-200';
        break;
      case Role.STUDENT:
        colorClasses = 'bg-sky-50 text-sky-800 border-sky-200';
        break;
      default:
        colorClasses = 'bg-slate-100 text-slate-800 border-slate-200';
        break;
    }
  }

  const formatText = (str: string) => {
    return str.replace(/_/g, ' ');
  };

  return (
    <span
      className={`inline-flex items-center justify-center rounded-md border tracking-wide uppercase font-semibold ${sizeClass} ${colorClasses}`}
    >
      {formatText(value)}
    </span>
  );
};
