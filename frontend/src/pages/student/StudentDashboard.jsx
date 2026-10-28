import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { StatCard } from '../../components/common/StatCard';
import { Loader } from '../../components/common/Loader';
import {
  Briefcase,
  Calendar,
  Award,
  XCircle,
  Sparkles,
  ArrowRight,
  Video,
  Clock,
  Star,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [selectedInterviewModal, setSelectedInterviewModal] = useState(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const dashRes = await api.get('/student/dashboard');

      if (dashRes.data.success) {
        setDashboardData(dashRes.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) return <Loader message="Loading your personalized dashboard..." />;

  const stats = dashboardData?.stats || {
    totalApplications: 0,
    shortlistedCount: 0,
    selectedCount: 0,
    rejectedCount: 0,
    profileCompletionPercentage: 85,
  };

  // Pipeline distribution chart data
  const pipelineChartData = [
    { name: 'Under Review', count: stats.underReviewCount || 0, color: '#3b82f6' },
    { name: 'Shortlisted', count: stats.shortlistedCount || 0, color: '#6366f1' },
    { name: 'Selected', count: stats.selectedCount || 0, color: '#10b981' },
    { name: 'Rejected', count: stats.rejectedCount || 0, color: '#f43f5e' },
  ];

  // Skill demand chart data
  const skillChartData = (dashboardData?.topIndustrySkills || []).slice(0, 5).map(s => ({
    name: s.skill,
    count: s.count,
  }));

  return (
    <div className="space-y-8">
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="absolute right-0 bottom-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold text-indigo-200">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Recommendation Engine Active</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Welcome back, {user?.name}! 👋
            </h2>
            <p className="text-xs sm:text-sm text-indigo-200 font-medium max-w-xl">
              Your profile is matched with live internship opportunities. Explore tailored matches and track your recruitment timeline below.
            </p>
          </div>

          {/* Profile Completion Meter */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 min-w-[200px] text-center shrink-0">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-200 block">
              Profile Strength
            </span>
            <div className="flex items-center justify-center gap-2 my-1">
              <span className="text-3xl font-black text-white">
                {stats.profileCompletionPercentage}%
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/20 overflow-hidden">
              <div
                className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${stats.profileCompletionPercentage}%` }}
              />
            </div>
            <Link
              to="/student/profile"
              className="text-[11px] text-indigo-200 hover:text-white font-bold underline mt-2 block"
            >
              Update Profile Details →
            </Link>
          </div>
        </div>
      </div>


      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Applied"
          value={stats.totalApplications}
          icon={Briefcase}
          color="blue"
        />
        <StatCard
          title="Upcoming Rounds"
          value={(dashboardData?.upcomingInterviews || []).length}
          icon={Calendar}
          color="amber"
        />
        <StatCard
          title="Selected"
          value={stats.selectedCount}
          icon={Award}
          color="emerald"
        />
        <StatCard
          title="Not Selected"
          value={stats.rejectedCount}
          icon={XCircle}
          color="rose"
        />
      </div>

      {/* Upcoming Interviews Alert if scheduled */}
      {dashboardData?.upcomingInterviews && dashboardData.upcomingInterviews.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-indigo-100 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              Scheduled Interview Rounds
            </h3>
            <Link
              to="/student/upcoming-rounds"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dashboardData.upcomingInterviews.map((item, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedInterviewModal(item)}
                className="group p-4 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/50 border border-indigo-100/80 hover:border-indigo-300 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-extrabold text-slate-800 truncate">
                      {item.companyName}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700 font-bold text-[10px] shrink-0">
                      Round {item.roundNumber}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-indigo-950 group-hover:text-indigo-600 transition-colors">
                    {item.roundName}
                  </h4>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-2 font-medium">
                    <Clock className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span>{new Date(item.scheduledDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-indigo-50 flex items-center justify-between text-[11px] text-indigo-600 font-bold">
                  <span>Click for meeting link & info</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interview Details Modal */}
      {selectedInterviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block">Interview Scheduled</span>
                <h3 className="text-lg font-black text-slate-900">{selectedInterviewModal.companyName}</h3>
              </div>
              <button
                onClick={() => setSelectedInterviewModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-3">
              <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100">
                <div className="text-xs text-indigo-600 font-bold">Target Position</div>
                <div className="text-sm font-black text-slate-900">{selectedInterviewModal.internshipRole || 'Internship Candidate'}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="text-[11px] text-slate-400 font-bold uppercase">Round</div>
                  <div className="text-xs font-bold text-slate-800 mt-0.5">Round {selectedInterviewModal.roundNumber}: {selectedInterviewModal.roundName}</div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="text-[11px] text-slate-400 font-bold uppercase">Scheduled Time</div>
                  <div className="text-xs font-bold text-slate-800 mt-0.5">
                    {new Date(selectedInterviewModal.scheduledDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                  </div>
                </div>
              </div>

              {selectedInterviewModal.instructions && (
                <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900">
                  <span className="font-bold block mb-1">Candidate Instructions:</span>
                  <p className="font-medium italic leading-relaxed">"{selectedInterviewModal.instructions}"</p>
                </div>
              )}

              {selectedInterviewModal.meetingLink ? (
                <div className="pt-2">
                  <a
                    href={selectedInterviewModal.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-lg shadow-indigo-200 transition-all"
                  >
                    <Video className="w-4 h-4" />
                    <span>Join Meeting Link</span>
                  </a>
                  <p className="text-[11px] text-slate-400 text-center mt-2 font-mono break-all">
                    {selectedInterviewModal.meetingLink}
                  </p>
                </div>
              ) : (
                <div className="p-3 rounded-2xl bg-slate-100 text-center text-xs text-slate-500 font-medium">
                  Meeting link will be shared by the recruiter prior to the interview session.
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedInterviewModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Application Pipeline Distribution Chart */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 mb-1">
              Application Pipeline
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Real-time progression of your submissions
            </p>
          </div>
          <Link to="/student/applications" className="font-bold text-xs text-indigo-600 hover:underline flex items-center gap-1">
            Track All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={pipelineChartData}>
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]}>
                {pipelineChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500">Active Applications: <b className="text-slate-800">{stats.totalApplications}</b></span>
        </div>
      </div>

      {/* Quick Access to Company Reviews */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-500/10 via-indigo-50 to-purple-50 border border-amber-200/60 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-100 text-amber-800">
            <Star className="w-5 h-5 fill-amber-400" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-slate-900">Explore Company Reviews & Culture</h4>
            <p className="text-xs text-slate-500 font-medium">Search across all registered enterprises to read mentorship ratings and intern experiences.</p>
          </div>
        </div>
        <Link
          to="/student/reviews"
          className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition-colors shrink-0"
        >
          Search Companies & Reviews →
        </Link>
      </div>

    </div>
  );
};
