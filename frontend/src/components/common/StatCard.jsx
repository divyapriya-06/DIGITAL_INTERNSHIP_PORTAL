import React from 'react';

export const StatCard = ({ title, value, subtitle, icon: Icon, color = 'indigo', trend }) => {
  const colorMap = {
    indigo: {
      bg: 'bg-indigo-50/80',
      text: 'text-indigo-600',
      border: 'border-indigo-100',
      gradient: 'from-indigo-500/10 to-indigo-500/0',
    },
    emerald: {
      bg: 'bg-emerald-50/80',
      text: 'text-emerald-600',
      border: 'border-emerald-100',
      gradient: 'from-emerald-500/10 to-emerald-500/0',
    },
    purple: {
      bg: 'bg-purple-50/80',
      text: 'text-purple-600',
      border: 'border-purple-100',
      gradient: 'from-purple-500/10 to-purple-500/0',
    },
    amber: {
      bg: 'bg-amber-50/80',
      text: 'text-amber-600',
      border: 'border-amber-100',
      gradient: 'from-amber-500/10 to-amber-500/0',
    },
    rose: {
      bg: 'bg-rose-50/80',
      text: 'text-rose-600',
      border: 'border-rose-100',
      gradient: 'from-rose-500/10 to-rose-500/0',
    },
    blue: {
      bg: 'bg-blue-50/80',
      text: 'text-blue-600',
      border: 'border-blue-100',
      gradient: 'from-blue-500/10 to-blue-500/0',
    },
  };

  const scheme = colorMap[color] || colorMap.indigo;

  return (
    <div className="relative overflow-hidden bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all duration-300 group">
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${scheme.gradient} rounded-bl-full pointer-events-none`} />
      
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {title}
          </p>
          <h3 className="text-2xl font-extrabold text-slate-800 mt-1 tracking-tight">
            {value}
          </h3>
        </div>
        {Icon && (
          <div className={`p-3 rounded-2xl ${scheme.bg} ${scheme.text} shadow-sm group-hover:scale-110 transition-transform duration-200`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 flex items-center gap-2 text-xs">
          {trend && (
            <span className="font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
              {trend}
            </span>
          )}
          {subtitle && (
            <span className="text-slate-500 font-medium">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
