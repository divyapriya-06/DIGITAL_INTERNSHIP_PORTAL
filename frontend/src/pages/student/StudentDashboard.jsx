import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { StatCard } from '../../components/common/StatCard';
import { Loader } from '../../components/common/Loader';
import { InternshipCard } from '../../components/student/InternshipCard';
import { SkillGapWidget } from '../../components/student/SkillGapWidget';
import {
  Briefcase,
  CheckCircle2,
  Calendar,
  Award,
  XCircle,
  Percent,
  Sparkles,
  ArrowRight,
  TrendingUp,
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
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [applyingId, setApplyingId] = useState(null);
  const [applySuccessMsg, setApplySuccessMsg] = useState('');

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const [dashRes, recRes] = await Promise.all([
        api.get('/student/dashboard'),
        api.get('/student/recommendations'),
      ]);

      if (dashRes.data.success) {
        setDashboardData(dashRes.data);
      }
      if (recRes.data.success) {
        setRecommendations(recRes.data.recommendations?.slice(0, 3) || []);
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

  const handleApply = async (internshipId) => {
    try {
      setApplyingId(internshipId);
      const res = await api.post(`/student/apply/${internshipId}`);
      if (res.data.success) {
        setApplySuccessMsg('Application submitted successfully!');
        setTimeout(() => setApplySuccessMsg(''), 4000);
        fetchDashboard();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setApplyingId(null);
    }
  };

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

      {applySuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {applySuccessMsg}
        </div>
      )}

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Applied"
          value={stats.totalApplications}
          icon={Briefcase}
          color="blue"
        />
        <StatCard
          title="Shortlisted"
          value={stats.shortlistedCount}
          icon={CheckCircle2}
          color="indigo"
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dashboardData.upcomingInterviews.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/60 to-purple-50/40 border border-indigo-100 flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white font-extrabold text-[10px]">
                      Round {item.roundNumber}: {item.roundName}
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">
                      {item.companyName}
                    </span>
                  </div>
                  <h4 className="text-sm font-extrabold text-slate-900 mt-2">
                    {item.internshipRole}
                  </h4>
                  <p className="text-xs text-slate-600 flex items-center gap-1.5 mt-1 font-medium">
                    <Clock className="w-3.5 h-3.5 text-indigo-500" />
                    {new Date(item.scheduledDate).toLocaleString()}
                  </p>
                  {item.instructions && (
                    <p className="text-[11px] text-slate-500 mt-1.5 italic">
                      "{item.instructions}"
                    </p>
                  )}
                </div>

                {item.meetingLink && (
                  <a
                    href={item.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-md shadow-indigo-200 hover:bg-indigo-700 transition-all"
                  >
                    <Video className="w-4 h-4" />
                    Join Video Call
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended For You Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600 animate-pulse" />
              {t('recommendedForYou')}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Top AI matches based on your resume, projects, and domain preferences
            </p>
          </div>
          <Link
            to="/student/recommended"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <span>View Top 10</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recommendations.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-3xl border border-slate-200/80 text-xs text-slate-400">
            No recommended internships available currently. Complete your skills & resume to unlock AI matching.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {recommendations.map((job) => (
              <InternshipCard
                key={job._id}
                internship={job}
                onApply={handleApply}
                isApplying={applyingId === job._id}
                onViewDetails={(j) => navigate(`/student/find?id=${j._id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Analytics & Skill Gap Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Skill Gap Widget */}
        <div className="lg:col-span-7">
          <SkillGapWidget
            skillGap={dashboardData?.skillGap}
            topIndustrySkills={dashboardData?.topIndustrySkills}
          />
        </div>

        {/* Right: Application Pipeline Distribution Chart */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card flex flex-col justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 mb-1">
              Application Pipeline
            </h3>
            <p className="text-xs text-slate-500 font-medium mb-4">
              Real-time progression of your submissions
            </p>
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
            <Link to="/student/applications" className="font-bold text-indigo-600 hover:underline">
              Track All →
            </Link>
          </div>
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
