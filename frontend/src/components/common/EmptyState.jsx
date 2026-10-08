import React from 'react';
import { Package } from 'lucide-react';

export const EmptyState = ({ title, description, actionLabel, onAction, icon: Icon }) => {
  const IconComponent = Icon || Package;
  
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mb-4 shadow-inner">
        <IconComponent className="w-8 h-8" />
      </div>
      <h3 className="text-base font-extrabold text-slate-900 mb-1">{title}</h3>
      <p className="text-xs text-slate-500 font-medium max-w-sm leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-6 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 transition-all"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
