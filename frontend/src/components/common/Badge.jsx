import React from 'react';

export const StatusBadge = ({ status }) => {
  const statusConfig = {
    // Application statuses
    APPLIED: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: 'Applied' },
    UNDER_REVIEW: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Under Review' },
    SHORTLISTED: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', label: 'Shortlisted' },
    ROUND_1: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', label: 'Round 1' },
    ROUND_2: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', label: 'Round 2' },
    TECHNICAL: { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', label: 'Technical Round' },
    HR: { bg: 'bg-fuchsia-50', text: 'text-fuchsia-700', border: 'border-fuchsia-200', label: 'HR Round' },
    SELECTED: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Selected / Placed' },
    ON_HOLD: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', label: 'On Hold' },
    REJECTED: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', label: 'Not Selected' },
    
    // Verification statuses
    PENDING: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Pending Verification' },
    APPROVED: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Verified & Approved' },

    // Internship statuses
    OPEN: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Active & Open' },
    FILLED: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300', label: 'Positions Filled' },
    CLOSED: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', label: 'Closed' },
  };

  const current = statusConfig[status] || { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', label: status };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border ${current.bg} ${current.text} ${current.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${current.text.replace('text-', 'bg-')}`} />
      {current.label}
    </span>
  );
};

export const WorkModeBadge = ({ mode }) => {
  const map = {
    REMOTE: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200', label: 'Remote' },
    HYBRID: { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200', label: 'Hybrid' },
    ON_SITE: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200', label: 'On-Site' },
  };
  const current = map[mode] || { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200', label: mode };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold border ${current.bg} ${current.text} ${current.border}`}>
      {current.label}
    </span>
  );
};
