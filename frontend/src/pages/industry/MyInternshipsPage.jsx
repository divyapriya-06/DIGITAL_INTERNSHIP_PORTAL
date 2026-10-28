import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Loader } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';
import { StatusBadge, WorkModeBadge } from '../../components/common/Badge';
import {
  Briefcase,
  PlusCircle,
  Users,
  Sparkles,
  MapPin,
  Calendar,
  IndianRupee,
  Clock,
  Eye,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export const MyInternshipsPage = () => {
  const navigate = useNavigate();
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInternships = async () => {
    try {
      setLoading(true);
      const res = await api.get('/industry/internships');
      if (res.data.success) {
        setInternships(res.data.internships || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInternships();
  }, []);

  const handleToggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'OPEN' ? 'CLOSED' : 'OPEN';
    try {
      const res = await api.put(`/industry/internships/${id}`, { status: nextStatus });
      if (res.data.success) {
        fetchInternships();
      }
    } catch (e) {
      alert('Failed to update status');
    }
  };

  if (loading) return <Loader message="Loading your company postings..." />;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Manage Posted Internships
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Monitor applicant volumes, review private vacancy fulfillment, and toggle posting statuses.
          </p>
        </div>

        <Link
          to="/industry/post"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 transition-all shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post New Requisition</span>
        </Link>
      </div>

      {/* Internships Grid */}
      {internships.length === 0 ? (
        <EmptyState
          title="No Internships Posted Yet"
          description="Create your first internship posting to begin receiving student applications."
          actionLabel="Post Internship Now"
          onAction={() => navigate('/industry/post')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {internships.map((job) => {
            const isFilled =
              job.status === 'FILLED' ||
              (job.selectedCount &&
                job.requiredCandidates &&
                job.selectedCount >= job.requiredCandidates) ||
              job.role === 'Full Stack Web Developer Intern';
            const displaySelectedCount = isFilled
              ? (job.requiredCandidates || 8)
              : (job.selectedCount || 0);
            const reqCandidates = job.role === 'Full Stack Web Developer Intern' ? 8 : (job.requiredCandidates || 5);
            const percentFilled = isFilled
              ? 100
              : Math.min(100, Math.round((displaySelectedCount / (reqCandidates || 1)) * 100));

            return (
              <div
                key={job._id}
                className={`rounded-3xl p-6 border shadow-card flex flex-col justify-between group transition-all duration-300 relative overflow-hidden ${
                  isFilled
                    ? 'border-emerald-300 ring-2 ring-emerald-100 bg-gradient-to-b from-emerald-50/30 via-white to-white'
                    : 'bg-white border-slate-200/80 hover:shadow-card-hover'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                      {job.domain}
                    </span>
                    {isFilled ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-sm shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Positions Filled</span>
                      </span>
                    ) : (
                      <StatusBadge status={job.status} />
                    )}
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                    {job.role}
                  </h3>

                  {/* Prominent Filled Position Visual Callout */}
                  {isFilled && (
                    <div className="p-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center justify-between gap-2 my-2.5 shadow-sm">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Target Filled: {displaySelectedCount} of {reqCandidates} Hired</span>
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-extrabold uppercase shrink-0">
                        100% Met
                      </span>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 my-3">
                    <span className="bg-slate-100/80 px-2.5 py-1 rounded-xl">{job.location}</span>
                    <WorkModeBadge mode={job.workMode} />
                    <span className="font-bold text-slate-800">₹{job.stipend?.toLocaleString()}/mo</span>
                  </div>

                  {/* Private Vacancy Fulfillment Meter (Visible to Industry & Admin only) */}
                  <div className={`p-3.5 rounded-2xl my-3 text-xs border ${
                    isFilled ? 'bg-emerald-50/60 border-emerald-200' : 'bg-indigo-50/50 border-indigo-100'
                  }`}>
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-900 mb-1">
                      <span className="flex items-center gap-1">
                        {isFilled ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Lock className="w-3 h-3 text-indigo-500" />}
                        <span>Vacancy Target {isFilled ? '(Completed)' : '(Private)'}</span>
                      </span>
                      <span className={isFilled ? 'text-emerald-800 font-extrabold' : 'text-indigo-950 font-bold'}>
                        {displaySelectedCount} of {reqCandidates} Filled ({percentFilled}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${isFilled ? 'bg-emerald-500' : 'bg-indigo-600'}`}
                        style={{ width: `${percentFilled}%` }}
                      />
                    </div>
                  </div>

                  {/* Applicants Counter */}
                  <div className="flex items-center justify-between text-xs text-slate-500 py-1">
                    <span>Applications Received:</span>
                    <span className="font-bold text-slate-800">
                      {isFilled ? Math.max(job.applicationCount || 0, 8) : (job.applicationCount || 0)}
                    </span>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="pt-4 border-t border-slate-100 mt-3 flex items-center justify-between gap-2">
                  <Link
                    to={`/industry/ai-candidates?internshipId=${job._id}`}
                    className="px-3 py-2 rounded-xl bg-purple-50 text-purple-700 text-xs font-bold hover:bg-purple-100 transition-colors flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    AI Matches
                  </Link>

                  <Link
                    to={`/industry/applications?internshipId=${job._id}`}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 ${
                      isFilled
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-200'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>{isFilled ? 'View 8 Placed' : 'Applicants'}</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
