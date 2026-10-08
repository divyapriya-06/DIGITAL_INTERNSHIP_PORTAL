import React, { useState, useEffect, useMemo } from 'react';
import api from '../../services/api';
import { Loader } from '../../components/common/Loader';
import { RoundScheduleModal } from '../../components/industry/RoundScheduleModal';
import { StatusBadge } from '../../components/common/Badge';
import {
  GitBranch,
  Users,
  CheckCircle2,
  Search,
  ChevronRight,
  Calendar,
  Filter,
  UserCircle2,
  Clock,
  TrendingDown,
  Award,
  CircleDot,
  Activity,
} from 'lucide-react';

// ─── Stage definitions ──────────────────────────────────────────────────────
const STAGES = [
  {
    id: 'ALL',
    label: 'All Candidates',
    icon: Users,
    accent: 'indigo',
    filter: () => true,
  },
  {
    id: 'APPLIED',
    label: 'Applied / Review',
    icon: CircleDot,
    accent: 'blue',
    filter: (a) => ['APPLIED', 'UNDER_REVIEW'].includes(a.status),
  },
  {
    id: 'SHORTLISTED',
    label: 'Shortlisted',
    icon: Activity,
    accent: 'violet',
    filter: (a) => a.status === 'SHORTLISTED',
  },
  {
    id: 'ROUNDS',
    label: 'Interview Rounds',
    icon: Calendar,
    accent: 'purple',
    filter: (a) => ['ROUND_1', 'ROUND_2', 'TECHNICAL'].includes(a.status),
  },
  {
    id: 'HR',
    label: 'HR Discussion',
    icon: Activity,
    accent: 'fuchsia',
    filter: (a) => a.status === 'HR',
  },
  {
    id: 'SELECTED',
    label: 'Selected',
    icon: Award,
    accent: 'emerald',
    filter: (a) => a.status === 'SELECTED',
  },
  {
    id: 'REJECTED',
    label: 'Not Selected',
    icon: TrendingDown,
    accent: 'rose',
    filter: (a) => a.status === 'REJECTED',
  },
];

// ─── Pipeline stage progress (mini dots) ───────────────────────────────────
const PIPELINE_ORDER = ['APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'ROUND_1', 'ROUND_2', 'TECHNICAL', 'HR', 'SELECTED'];

const stageIndex = (status) => {
  const idx = PIPELINE_ORDER.indexOf(status);
  return idx === -1 ? 0 : idx;
};

const accentStyles = {
  indigo: { tab: 'border-indigo-600 text-indigo-700 bg-indigo-50', dot: 'bg-indigo-600', pill: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  blue:   { tab: 'border-blue-600 text-blue-700 bg-blue-50',     dot: 'bg-blue-500',   pill: 'bg-blue-50 text-blue-700 border-blue-200' },
  violet: { tab: 'border-violet-600 text-violet-700 bg-violet-50', dot: 'bg-violet-500', pill: 'bg-violet-50 text-violet-700 border-violet-200' },
  purple: { tab: 'border-purple-600 text-purple-700 bg-purple-50', dot: 'bg-purple-500', pill: 'bg-purple-50 text-purple-700 border-purple-200' },
  fuchsia:{ tab: 'border-fuchsia-600 text-fuchsia-700 bg-fuchsia-50', dot: 'bg-fuchsia-500', pill: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200' },
  emerald:{ tab: 'border-emerald-600 text-emerald-700 bg-emerald-50', dot: 'bg-emerald-500', pill: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  rose:   { tab: 'border-rose-600 text-rose-700 bg-rose-50',     dot: 'bg-rose-500',   pill: 'bg-rose-50 text-rose-700 border-rose-200' },
};

const matchColor = (score) => {
  if (score >= 75) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
  if (score >= 50) return 'text-amber-700 bg-amber-50 border-amber-200';
  return 'text-rose-700 bg-rose-50 border-rose-200';
};

const getInitials = (name = '') =>
  name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

const avatarBg = [
  'from-indigo-500 to-purple-600',
  'from-blue-500 to-cyan-600',
  'from-violet-500 to-fuchsia-600',
  'from-rose-500 to-pink-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
];

// ─── Mini pipeline progress bar ────────────────────────────────────────────
const MiniPipeline = ({ status }) => {
  if (status === 'REJECTED') {
    return (
      <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
        Not Selected
      </span>
    );
  }
  const total = PIPELINE_ORDER.length;
  const current = stageIndex(status);
  const pct = Math.round((current / (total - 1)) * 100);
  return (
    <div className="flex items-center gap-2 w-full max-w-[160px]">
      <div className="flex-1 h-1.5 rounded-full bg-slate-200 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[10px] font-bold text-slate-500 shrink-0">{pct}%</span>
    </div>
  );
};


// ─── Main page ─────────────────────────────────────────────────────────────
export const RecruitmentRoundsPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeStage, setActiveStage] = useState('ALL');
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');
  const [activeApp, setActiveApp] = useState(null);
  const [sortBy, setSortBy] = useState('date'); // date | score | name

  const fetchApps = async () => {
    try {
      setLoading(true);
      const res = await api.get('/industry/applications');
      if (res.data.success) setApplications(res.data.applications || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchApps(); }, []);

  const roleOptions = useMemo(() => {
    const seen = new Set();
    const opts = [{ label: 'All Roles', value: 'ALL' }];
    applications.forEach((a) => {
      const role = a.internship?.role;
      if (role && !seen.has(role)) { seen.add(role); opts.push({ label: role, value: role }); }
    });
    return opts;
  }, [applications]);

  const stageDef = STAGES.find((s) => s.id === activeStage) || STAGES[0];

  const displayApps = useMemo(() => {
    let list = applications.filter(stageDef.filter);
    if (filterRole !== 'ALL') list = list.filter((a) => a.internship?.role === filterRole);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          (a.student?.fullName || a.studentUser?.name || '').toLowerCase().includes(q) ||
          (a.internship?.role || '').toLowerCase().includes(q) ||
          (a.student?.college || '').toLowerCase().includes(q)
      );
    }
    list = [...list].sort((a, b) => {
      if (sortBy === 'score') return (b.matchScore || 0) - (a.matchScore || 0);
      if (sortBy === 'name') return (a.student?.fullName || '').localeCompare(b.student?.fullName || '');
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });
    return list;
  }, [applications, activeStage, search, filterRole, sortBy, stageDef]);

  if (loading) return <Loader message="Loading recruitment pipeline..." />;

  const stageCounts = STAGES.map((s) => ({
    ...s,
    count: s.id === 'ALL' ? applications.length : applications.filter(s.filter).length,
  }));

  return (
    <div className="space-y-6">
      {/* ── Page Header ────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-200">
            <GitBranch className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Recruitment Pipeline</h2>
        </div>
        <p className="text-xs text-slate-500 font-medium ml-12">
          Track every candidate's journey from application to placement.
        </p>
      </div>

      {/* ── Stage Tabs ──────────────────────────────────────────────────── */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {stageCounts.map((s) => {
          const isActive = s.id === activeStage;
          const Icon = s.icon;
          const styles = accentStyles[s.accent] || accentStyles.indigo;
          return (
            <button
              key={s.id}
              onClick={() => setActiveStage(s.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap border-2 transition-all duration-200 shrink-0 ${
                isActive
                  ? styles.tab + ' shadow-sm'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {s.label}
              <span
                className={`px-1.5 py-0.5 rounded-full font-extrabold text-[10px] ${
                  isActive ? styles.dot + ' text-white' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {s.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Filter & Sort Bar ───────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        {/* Left: search */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search candidate, role, college…"
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 shadow-sm transition-all"
          />
        </div>

        {/* Right: role filter + sort */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="pl-7 pr-6 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer appearance-none shadow-sm"
            >
              {roleOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer shadow-sm"
          >
            <option value="date">Latest first</option>
            <option value="score">Best match first</option>
            <option value="name">Name A→Z</option>
          </select>
          <span className="text-xs text-slate-400 font-medium">{displayApps.length} shown</span>
        </div>
      </div>

      {/* ── Candidate List ──────────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[2.5rem_1fr_1fr_8rem_7rem_7rem_7rem_6rem] items-center gap-4 px-5 py-3 bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-wider">
          <div />
          <div>Candidate</div>
          <div>Role</div>
          <div>Pipeline</div>
          <div className="text-center">Match</div>
          <div className="text-center">CGPA</div>
          <div>Status</div>
          <div className="text-right">Action</div>
        </div>

        {/* Rows */}
        {displayApps.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-300">
            <UserCircle2 className="w-12 h-12" />
            <p className="text-sm font-bold text-slate-400">No candidates in this stage</p>
            <p className="text-xs text-slate-300">Try changing the filter or search</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {displayApps.map((app, i) => {
              const name = app.student?.fullName || app.studentUser?.name || 'Candidate';
              const role = app.internship?.role || '—';
              const company = app.internship?.industry?.companyName || '—';
              const score = app.matchScore ?? 0;
              const cgpa = app.student?.cgpa;
              const college = app.student?.college;
              const grad = app.student?.graduationYear;
              const scheduledRounds = (app.rounds || []).filter((r) => r.status === 'SCHEDULED' || r.status === 'CLEARED');
              const appliedOn = app.createdAt ? new Date(app.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—';
              const bg = avatarBg[i % avatarBg.length];

              return (
                <div
                  key={app._id}
                  onClick={() => setActiveApp(app)}
                  className="grid grid-cols-[2.5rem_1fr_1fr_8rem_7rem_7rem_7rem_6rem] items-center gap-4 px-5 py-4 hover:bg-indigo-50/30 cursor-pointer transition-colors group"
                >
                  {/* Avatar */}
                  <div className={`w-9 h-9 rounded-2xl bg-gradient-to-br ${bg} flex items-center justify-center text-white font-black text-xs shrink-0`}>
                    {getInitials(name)}
                  </div>

                  {/* Candidate info */}
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{college}{grad ? ` · ${grad}` : ''}</p>
                  </div>

                  {/* Role */}
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-700 truncate">{role}</p>
                    <p className="text-[11px] text-slate-400 truncate flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5 shrink-0" /> Applied {appliedOn}
                    </p>
                  </div>

                  {/* Mini pipeline progress */}
                  <MiniPipeline status={app.status} />

                  {/* Match score */}
                  <div className="flex justify-center">
                    <span className={`text-xs font-extrabold px-2.5 py-1 rounded-xl border ${matchColor(score)}`}>
                      {score}%
                    </span>
                  </div>

                  {/* CGPA */}
                  <div className="flex justify-center">
                    {cgpa ? (
                      <span className="text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-xl">
                        {cgpa}
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-300">—</span>
                    )}
                  </div>

                  {/* Status badge */}
                  <div>
                    <StatusBadge status={app.status} />
                    {scheduledRounds.length > 0 && (
                      <p className="text-[9px] font-bold text-indigo-600 mt-1">
                        {scheduledRounds.length} round{scheduledRounds.length > 1 ? 's' : ''} scheduled
                      </p>
                    )}
                  </div>

                  {/* Action */}
                  <div className="flex justify-end">
                    <button
                      onClick={(e) => { e.stopPropagation(); setActiveApp(app); }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold shadow-sm shadow-indigo-200 transition-all group-hover:shadow-md"
                    >
                      Manage
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer summary */}
        {displayApps.length > 0 && (
          <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-medium">
              Showing {displayApps.length} candidate{displayApps.length !== 1 ? 's' : ''}
            </span>
            {activeStage === 'ALL' && (
              <span className="text-[11px] text-emerald-600 font-bold">
                {applications.filter((a) => a.status === 'SELECTED').length} selected this cycle
              </span>
            )}
          </div>
        )}
      </div>

      {/* Stage Modal */}
      {activeApp && (
        <RoundScheduleModal
          isOpen={!!activeApp}
          onClose={() => setActiveApp(null)}
          application={activeApp}
          onStatusUpdated={() => { fetchApps(); setActiveApp(null); }}
        />
      )}
    </div>
  );
};
