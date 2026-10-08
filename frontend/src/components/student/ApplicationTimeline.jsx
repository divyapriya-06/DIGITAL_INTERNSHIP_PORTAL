import React from 'react';
import {
  CheckCircle2,
  Clock,
  Circle,
  Video,
  XCircle,
  Trash2,
  Calendar,
  Loader2,
  Star,
} from 'lucide-react';
import { StatusBadge } from '../common/Badge';

/**
 * ApplicationTimeline — Dynamic progressive tracker.
 * Only shows stages the candidate has actually REACHED.
 * Future rounds are never pre-rendered.
 */
export const ApplicationTimeline = ({ application, onDeleteRejected }) => {
  if (!application) return null;

  const currentStatus = application.status || 'APPLIED';
  const isRejected = currentStatus === 'REJECTED';
  const isSelected = currentStatus === 'SELECTED';
  const isOnHold = currentStatus === 'ON_HOLD';

  // Only show rounds that have been SCHEDULED or CLEARED (i.e. industry actually acted on them)
  const activeRounds = (application.rounds || []).filter(
    (r) => r.status === 'SCHEDULED' || r.status === 'CLEARED'
  );

  // ─── Build the progressive timeline steps ───────────────────────────────────
  // Rules:
  // 1. "Applied" is always Step 1 — DONE
  // 2. "Under Review" appears only if status != APPLIED — current or done
  // 3. "Shortlisted" appears only if status is SHORTLISTED or beyond
  // 4. Each individual round appears only if industry has scheduled/cleared it
  // 5. "Selected" / "Not Selected" appears only on final decision
  // 6. "On Hold" appears only when on hold

  const steps = [];

  // Step 1: Applied — always present, always completed
  steps.push({
    key: 'applied',
    label: 'Applied',
    sublabel: 'Application submitted',
    date: application.createdAt
      ? new Date(application.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
      : null,
    state: 'done', // done | active | pending
    icon: CheckCircle2,
    color: 'emerald',
  });

  // Step 2: Under Review — appears as soon as status moves beyond APPLIED
  if (currentStatus !== 'APPLIED') {
    const isCurrentStep =
      currentStatus === 'UNDER_REVIEW';
    const isDone = !isCurrentStep;
    steps.push({
      key: 'review',
      label: 'Recruiter Review',
      sublabel: isCurrentStep ? 'Being evaluated…' : 'Profile evaluated',
      date: null,
      state: isCurrentStep ? 'active' : 'done',
      icon: isCurrentStep ? Loader2 : CheckCircle2,
      color: isCurrentStep ? 'indigo' : 'emerald',
    });
  }

  // Step 3: Shortlisted — appears only if SHORTLISTED or beyond
  const shortlistStatuses = ['SHORTLISTED', 'ROUND_1', 'ROUND_2', 'TECHNICAL', 'HR', 'SELECTED', 'REJECTED'];
  if (shortlistStatuses.includes(currentStatus)) {
    const isCurrentStep = currentStatus === 'SHORTLISTED';
    steps.push({
      key: 'shortlisted',
      label: 'Shortlisted',
      sublabel: isCurrentStep ? 'Awaiting interview schedule' : 'Profile shortlisted ✓',
      date: null,
      state: isCurrentStep ? 'active' : 'done',
      icon: isCurrentStep ? Loader2 : CheckCircle2,
      color: isCurrentStep ? 'violet' : 'emerald',
    });
  }

  // Step 4+: Interview rounds — each round only if SCHEDULED or CLEARED
  const roundStatuses = ['ROUND_1', 'ROUND_2', 'TECHNICAL', 'HR', 'SELECTED', 'REJECTED'];
  if (roundStatuses.includes(currentStatus) || activeRounds.length > 0) {
    activeRounds.forEach((round) => {
      const isCleared = round.status === 'CLEARED';
      const isScheduled = round.status === 'SCHEDULED';
      steps.push({
        key: `round_${round.roundNumber}`,
        label: `Round ${round.roundNumber}: ${round.name}`,
        sublabel: isCleared
          ? 'Cleared ✓'
          : `Scheduled ${round.scheduledDate ? '— ' + new Date(round.scheduledDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : ''}`,
        date: round.scheduledDate ? new Date(round.scheduledDate).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : null,
        state: isCleared ? 'done' : 'active',
        icon: isCleared ? CheckCircle2 : Calendar,
        color: isCleared ? 'emerald' : 'indigo',
        round, // attach round data for the detail card below
      });
    });
  }

  // Final step: Selected / Rejected / On Hold
  if (isSelected) {
    steps.push({
      key: 'selected',
      label: '🎉 Selected!',
      sublabel: 'Offer extended — check your email',
      date: null,
      state: 'done',
      icon: Star,
      color: 'emerald',
    });
  } else if (isRejected) {
    steps.push({
      key: 'rejected',
      label: 'Not Selected',
      sublabel: 'Recruiter did not move forward',
      date: null,
      state: 'rejected',
      icon: XCircle,
      color: 'rose',
    });
  } else if (isOnHold) {
    steps.push({
      key: 'onhold',
      label: 'On Hold',
      sublabel: 'Decision deferred by recruiter',
      date: null,
      state: 'active',
      icon: Clock,
      color: 'amber',
    });
  }

  // ─── Progress bar pct ───────────────────────────────────────────────────────
  // Percentage of how far through the steps we are
  const doneCount = steps.filter((s) => s.state === 'done').length;
  const totalCount = steps.length;
  const progressPct = totalCount > 1 ? Math.round((doneCount / (totalCount - 1)) * 100) : 100;

  // ─── Color helpers ──────────────────────────────────────────────────────────
  const nodeClasses = {
    done: 'bg-emerald-500 text-white shadow-md shadow-emerald-200 ring-2 ring-emerald-100',
    active: 'bg-white border-2 border-indigo-600 text-indigo-600 ring-4 ring-indigo-100',
    rejected: 'bg-rose-500 text-white shadow-md shadow-rose-200',
    pending: 'bg-slate-100 text-slate-400 border border-slate-200',
  };
  const labelClasses = {
    done: 'text-emerald-800',
    active: 'text-indigo-700',
    rejected: 'text-rose-700',
    pending: 'text-slate-400',
  };

  // ─── Banner text ────────────────────────────────────────────────────────────
  const bannerMap = {
    APPLIED: { text: 'Your application is awaiting recruiter review.', bg: 'bg-blue-50 border-blue-200 text-blue-800' },
    UNDER_REVIEW: { text: 'Recruiter is currently evaluating your profile and skills.', bg: 'bg-amber-50 border-amber-200 text-amber-800' },
    SHORTLISTED: { text: '🎯 Shortlisted! The recruiter will schedule your interview round shortly.', bg: 'bg-violet-50 border-violet-200 text-violet-800' },
    ROUND_1: { text: 'Interview in progress — Round 1 scheduled. Check below for meeting details.', bg: 'bg-indigo-50 border-indigo-200 text-indigo-800' },
    ROUND_2: { text: 'Interview in progress — Round 2 scheduled. Check below for meeting details.', bg: 'bg-indigo-50 border-indigo-200 text-indigo-800' },
    TECHNICAL: { text: 'Technical round scheduled. Review the meeting details below.', bg: 'bg-indigo-50 border-indigo-200 text-indigo-800' },
    HR: { text: 'HR round scheduled. Review the meeting details below.', bg: 'bg-indigo-50 border-indigo-200 text-indigo-800' },
    SELECTED: { text: '🎉 Congratulations! You have been selected. Expect a formal offer email shortly.', bg: 'bg-emerald-50 border-emerald-200 text-emerald-800' },
    REJECTED: { text: 'The recruiter has decided not to move forward. Keep applying — the right opportunity is ahead!', bg: 'bg-rose-50 border-rose-200 text-rose-800' },
    ON_HOLD: { text: 'Your application is on hold. The recruiter will update you soon.', bg: 'bg-amber-50 border-amber-200 text-amber-800' },
  };
  const banner = bannerMap[currentStatus] || bannerMap['APPLIED'];

  // Rounds with meeting links (for the detail cards at the bottom)
  const roundsWithDetails = steps.filter((s) => s.round);

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card space-y-6">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {application.internship?.industry?.companyName || application.industry?.companyName}
            </span>
            <StatusBadge status={application.status} />
          </div>
          <h3 className="text-lg font-extrabold text-slate-900 mt-1">
            {application.internship?.role || 'Internship Role'}
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            Applied on: {new Date(application.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        </div>

        {isRejected && onDeleteRejected && (
          <button
            onClick={() => onDeleteRejected(application._id)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors border border-rose-200"
          >
            <Trash2 className="w-4 h-4 text-rose-500" />
            <span>Delete Application</span>
          </button>
        )}
      </div>

      {/* ── Dynamic Progressive Timeline ───────────────────────────────────── */}
      <div className="relative py-4 px-2">
        {/* Base track */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200 rounded-full z-0" style={{ top: '28px', bottom: '28px' }} />

        {/* Green progress track overlay */}
        <div
          className={`absolute left-4 w-0.5 rounded-full z-0 transition-all duration-700 ${
            isRejected ? 'bg-rose-400' : 'bg-gradient-to-b from-emerald-500 to-teal-500'
          }`}
          style={{
            top: '28px',
            height: `${progressPct}%`,
            maxHeight: 'calc(100% - 56px)',
          }}
        />

        <div className="space-y-6 relative z-10">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const nodeClass = nodeClasses[step.state] || nodeClasses.pending;
            const labelClass = labelClasses[step.state] || labelClasses.pending;
            const isActiveAnim = step.state === 'active';

            return (
              <div key={step.key} className="flex items-start gap-4">
                {/* Node */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold transition-all duration-300 ${nodeClass} ${
                    isActiveAnim && step.key !== 'onhold' ? 'animate-pulse' : ''
                  } ${isSelected && step.key === 'selected' ? 'animate-bounce' : ''}`}
                >
                  <Icon className={`w-4 h-4 ${isActiveAnim ? 'animate-spin' : ''}`}
                    style={step.icon !== Loader2 ? { animation: 'none' } : {}}
                  />
                </div>

                {/* Label + sub */}
                <div className="flex-1 pt-1">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className={`text-sm font-bold ${labelClass}`}>{step.label}</span>
                    {step.date && (
                      <span className="text-[10px] font-semibold text-slate-400 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md">
                        {step.date}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{step.sublabel}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Status Banner ──────────────────────────────────────────────────── */}
      <div className={`p-3.5 rounded-2xl border text-xs flex items-center gap-3 ${banner.bg}`}>
        <Clock className="w-4 h-4 shrink-0" />
        <span className="font-medium">{banner.text}</span>
      </div>

      {/* ── Round Detail Cards (only for scheduled/cleared rounds) ─────────── */}
      {roundsWithDetails.length > 0 && (
        <div className="space-y-3 pt-1">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-indigo-500" />
            Interview Round Details
          </h4>
          <div className="space-y-3">
            {roundsWithDetails.map(({ round }, i) => (
              <div
                key={i}
                className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white text-[10px] font-extrabold uppercase">
                      Round {round.roundNumber}
                    </span>
                    <h5 className="text-sm font-bold text-slate-900">{round.name}</h5>
                    {round.status === 'CLEARED' && (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 text-[10px] font-extrabold">
                        Cleared ✓
                      </span>
                    )}
                  </div>
                  {round.scheduledDate && (
                    <p className="text-xs text-slate-600 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-500" />
                      Scheduled:{' '}
                      <span className="font-semibold">
                        {new Date(round.scheduledDate).toLocaleString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </span>
                    </p>
                  )}
                  {round.instructions && (
                    <p className="text-xs text-slate-500 italic mt-1">
                      Note: "{round.instructions}"
                    </p>
                  )}
                </div>

                {round.meetingLink && (
                  <a
                    href={round.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 transition-all"
                  >
                    <Video className="w-4 h-4" />
                    Join Meeting
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Congratulations Banner (Selected) ─────────────────────────────── */}
      {isSelected && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/5 border border-emerald-200 flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-emerald-500 text-white shrink-0 shadow-md shadow-emerald-200">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-emerald-900">
              🎉 Congratulations on your Selection!
            </h4>
            <p className="text-xs text-emerald-700 mt-0.5">
              You have been selected for this position. The recruiter will reach out with the onboarding schedule and formal offer letter.
            </p>
          </div>
        </div>
      )}

      {/* ── Recruiter Feedback ─────────────────────────────────────────────── */}
      {application.feedback && (
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700">
          <span className="font-bold text-slate-900 block mb-1">Recruiter Feedback:</span>
          "{application.feedback}"
        </div>
      )}
    </div>
  );
};
