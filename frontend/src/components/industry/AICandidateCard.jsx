import React, { useState } from 'react';
import {
  Sparkles,
  GraduationCap,
  Award,
  FileText,
  CheckCircle2,
  XCircle,
  MapPin,
  Calendar,
  Layers,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  User,
} from 'lucide-react';

export const AICandidateCard = ({ candidate, onSelectRound, onViewResume, internshipId }) => {
  if (!candidate) return null;

  const [isExpanded, setIsExpanded] = useState(false);
  const student = candidate.student;
  const matchScore = candidate.matchPercentage;

  const getScoreBadge = (score) => {
    let colorClass = 'bg-indigo-50 text-indigo-700 border-indigo-200';
    if (score >= 90) colorClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    else if (score >= 75) colorClass = 'bg-blue-50 text-blue-700 border-blue-200';

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold border ${colorClass} shadow-sm shrink-0`}>
        <Sparkles className="w-3.5 h-3.5" />
        <span>{score}% Match</span>
      </span>
    );
  };

  return (
    <div
      className={`bg-white rounded-3xl p-5 border transition-all duration-300 shadow-card hover:shadow-md ${
        isExpanded ? 'border-indigo-300 ring-2 ring-indigo-50' : 'border-slate-200/80 hover:border-indigo-200'
      }`}
    >
      {/* Primary Display: Student Name, Avatar & Match score (Click to toggle details) */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between gap-3 cursor-pointer select-none"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-extrabold text-sm shadow-md shadow-indigo-200 shrink-0">
            {student.fullName ? student.fullName.slice(0, 2).toUpperCase() : 'ST'}
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-extrabold text-slate-900 truncate hover:text-indigo-600 transition-colors">
              {student.fullName}
            </h3>
            <span className="text-[11px] font-semibold text-slate-400 block mt-0.5">
              {isExpanded ? 'Click to collapse details' : 'Click to view profile & qualifications'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {getScoreBadge(matchScore)}
          <button
            type="button"
            className={`p-1.5 rounded-xl transition-colors ${
              isExpanded ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Details Section: Revealed only when clicked */}
      {isExpanded && (
        <div className="pt-4 mt-4 border-t border-slate-100 space-y-4 animate-in fade-in duration-200">
          {/* Degree, Department & CGPA */}
          <div className="p-3 rounded-2xl bg-indigo-50/50 border border-indigo-100/60">
            <p className="text-xs text-slate-700 font-semibold flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>
                {student.degree} {student.department}
              </span>
            </p>
            <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-600 font-medium">
              <span>
                CGPA: <strong className="text-slate-900">{student.cgpa || '8.5'}</strong>
              </span>
              <span>•</span>
              <span className="truncate">{student.college}</span>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{student.location || 'Chennai, Tamil Nadu'}</span>
          </div>

          {/* Matched Skills */}
          {candidate.matchedSkills && candidate.matchedSkills.length > 0 && (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block mb-1.5">
                Matched Competencies:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {candidate.matchedSkills.map((sk, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-100"
                  >
                    {sk}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Academic Highlight Project */}
          {student.projects && student.projects.length > 0 && (
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60">
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">
                Highlight Project:
              </span>
              <h5 className="text-xs font-bold text-slate-800 line-clamp-1">
                {student.projects[0].title}
              </h5>
              <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
                {student.projects[0].description}
              </p>
            </div>
          )}

          {/* Actions Bar */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
            {student.resumePath ? (
              <a
                href={`/${student.resumePath}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-indigo-500" />
                <span>Resume PDF</span>
              </a>
            ) : (
              <span className="text-[11px] text-slate-400 italic">No resume attached</span>
            )}

            {onSelectRound && (
              <button
                onClick={() => onSelectRound(candidate)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 transition-all active:scale-95 flex items-center gap-1.5"
              >
                <span>Advance to Round</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
