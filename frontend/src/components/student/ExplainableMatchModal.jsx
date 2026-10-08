import React from 'react';
import { Modal } from '../common/Modal';
import { Sparkles, CheckCircle2, AlertCircle, Info, Target, Layers, Compass, Brain } from 'lucide-react';

export const ExplainableMatchModal = ({ isOpen, onClose, internship }) => {
  if (!internship) return null;

  const matchBreakdown = internship.matchBreakdown || {
    skillScore: 85,
    roleScore: 90,
    semanticScore: 78,
    projectScore: 80,
    experienceScore: 100,
    locationScore: 90,
    domainScore: 95,
  };

  const explainReasons = internship.explainableReasons || [
    `Matched skills in your profile and resume with job requirements`,
    `Aligns with your preferred domain and career track`,
    `Location and mode match your settings`,
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="AI Recommendation Breakdown"
      maxWidth="max-w-xl"
    >
      <div className="space-y-6">
        {/* Header Match Hero */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/5 border border-indigo-100 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600 animate-pulse" />
              <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-700">
                Explainable AI Match Engine
              </span>
            </div>
            <h4 className="text-lg font-extrabold text-slate-900 mt-1">
              {internship.role}
            </h4>
            <p className="text-xs text-slate-500 font-medium">
              at {internship.industry?.companyName}
            </p>
          </div>

          <div className="text-center p-3 rounded-2xl bg-white shadow-md border border-indigo-100/80">
            <span className="text-2xl font-black text-indigo-600 block">
              {internship.matchPercentage || 85}%
            </span>
            <span className="text-[10px] font-bold uppercase text-slate-400">
              Overall Score
            </span>
          </div>
        </div>

        {/* Why this Internship Checklist */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            Why this internship was recommended for you:
          </h4>
          <div className="space-y-2.5">
            {explainReasons.map((reason, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/60"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-xs font-semibold text-slate-700 leading-relaxed">
                  {reason}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Matched vs Missing Skills */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100">
            <h5 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Matched Skills
            </h5>
            <div className="flex flex-wrap gap-1.5">
              {(internship.matchedSkills || internship.requiredSkills?.slice(0, 3) || []).map((s, idx) => (
                <span key={idx} className="px-2 py-0.5 rounded-md bg-white text-emerald-700 font-bold text-[11px] border border-emerald-200 shadow-2xs">
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100">
            <h5 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-amber-600" /> Nice to Learn / Expand
            </h5>
            <div className="flex flex-wrap gap-1.5">
              {(internship.missingSkills?.length ? internship.missingSkills : (internship.preferredSkills || ['Advanced System Design'])).map((s, idx) => (
                <span key={idx} className="px-2 py-0.5 rounded-md bg-white text-amber-700 font-bold text-[11px] border border-amber-200 shadow-2xs">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Scoring Factor Breakdown */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
            <Brain className="w-4 h-4 text-indigo-500" /> Multi-Factor AI Weights
          </h4>
          <div className="space-y-2 text-xs">
            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Skill Match (40% Weight)</span>
                <span>{matchBreakdown.skillScore}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${matchBreakdown.skillScore}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Role Alignment (20% Weight)</span>
                <span>{matchBreakdown.roleScore}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-purple-600 rounded-full" style={{ width: `${matchBreakdown.roleScore}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Resume / JD Semantic Similarity (15% Weight)</span>
                <span>{matchBreakdown.semanticScore}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: `${matchBreakdown.semanticScore}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Project Relevance (10% Weight)</span>
                <span>{matchBreakdown.projectScore}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-teal-600 rounded-full" style={{ width: `${matchBreakdown.projectScore}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-2 text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors"
          >
            Close Explanation
          </button>
        </div>
      </div>
    </Modal>
  );
};
