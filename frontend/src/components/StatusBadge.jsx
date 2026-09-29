import React from 'react';

export const StatusBadge = ({ status = 'ACTIVE' }) => {
  const norm = (status || 'ACTIVE').toUpperCase();

  const styles = {
    // Cases
    NEW: 'bg-blue-50 text-blue-700 border-blue-200',
    ACTIVE: 'bg-sky-50 text-sky-800 border-sky-200 font-medium',
    IN_PROGRESS: 'bg-indigo-50 text-indigo-800 border-indigo-200 font-medium',
    WAITING_VERIFICATION: 'bg-purple-50 text-purple-800 border-purple-200 font-medium animate-pulse',
    RESOLVED: 'bg-emerald-50 text-emerald-800 border-emerald-300 font-medium',
    REOPENED: 'bg-rose-50 text-rose-800 border-rose-300 font-semibold',
    CLOSED: 'bg-slate-100 text-slate-700 border-slate-300',

    // Tasks
    UNASSIGNED: 'bg-slate-100 text-slate-600 border-slate-300',
    ASSIGNED: 'bg-blue-50 text-blue-700 border-blue-200',
    ACCEPTED: 'bg-teal-50 text-teal-800 border-teal-200 font-medium',
    BLOCKED: 'bg-amber-50 text-amber-800 border-amber-300 font-medium',
    COMPLETED: 'bg-emerald-50 text-emerald-800 border-emerald-300 font-medium',
    REJECTED: 'bg-red-50 text-red-800 border-red-300 font-medium',
    ESCALATED: 'bg-red-100 text-red-900 border-red-400 font-semibold',

    // Resources
    AVAILABLE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    BUSY: 'bg-amber-50 text-amber-800 border-amber-200',
    OFFLINE: 'bg-slate-100 text-slate-500 border-slate-300'
  };

  const style = styles[norm] || 'bg-slate-50 text-slate-700 border-slate-200';
  const label = norm.replace(/_/g, ' ');

  return (
    <span className={`inline-block px-2.5 py-0.5 rounded text-xs border ${style}`}>
      {label}
    </span>
  );
};

export default StatusBadge;
