import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Calendar, Video, Clock, CheckCircle2, User, FileText, Send } from 'lucide-react';
import api from '../../services/api';

export const RoundScheduleModal = ({ isOpen, onClose, application, onStatusUpdated }) => {
  if (!application) return null;

  const [status, setStatus] = useState(application.status || 'SHORTLISTED');
  const [roundNumber, setRoundNumber] = useState(application.activeRoundNumber || 1);
  const [roundStatus, setRoundStatus] = useState('SCHEDULED');
  const [scheduledDate, setScheduledDate] = useState('');
  const [interviewMode, setInterviewMode] = useState('ONLINE_GOOGLE_MEET');
  const [meetingLink, setMeetingLink] = useState('');
  const [venue, setVenue] = useState('');
  const [instructions, setInstructions] = useState('');
  const [feedback, setFeedback] = useState(application.feedback || '');
  const [notesByIndustry, setNotesByIndustry] = useState(application.notesByIndustry || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const payload = {
        status,
        roundNumber: Number(roundNumber),
        roundStatus,
        scheduledDate: scheduledDate || undefined,
        interviewMode,
        meetingLink,
        venue,
        instructions,
        feedback,
        notesByIndustry,
      };

      const res = await api.put(`/industry/applications/${application._id}/status`, payload);
      if (res.data.success) {
        if (onStatusUpdated) onStatusUpdated(res.data.application, res.data.internshipStatus);
        onClose();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update round status');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Recruitment Stage & Interview Management"
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Candidate Info Header */}
        <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-indigo-600">Candidate</span>
            <h4 className="text-sm font-extrabold text-slate-900">
              {application.student?.fullName || application.studentUser?.name}
            </h4>
            <p className="text-xs text-slate-500">
              Applied for: <span className="font-semibold text-slate-700">{application.internship?.role}</span>
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold uppercase text-slate-400">Match Score</span>
            <span className="text-base font-extrabold text-indigo-600 block">
              {application.matchScore || 85}%
            </span>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
            {errorMsg}
          </div>
        )}

        {/* Overall Status Selection */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Recruitment Stage / Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          >
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="SHORTLISTED">Shortlisted</option>
            <option value="ROUND_1">Round 1 (Online Assessment / Aptitude)</option>
            <option value="ROUND_2">Round 2 (Technical Round 1)</option>
            <option value="TECHNICAL">Technical Deep Dive</option>
            <option value="HR">HR / Culture Fit Round</option>
            <option value="SELECTED">🎉 Selected (Offer Placement)</option>
            <option value="ON_HOLD">On Hold</option>
            <option value="REJECTED">Rejected</option>
          </select>
          {status === 'SELECTED' && (
            <p className="text-[11px] text-emerald-600 font-bold mt-1.5 bg-emerald-50 p-2 rounded-lg border border-emerald-100">
              💡 Note: Selecting this candidate will count towards your required vacancies. If fulfilled, internship status will automatically become FILLED.
            </p>
          )}
        </div>

        {/* Interview Schedule Details (if not rejected/selected) */}
        {!['SELECTED', 'REJECTED'].includes(status) && (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-500" />
              Schedule Interview Round
            </h5>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Round Number</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={roundNumber}
                  onChange={(e) => setRoundNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Interview Date & Time</label>
                <input
                  type="datetime-local"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Interview Mode</label>
                <select
                  value={interviewMode}
                  onChange={(e) => setInterviewMode(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800"
                >
                  <option value="ONLINE_GOOGLE_MEET">Google Meet</option>
                  <option value="ONLINE_ZOOM">Zoom</option>
                  <option value="ONLINE_TEAMS">Microsoft Teams</option>
                  <option value="IN_PERSON">In-Person at Campus/Office</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Meeting URL / Venue</label>
                <input
                  type="text"
                  placeholder="https://meet.google.com/xyz or Office address"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Instructions for Candidate</label>
              <textarea
                rows="2"
                placeholder="e.g. Please be ready with your laptop for live code sharing..."
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800"
              />
            </div>
          </div>
        )}

        {/* Feedback / Evaluation Notes */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Recruiter Feedback (Visible to Candidate)
          </label>
          <textarea
            rows="2"
            placeholder="Feedback or interview outcome notes..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            {isSubmitting ? 'Updating...' : 'Update Recruitment Status'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
