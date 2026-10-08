import React, { useState } from 'react';
import {
  Building2,
  MapPin,
  Calendar,
  IndianRupee,
  Sparkles,
  ChevronRight,
  Star,
  CheckCircle,
  HelpCircle,
  Clock,
} from 'lucide-react';
import { WorkModeBadge } from '../common/Badge';
import { ExplainableMatchModal } from './ExplainableMatchModal';

export const InternshipCard = ({ internship, onApply, isApplying, onViewDetails }) => {
  const [showExplainModal, setShowExplainModal] = useState(false);

  const isApplied = internship.hasApplied || internship.appliedStatus;
  const matchScore = internship.matchPercentage;

  const getMatchScoreBadge = (score) => {
    if (!score) return null;
    let colorClass = 'bg-indigo-50 text-indigo-700 border-indigo-200';
    if (score >= 85) colorClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    else if (score >= 70) colorClass = 'bg-blue-50 text-blue-700 border-blue-200';

    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowExplainModal(true);
        }}
        className={`ai-match-badge inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border ${colorClass} shadow-sm hover:scale-105 transition-all`}
        title="Click to view AI Match Explanation"
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>{score}% Match</span>
        <HelpCircle className="w-3 h-3 opacity-60 ml-0.5" />
      </button>
    );
  };

  return (
    <>
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between h-full group">
        <div className="flex-1 flex flex-col">
          {/* Top Row: Company & Match Badge */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200/60 flex items-center justify-center text-indigo-600 font-extrabold text-sm shadow-inner shrink-0 group-hover:bg-indigo-50 transition-colors overflow-hidden">
                {internship.industry?.logo ? (
                  <img src={internship.industry.logo} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  internship.industry?.companyName?.slice(0, 2).toUpperCase() || 'CO'
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide truncate max-w-[135px]" title={internship.industry?.companyName}>
                    {internship.industry?.companyName || 'Verified Partner'}
                  </h4>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 font-bold text-[10px] border border-amber-200/80 shrink-0">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{internship.industry?.averageRating ? Number(internship.industry.averageRating).toFixed(1) : '4.8'}</span>
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1 mt-0.5" title={internship.role}>
                  {internship.role}
                </h3>
              </div>
            </div>
            {matchScore && (
              <div className="shrink-0">
                {getMatchScoreBadge(matchScore)}
              </div>
            )}
          </div>

          {/* Location, Mode & Duration */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 mb-3 min-h-[28px]">
            <span className="flex items-center gap-1 bg-slate-100/80 px-2.5 py-1 rounded-xl">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span className="truncate max-w-[110px]">{internship.location}</span>
            </span>
            <WorkModeBadge mode={internship.workMode} />
            <span className="flex items-center gap-1 bg-slate-100/80 px-2.5 py-1 rounded-xl">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{internship.duration}</span>
            </span>
          </div>

          {/* Description snippet */}
          <p className="text-xs text-slate-600 line-clamp-2 mb-3 leading-relaxed min-h-[36px]">
            {internship.description}
          </p>

          {/* Required Skills */}
          <div className="mb-4 min-h-[52px]">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Required Skills
            </p>
            <div className="flex flex-wrap gap-1.5">
              {(internship.requiredSkills || []).slice(0, 4).map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 rounded-lg text-[11px] font-semibold border border-indigo-100"
                >
                  {skill}
                </span>
              ))}
              {(internship.requiredSkills || []).length > 4 && (
                <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-lg text-[11px] font-semibold">
                  +{(internship.requiredSkills.length - 4)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Footer: Stipend & Actions */}
        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Stipend</span>
            <span className="text-sm font-extrabold text-slate-900 flex items-center">
              ₹{internship.stipend?.toLocaleString()}
              <span className="text-[11px] font-medium text-slate-500 ml-1">/mo</span>
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onViewDetails && (
              <button
                onClick={() => onViewDetails(internship)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 hover:border-slate-300 transition-colors"
              >
                Details
              </button>
            )}

            {isApplied ? (
              <button
                disabled
                className="px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-xs flex items-center gap-1 cursor-default"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                Applied
              </button>
            ) : (
              <button
                onClick={() => onApply(internship._id)}
                disabled={isApplying}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 transition-all hover:shadow-indigo-300 active:scale-95 disabled:opacity-50"
              >
                {isApplying ? 'Applying...' : 'Apply'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Explainable AI Modal */}
      <ExplainableMatchModal
        isOpen={showExplainModal}
        onClose={() => setShowExplainModal(false)}
        internship={internship}
      />
    </>
  );
};
