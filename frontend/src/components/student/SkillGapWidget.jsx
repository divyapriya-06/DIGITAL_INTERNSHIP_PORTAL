import React from 'react';
import { Flame, CheckCircle2, AlertCircle, ArrowUpRight, Sparkles, BookOpen } from 'lucide-react';

export const SkillGapWidget = ({ skillGap, topIndustrySkills }) => {
  if (!skillGap) return null;

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/60">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              Industry Skill Gap Analysis
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Comparing your profile skills against live employer postings
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs font-bold uppercase text-slate-400 block">Market Readiness</span>
          <span className="text-lg font-black text-indigo-600">
            {skillGap.readinessScore || 75}%
          </span>
        </div>
      </div>

      {/* Recommended Skills to Learn */}
      {skillGap.recommendedSkillsToLearn && skillGap.recommendedSkillsToLearn.length > 0 && (
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            Recommended Skills to Learn Next:
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {skillGap.recommendedSkillsToLearn.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/70 to-purple-50/40 border border-indigo-100/80 hover:border-indigo-200 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-indigo-950">
                    {item.skill}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white text-[10px] font-extrabold">
                    {item.demandPercentage}% Demand
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {item.reason}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Acquired Skills Summary */}
      {skillGap.acquiredSkills && skillGap.acquiredSkills.length > 0 && (
        <div className="pt-2 border-t border-slate-100">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            In-Demand Skills You Already Possess:
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {skillGap.acquiredSkills.map((s, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-100 flex items-center gap-1"
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                {s.skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
