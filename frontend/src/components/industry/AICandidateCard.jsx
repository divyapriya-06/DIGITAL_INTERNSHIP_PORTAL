import React from 'react';
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
} from 'lucide-react';

export const AICandidateCard = ({ candidate, onSelectRound, onViewResume, internshipId }) => {
  if (!candidate) return null;

  const student = candidate.student;
  const matchScore = candidate.matchPercentage;

  const getScoreBadge = (score) => {
    let colorClass = 'bg-indigo-50 text-indigo-700 border-indigo-200';
    if (score >= 90) colorClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    else if (score >= 75) colorClass = 'bg-blue-50 text-blue-700 border-blue-200';

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold border ${colorClass} shadow-sm`}>
        <Sparkles className="w-3.5 h-3.5" />
        <span>{score}% Match</span>
      </span>
    );
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between group">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-extrabold text-sm shadow-md shrink-0">
              {student.fullName ? student.fullName.slice(0, 2).toUpperCase() : 'ST'}
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
                {student.fullName}
              </h3>
              <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
                {student.degree} {student.department} • CGPA: <span className="font-bold text-slate-800">{student.cgpa || '8.5'}</span>
              </p>
            </div>
          </div>
          {getScoreBadge(matchScore)}
        </div>

        {/* College & Location */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 mb-4">
          <span className="bg-slate-100/80 px-2.5 py-1 rounded-xl">
            {student.college}
          </span>
          <span className="flex items-center gap-1 bg-slate-100/80 px-2.5 py-1 rounded-xl">
            <MapPin className="w-3 h-3 text-slate-400" />
            {student.location || 'Chennai'}
          </span>
        </div>

        {/* Matched vs Missing Skills */}
        <div className="space-y-2 mb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block mb-1">
              Matched Skills:
            </span>
            <div className="flex flex-wrap gap-1">
              {(candidate.matchedSkills || []).slice(0, 5).map((sk, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-100"
                >
                  {sk}
                </span>
              ))}
            </div>
          </div>

        </div>

        {/* Academic Project snippet */}
        {student.projects && student.projects.length > 0 && (
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60 mb-4">
            <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">
              Highlight Project:
            </span>
            <h5 className="text-xs font-bold text-slate-800 line-clamp-1">
              {student.projects[0].title}
            </h5>
            <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
              {student.projects[0].description}
            </p>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
        {student.resumePath ? (
          <a
            href={`/${student.resumePath}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-indigo-500" />
            Resume
          </a>
        ) : (
          <span className="text-[11px] text-slate-400 italic">No resume PDF</span>
        )}

        <div className="flex items-center gap-2">
          {onSelectRound && (
            <button
              onClick={() => onSelectRound(candidate)}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 transition-all active:scale-95 flex items-center gap-1"
            >
              <span>Manage Stage</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
