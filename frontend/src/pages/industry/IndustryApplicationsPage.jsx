import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { Loader } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';
import { StatusBadge } from '../../components/common/Badge';
import { RoundScheduleModal } from '../../components/industry/RoundScheduleModal';
import {
  Users,
  Filter,
  Search,
  Calendar,
  FileText,
  Sparkles,
  ChevronRight,
  GraduationCap,
  Award,
} from 'lucide-react';

export const IndustryApplicationsPage = () => {
  const [searchParams] = useSearchParams();
  const [applications, setApplications] = useState([]);
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [selectedInternship, setSelectedInternship] = useState(searchParams.get('internshipId') || 'ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Schedule / Stage Modal state
  const [activeApplication, setActiveApplication] = useState(null);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const params = {
        internshipId: selectedInternship !== 'ALL' ? selectedInternship : undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
      };

      const [appRes, intRes] = await Promise.all([
        api.get('/industry/applications', { params }),
        api.get('/industry/internships'),
      ]);

      if (appRes.data.success) {
        setApplications(appRes.data.applications || []);
      }
      if (intRes.data.success) {
        setInternships(intRes.data.internships || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [selectedInternship, statusFilter]);

  const handleStatusUpdated = () => {
    fetchApplications();
  };

  const filteredApps = applications.filter((app) => {
    const nameMatch = (app.student?.fullName || app.studentUser?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                      (app.internship?.role || '').toLowerCase().includes(searchQuery.toLowerCase());
    return nameMatch;
  });

  if (loading) return <Loader message="Fetching recruitment applications..." />;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Applicant Pipeline & Review
        </h2>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Review candidate resumes, evaluate AI skill match scores, schedule technical interviews, and issue selections.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-card flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Internship Requisition selector */}
          <select
            value={selectedInternship}
            onChange={(e) => setSelectedInternship(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white"
          >
            <option value="ALL">All Active Requisitions</option>
            {internships.map((job) => (
              <option key={job._id} value={job._id}>
                {job.role} ({job.applicationCount || 0} applicants)
              </option>
            ))}
          </select>

          {/* Status selector */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white"
          >
            <option value="ALL">All Stages</option>
            <option value="APPLIED">Applied</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="SHORTLISTED">Shortlisted</option>
            <option value="ROUND_1">Round 1</option>
            <option value="ROUND_2">Round 2</option>
            <option value="TECHNICAL">Technical Round</option>
            <option value="HR">HR Round</option>
            <option value="SELECTED">Selected / Placed</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search candidate name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      {/* Applications Table / Cards */}
      {filteredApps.length === 0 ? (
        <EmptyState
          title="No Applications Found"
          description="No candidate applications match your current filters."
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                <tr>
                  <th className="py-4 px-6">Candidate Details</th>
                  <th className="py-4 px-4">Applied Requisition</th>
                  <th className="py-4 px-4">AI Match Score</th>
                  <th className="py-4 px-4">Recruitment Stage</th>
                  <th className="py-4 px-4">Scheduled Round</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredApps.map((app) => (
                  <tr key={app._id} className="hover:bg-slate-50/80 transition-colors">
                    
                    {/* Candidate */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 font-black text-xs flex items-center justify-center shrink-0 border border-indigo-100">
                          {app.student?.fullName?.slice(0, 2).toUpperCase() || 'ST'}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-sm">
                            {app.student?.fullName || app.studentUser?.name}
                          </h4>
                          <p className="text-[11px] text-slate-500 flex items-center gap-1">
                            <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                            {app.student?.college || 'University Student'} • CGPA: <b>{app.student?.cgpa || '8.5'}</b>
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-4 px-4 font-bold text-slate-800">
                      {app.internship?.role || 'Internship'}
                    </td>

                    {/* AI Match */}
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-100">
                        <Sparkles className="w-3.5 h-3.5" />
                        {app.matchScore}%
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4">
                      <StatusBadge status={app.status} />
                    </td>

                    {/* Active Round Info */}
                    <td className="py-4 px-4 text-slate-600">
                      {app.rounds?.find(r => r.status === 'SCHEDULED') ? (
                        <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                          Round {app.activeRoundNumber} Scheduled
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">Not scheduled</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {app.student?.resumePath && (
                          <a
                            href={`/${app.student.resumePath}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors"
                            title="View Resume"
                          >
                            <FileText className="w-4 h-4" />
                          </a>
                        )}

                        <button
                          onClick={() => setActiveApplication(app)}
                          className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 transition-all flex items-center gap-1"
                        >
                          <span>Manage Stage</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stage Management Modal */}
      {activeApplication && (
        <RoundScheduleModal
          isOpen={!!activeApplication}
          onClose={() => setActiveApplication(null)}
          application={activeApplication}
          onStatusUpdated={handleStatusUpdated}
        />
      )}

    </div>
  );
};
