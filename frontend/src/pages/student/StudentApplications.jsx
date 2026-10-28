import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { ApplicationTimeline } from '../../components/student/ApplicationTimeline';
import { Loader } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';
import { StatusBadge } from '../../components/common/Badge';
import {
  Briefcase,
  Search,
  ChevronDown,
  ChevronUp,
  Building,
  MapPin,
  Banknote,
  Calendar,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ArrowRight,
  Sparkles,
  Filter,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const StudentApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedAppIds, setExpandedAppIds] = useState(new Set());

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/student/applications');
      if (res.data.success) {
        setApplications(res.data.applications || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const toggleExpand = (id) => {
    setExpandedAppIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleDeleteRejected = async (appId) => {
    if (
      !window.confirm(
        'Are you sure you want to remove this rejected application from your tracking list?'
      )
    )
      return;

    try {
      const res = await api.delete(`/student/applications/${appId}`);
      if (res.data.success) {
        setApplications((prev) => prev.filter((a) => a._id !== appId));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete application');
    }
  };

  const filteredApps = applications.filter((app) => {
    const roleMatch =
      (app.internship?.role || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.industry?.companyName || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (!roleMatch) return false;

    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'APPLIED') return app.status === 'APPLIED';
    if (statusFilter === 'ACTIVE')
      return !['SELECTED', 'REJECTED', 'APPLIED'].includes(app.status);
    if (statusFilter === 'SELECTED') return app.status === 'SELECTED';
    if (statusFilter === 'REJECTED') return app.status === 'REJECTED';
    return true;
  });

  // Stats
  const appliedCount = applications.filter((a) => a.status === 'APPLIED').length;
  const activeCount = applications.filter(
    (a) => !['SELECTED', 'REJECTED', 'APPLIED'].includes(a.status)
  ).length;
  const selectedCount = applications.filter((a) => a.status === 'SELECTED').length;
  const rejectedCount = applications.filter((a) => a.status === 'REJECTED').length;

  if (loading) return <Loader message="Fetching your application pipeline..." />;

  const filterTabs = [
    { id: 'ALL', label: 'All', count: applications.length, color: 'indigo' },
    { id: 'APPLIED', label: 'Applied', count: appliedCount, color: 'blue' },
    { id: 'ACTIVE', label: 'In Progress', count: activeCount, color: 'amber' },
    { id: 'SELECTED', label: 'Selected', count: selectedCount, color: 'emerald' },
    { id: 'REJECTED', label: 'Rejected', count: rejectedCount, color: 'rose' },
  ];

  return (
    <div className="space-y-6">
      {/* Premium Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold text-indigo-200">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Live Application Tracking</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              My Application Pipeline
            </h2>
            <p className="text-xs sm:text-sm text-indigo-200 font-medium max-w-xl">
              Track every application from submission to offer. Click any company to inspect the full recruitment journey.
            </p>
          </div>

          {/* Mini Stats */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/15 text-center min-w-[70px]">
              <span className="text-xl font-black text-white block">{applications.length}</span>
              <span className="text-[10px] font-bold text-indigo-200 uppercase">Total</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/15 text-center min-w-[70px]">
              <span className="text-xl font-black text-emerald-300 block">{selectedCount}</span>
              <span className="text-[10px] font-bold text-indigo-200 uppercase">Selected</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/15 text-center min-w-[70px]">
              <span className="text-xl font-black text-amber-300 block">{activeCount}</span>
              <span className="text-[10px] font-bold text-indigo-200 uppercase">Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-card">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Filter Tabs */}
          <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
            {filterTabs.map((tab) => {
              const isActive = statusFilter === tab.id;
              const colorMap = {
                indigo: isActive ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : '',
                blue: isActive ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : '',
                amber: isActive ? 'bg-amber-500 text-white shadow-md shadow-amber-200' : '',
                emerald: isActive ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200' : '',
                rose: isActive ? 'bg-rose-500 text-white shadow-md shadow-rose-200' : '',
              };
              return (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all duration-200 flex items-center gap-2 ${
                    isActive
                      ? colorMap[tab.color]
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/70'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-lg text-[10px] font-extrabold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-200/80 text-slate-600'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search company or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 bg-slate-50/80"
            />
          </div>
        </div>
      </div>

      {/* Applications List */}
      {filteredApps.length === 0 ? (
        <EmptyState
          title="No Applications Found"
          description={
            statusFilter !== 'ALL'
              ? `No applications currently match the "${statusFilter}" filter.`
              : 'You have not submitted any applications yet. Explore internships and apply today!'
          }
          actionLabel="Find Internships"
          onAction={() => (window.location.href = '/student/find')}
        />
      ) : (
        <div className="space-y-4">
          {filteredApps.map((app) => {
            const isExpanded = expandedAppIds.has(app._id);
            const isSelectedTab = statusFilter === 'SELECTED' || app.status === 'SELECTED';
            const isRejectedTab = statusFilter === 'REJECTED' || app.status === 'REJECTED';
            const hideRoundsForThis = isSelectedTab || isRejectedTab;

            const company =
              app.internship?.industry?.companyName ||
              app.industry?.companyName ||
              'Company';
            const role = app.internship?.role || 'Internship Candidate';
            const location =
              app.internship?.location || app.industry?.city || 'Chennai / Hybrid';
            const stipend = app.internship?.stipend
              ? `₹${app.internship.stipend.toLocaleString()}/mo`
              : 'Paid Internship';

            // For SELECTED and REJECTED tabs, show only company details without rounds:
            if (statusFilter === 'SELECTED' || statusFilter === 'REJECTED') {
              return (
                <div
                  key={app._id}
                  className={`group bg-white rounded-3xl p-6 border shadow-card hover:shadow-lg transition-all duration-300 ${
                    app.status === 'SELECTED'
                      ? 'border-emerald-200/80 hover:border-emerald-300 bg-gradient-to-r from-white to-emerald-50/30'
                      : 'border-rose-200/80 hover:border-rose-300 bg-gradient-to-r from-white to-rose-50/30'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-md ${
                          app.status === 'SELECTED' ? 'bg-emerald-500 shadow-emerald-200' : 'bg-rose-500 shadow-rose-200'
                        }`}>
                          {company.charAt(0)}
                        </div>
                        <div>
                          <span className="text-sm font-extrabold text-indigo-950 flex items-center gap-1.5">
                            {company}
                          </span>
                          <StatusBadge status={app.status} />
                        </div>
                      </div>
                      <h3 className="text-base font-black text-slate-900">{role}</h3>
                      <div className="flex items-center gap-4 text-xs text-slate-500 font-medium flex-wrap">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                          {stipend}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          Applied:{' '}
                          {new Date(app.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      {app.status === 'SELECTED' ? (
                        <div className="px-4 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1.5 shadow-sm">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Offer Released</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="px-4 py-2 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-1.5 shadow-sm">
                            <XCircle className="w-4 h-4 text-rose-600" />
                            <span>Application Closed</span>
                          </div>
                          <button
                            onClick={() => handleDeleteRejected(app._id)}
                            className="px-3 py-2 rounded-2xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 text-xs font-bold transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {app.feedback && (
                    <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700">
                      <span className="font-bold text-slate-800">Recruiter Note: </span>
                      "{app.feedback}"
                    </div>
                  )}
                </div>
              );
            }

            // For ALL, APPLIED, ACTIVE tabs:
            return (
              <div
                key={app._id}
                className={`bg-white rounded-3xl border shadow-card overflow-hidden transition-all duration-300 hover:shadow-lg ${
                  isExpanded ? 'border-indigo-200 ring-1 ring-indigo-100' : 'border-slate-200/80'
                }`}
              >
                {/* Summary Row */}
                <div
                  onClick={() => toggleExpand(app._id)}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-gradient-to-r hover:from-slate-50/60 hover:to-indigo-50/30 transition-all duration-200"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-indigo-200 shrink-0">
                      {company.charAt(0)}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-extrabold text-indigo-950">
                          {company}
                        </span>
                        <StatusBadge status={app.status} />
                      </div>
                      <h3 className="text-base font-black text-slate-900">{role}</h3>
                      <div className="flex items-center gap-4 text-xs text-slate-500 font-medium flex-wrap">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                          {stipend}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {new Date(app.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-bold text-indigo-600 hidden sm:inline-block">
                      {isExpanded ? 'Hide Tracking' : 'View Tracking'}
                    </span>
                    <button
                      className={`p-2.5 rounded-2xl transition-all duration-200 ${
                        isExpanded
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                          : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                      }`}
                      title="Toggle tracking timeline"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Horizontal Visual */}
                {isExpanded && (
                  <div className="border-t border-indigo-100 p-5 bg-gradient-to-br from-slate-50/50 to-indigo-50/30">
                    <ApplicationTimeline
                      application={app}
                      onDeleteRejected={handleDeleteRejected}
                      hideRounds={hideRoundsForThis}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Action Footer */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-indigo-50 via-purple-50 to-violet-50 border border-indigo-200/60 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-100 text-indigo-700">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-slate-900">Explore More Opportunities</h4>
            <p className="text-xs text-slate-500 font-medium">AI-powered matching finds roles that fit your skill profile.</p>
          </div>
        </div>
        <Link
          to="/student/find"
          className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-200 transition-all flex items-center gap-2 shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          <span>Browse AI Matched Roles</span>
        </Link>
      </div>
    </div>
  );
};
