import React from 'react';
import {
  CheckCircle2,
  Clock,
  Video,
  XCircle,
  Calendar,
  Loader2,
  Star,
  Sparkles,
} from 'lucide-react';

/**
 * ApplicationTimeline — Compact & Refined Recruitment Stepper
 * Aligned with parent typography, subtle fonts, and distinct stage differentiation.
 */
export const ApplicationTimeline = ({
  application,
  onDeleteRejected,
  hideRounds = false,
}) => {
  if (!application) return null;

  const currentStatus = application.status || 'APPLIED';
  const isRejected = currentStatus === 'REJECTED';
  const isSelected = currentStatus === 'SELECTED';
  const isOnHold = currentStatus === 'ON_HOLD';

  const rounds = application.rounds || [];
  const activeRounds = rounds.filter(
    (r) => r.status === 'SCHEDULED' || r.status === 'CLEARED'
  );

  // Define progressive pipeline stages:
  // 1. Applied -> 2. Recruiter Review -> 3. Shortlisted -> 4. Interviews -> 5. Decision
  const getStageState = (stageKey) => {
    if (isRejected) {
      if (stageKey === 'decision') return 'rejected';
      return 'done';
    }

    if (isSelected) {
      return 'done';
    }

    switch (stageKey) {
      case 'applied':
        return 'done';

      case 'review':
        if (currentStatus === 'APPLIED') return 'active';
        if (currentStatus === 'UNDER_REVIEW') return 'active';
        return 'done';

      case 'shortlisted':
        if (currentStatus === 'APPLIED' || currentStatus === 'UNDER_REVIEW') return 'pending';
        if (currentStatus === 'SHORTLISTED') return 'active';
        return 'done';

      case 'interviews':
        if (['APPLIED', 'UNDER_REVIEW', 'SHORTLISTED'].includes(currentStatus)) return 'pending';
        if (['ROUND_1', 'ROUND_2', 'TECHNICAL', 'HR'].includes(currentStatus) || activeRounds.length > 0) {
          return 'active';
        }
        return 'done';

      case 'decision':
        if (isSelected) return 'done';
        if (isRejected) return 'rejected';
        if (isOnHold) return 'active';
        return 'pending';

      default:
        return 'pending';
    }
  };

  const steps = [
    {
      key: 'applied',
      label: 'Applied',
      sublabel: 'Submitted',
      date: application.createdAt
        ? new Date(application.createdAt).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
          })
        : null,
      state: 'done',
      icon: CheckCircle2,
    },
    {
      key: 'review',
      label: 'Recruiter Review',
      sublabel:
        currentStatus === 'APPLIED'
          ? 'In Queue'
          : currentStatus === 'UNDER_REVIEW'
          ? 'Evaluating Profile'
          : 'Reviewed',
      date: null,
      state: getStageState('review'),
      icon: getStageState('review') === 'active' ? Loader2 : CheckCircle2,
    },
    {
      key: 'shortlisted',
      label: 'Shortlisted',
      sublabel:
        getStageState('shortlisted') === 'pending'
          ? 'Awaiting'
          : getStageState('shortlisted') === 'active'
          ? 'Shortlisted'
          : 'Qualified',
      date: null,
      state: getStageState('shortlisted'),
      icon: getStageState('shortlisted') === 'active' ? Sparkles : CheckCircle2,
    },
    {
      key: 'interviews',
      label: 'Interviews',
      sublabel:
        activeRounds.length > 0
          ? `${activeRounds.length} Round${activeRounds.length > 1 ? 's' : ''}`
          : getStageState('interviews') === 'pending'
          ? 'Upcoming'
          : 'Completed',
      date: activeRounds[0]?.scheduledDate
        ? new Date(activeRounds[0].scheduledDate).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
          })
        : null,
      state: getStageState('interviews'),
      icon: Calendar,
    },
    {
      key: 'decision',
      label: isSelected
        ? 'Selected'
        : isRejected
        ? 'Closed'
        : isOnHold
        ? 'On Hold'
        : 'Offer Status',
      sublabel: isSelected
        ? 'Offer Released'
        : isRejected
        ? 'Not Selected'
        : isOnHold
        ? 'Pending Review'
        : 'Final Outcome',
      date: null,
      state: isSelected ? 'done' : isRejected ? 'rejected' : getStageState('decision'),
      icon: isSelected ? Star : isRejected ? XCircle : Clock,
    },
  ];

  // Visual classes for stepper nodes matching parent font
  const nodeStyles = {
    done: 'bg-emerald-500 text-white shadow-sm ring-2 ring-emerald-100',
    active: 'bg-indigo-600 text-white ring-2 ring-indigo-200 animate-pulse shadow-sm',
    rejected: 'bg-rose-500 text-white ring-2 ring-rose-100 shadow-sm',
    pending: 'bg-slate-100 text-slate-400 border border-slate-200',
  };

  const textStyles = {
    done: 'text-emerald-700 font-bold',
    active: 'text-indigo-600 font-bold',
    rejected: 'text-rose-600 font-bold',
    pending: 'text-slate-400 font-medium',
  };

  const bannerMap = {
    APPLIED: {
      text: 'Application submitted successfully. Awaiting initial recruiter review.',
      bg: 'bg-blue-50/80 border-blue-200/80 text-blue-900',
    },
    UNDER_REVIEW: {
      text: 'Recruiter is currently evaluating your qualifications and competencies.',
      bg: 'bg-amber-50/80 border-amber-200/80 text-amber-900',
    },
    SHORTLISTED: {
      text: 'Profile shortlisted! You will be notified when interview rounds are scheduled.',
      bg: 'bg-violet-50/80 border-violet-200/80 text-violet-900',
    },
    ROUND_1: {
      text: 'Round 1 interview session in progress. Review instructions and meeting link below.',
      bg: 'bg-indigo-50/80 border-indigo-200/80 text-indigo-900',
    },
    ROUND_2: {
      text: 'Round 2 interview scheduled. Please be prepared and join on time.',
      bg: 'bg-indigo-50/80 border-indigo-200/80 text-indigo-900',
    },
    TECHNICAL: {
      text: 'Technical evaluation round active. Meeting details are accessible below.',
      bg: 'bg-indigo-50/80 border-indigo-200/80 text-indigo-900',
    },
    HR: {
      text: 'HR discussion scheduled. Check your timing and credentials below.',
      bg: 'bg-indigo-50/80 border-indigo-200/80 text-indigo-900',
    },
    SELECTED: {
      text: '🎉 Offer Released! Congratulations on being selected for this position.',
      bg: 'bg-emerald-50/80 border-emerald-200/80 text-emerald-900',
    },
    REJECTED: {
      text: 'The recruiter did not move forward with this position. You can explore other opportunities.',
      bg: 'bg-rose-50/80 border-rose-200/80 text-rose-900',
    },
    ON_HOLD: {
      text: 'Application status is currently on hold pending hiring decisions.',
      bg: 'bg-amber-50/80 border-amber-200/80 text-amber-900',
    },
  };

  const banner = bannerMap[currentStatus] || bannerMap['APPLIED'];

  return (
    <div className="space-y-4 pt-1">
      {/* Top Header of the Tracker: Clean, subtle & typography aligned with parent */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
            Recruitment Progress
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
            {currentStatus.replace(/_/g, ' ')}
          </span>
        </div>

        {isRejected && onDeleteRejected && (
          <button
            onClick={() => onDeleteRejected(application._id)}
            className="text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:underline transition-colors"
          >
            Remove from list
          </button>
        )}
      </div>

      {/* STREAMLINED STEPPER TRACKER */}
      <div className="py-2 px-1">
        <div className="grid grid-cols-5 relative gap-2 sm:gap-4">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const nodeClass = nodeStyles[step.state] || nodeStyles.pending;
            const labelClass = textStyles[step.state] || textStyles.pending;
            const isLast = idx === steps.length - 1;
            const nextStep = steps[idx + 1];

            // Connector line state
            const isConnectorDone =
              step.state === 'done' &&
              (nextStep?.state === 'done' || nextStep?.state === 'active' || nextStep?.state === 'rejected');

            return (
              <div key={step.key} className="flex flex-col items-center text-center relative group">
                {/* Connecting line between nodes */}
                {!isLast && (
                  <div
                    className={`absolute top-3.5 left-1/2 w-full h-[2px] z-0 transition-colors ${
                      isConnectorDone
                        ? isRejected && nextStep?.state === 'rejected'
                          ? 'bg-rose-400'
                          : 'bg-emerald-400'
                        : 'bg-slate-200'
                    }`}
                  />
                )}

                {/* Micro Step Node */}
                <div
                  className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 ${nodeClass}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>

                {/* Labels: Reduced font size matching parent typography */}
                <div className="mt-2 space-y-0.5 max-w-[90px] sm:max-w-none">
                  <div className={`text-[11px] leading-tight ${labelClass}`}>
                    {step.label}
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium leading-tight hidden sm:block">
                    {step.sublabel}
                  </div>
                  {step.date && (
                    <div className="text-[9px] font-semibold text-slate-400">
                      {step.date}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Status Notice Banner — Compact & Refined */}
      <div className={`p-3 rounded-2xl border text-xs flex items-center gap-2.5 ${banner.bg}`}>
        <Clock className="w-3.5 h-3.5 shrink-0 opacity-70" />
        <span className="font-medium text-[11px] leading-relaxed">{banner.text}</span>
      </div>

      {/* Interview Rounds & Video Call Links (if active and not hideRounds) */}
      {!hideRounds && activeRounds.length > 0 && (
        <div className="space-y-2 pt-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Calendar className="w-3 h-3 text-indigo-500" />
            <span>Scheduled Rounds</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {activeRounds.map((round, i) => (
              <div
                key={i}
                className="p-3 rounded-2xl bg-white border border-indigo-100 shadow-sm flex flex-col justify-between gap-2.5"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-bold">
                      Round {round.roundNumber}
                    </span>
                    {round.status === 'CLEARED' ? (
                      <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3" /> Cleared
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-amber-600">
                        Scheduled
                      </span>
                    )}
                  </div>

                  <h5 className="text-xs font-bold text-slate-900 leading-tight">
                    {round.name}
                  </h5>

                  {round.scheduledDate && (
                    <p className="text-[10px] text-slate-500 flex items-center gap-1 font-medium">
                      <Clock className="w-3 h-3 text-indigo-400" />
                      <span>
                        {new Date(round.scheduledDate).toLocaleString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </p>
                  )}

                  {round.instructions && (
                    <p className="text-[10px] text-slate-500 italic">
                      "{round.instructions}"
                    </p>
                  )}
                </div>

                {round.meetingLink && (
                  <a
                    href={round.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] shadow-sm transition-all"
                  >
                    <Video className="w-3 h-3" />
                    <span>Join Meeting</span>
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recruiter Feedback Note */}
      {application.feedback && (
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 text-[11px] text-slate-600">
          <span className="font-bold text-slate-800">Recruiter Note: </span>
          "{application.feedback}"
        </div>
      )}
    </div>
  );
};
