import React, { useState } from 'react';
import { FIELD_TAXONOMY } from '../student/SkillDemandPage';
import {
  Flame,
  BarChart3,
  Award,
  CheckCircle2,
  Cpu,
  Zap,
  Radio,
  Cog,
  HeartPulse,
  Building,
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

export const AdminSkillDemandPage = () => {
  const [selectedField, setSelectedField] = useState('cse');

  const currentField = FIELD_TAXONOMY[selectedField] || FIELD_TAXONOMY.cse;
  const FieldIcon = currentField.icon;

  const chartData = currentField.skills.map((s) => ({
    name: s.name,
    count: s.count,
    percentage: s.percentage,
    color: s.color,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Institutional Skill Demand Intelligence
        </h2>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Curriculum alignment analytics: View technical skills, framework requirements, and hiring velocity across 6 key disciplines.
        </p>
      </div>

      {/* Discipline Selector */}
      <div className="bg-white rounded-3xl p-3 border border-slate-200/80 shadow-sm">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 pt-1 pb-2">
          Select Discipline / Department:
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {Object.values(FIELD_TAXONOMY).map((f) => {
            const Icon = f.icon;
            const isSelected = selectedField === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setSelectedField(f.id)}
                className={`p-3 rounded-2xl flex flex-col items-center justify-center text-center gap-1.5 transition-all duration-200 border ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200 scale-[1.02]'
                    : 'bg-slate-50/80 hover:bg-slate-100 text-slate-700 border-slate-200/60'
                }`}
              >
                <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-slate-600'}`} />
                <span className="text-xs font-extrabold leading-tight">{f.shortName}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Field Overview Banner */}
      <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-700 border border-indigo-100">
            <FieldIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">{currentField.name}</h3>
            <p className="text-xs text-slate-500 font-medium">{currentField.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-extrabold border border-emerald-200">
            Hiring Velocity: {currentField.growthRate}
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-800 text-xs font-extrabold border border-indigo-200">
            Stipend Range: {currentField.avgStipend}
          </span>
        </div>
      </div>

      {/* Top Skills Grid */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card space-y-4">
        <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
          <Flame className="w-5 h-5 text-amber-500" />
          Ranked Industry Skills in {currentField.shortName}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {currentField.skills.map((s, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Rank #{idx + 1}</span>
                <h4 className="text-sm font-black text-slate-900 mt-0.5">{s.name}</h4>
                <span className="text-[11px] text-slate-500">{s.count} Requisitions ({s.percentage}%)</span>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-black bg-indigo-50 text-indigo-700 border border-indigo-200">
                High
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Chart and Roles */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900">
              Demand Distribution Chart - {currentField.shortName}
            </h3>
            <BarChart3 className="w-5 h-5 text-slate-400" />
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} interval={0} angle={-15} textAnchor="end" height={60} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card space-y-3">
          <h3 className="text-base font-extrabold text-slate-900">Top Recruited Roles</h3>
          <div className="space-y-2">
            {currentField.topRoles.map((r, i) => (
              <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-slate-50 text-xs font-bold">
                <span className="text-slate-800">{r.role}</span>
                <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{r.openings} open</span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};
