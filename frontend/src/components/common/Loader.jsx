import React from 'react';
import { Sparkles, Inbox } from 'lucide-react';

export const Loader = ({ message = 'Loading intelligent insights...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-4">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-indigo-600 animate-pulse" />
        </div>
      </div>
      <p className="text-xs font-semibold text-slate-500 animate-pulse">{message}</p>
    </div>
  );
};

export const EmptyState = ({ title = 'No records found', description, actionLabel, onAction, icon: Icon = Inbox }) => {
  return (
    <div className="flex flex-col items-center justify-center p-10 text-center bg-white rounded-3xl border border-dashed border-slate-200">
      <div className="p-4 rounded-2xl bg-slate-50 text-slate-400 mb-3">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-base font-bold text-slate-800">{title}</h3>
      {description && <p className="text-xs text-slate-500 mt-1 max-w-sm">{description}</p>}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-md shadow-indigo-100 hover:bg-indigo-700 transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
