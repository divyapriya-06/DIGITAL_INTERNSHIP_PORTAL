import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Loader } from '../../components/common/Loader';
import { StatCard } from '../../components/common/StatCard';
import { BarChart3, TrendingUp, Users, Award, Building2, MapPin, Layers } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart, Pie } from 'recharts';

export const AdminAnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        const [anRes, dashRes] = await Promise.all([
          api.get('/admin/analytics'),
          api.get('/admin/dashboard'),
        ]);

        if (anRes.data.success) {
          setAnalytics(anRes.data);
        }
        if (dashRes.data.success) {
          setDashboardData(dashRes.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalyticsData();
  }, []);

  if (loading) return <Loader message="Compiling platform-wide placement and recruitment intelligence..." />;

  const stats = dashboardData?.stats || {};
  const funnel = analytics?.funnel || [];
  const topCompanies = analytics?.topRecruitingCompanies || [];
  const locations = analytics?.internshipsByLocation || [];

  const topSkillsChart = (analytics?.skillData?.topSkills || []).slice(0, 7).map((s, idx) => ({
    name: s.skill,
    count: s.count,
    color: ['#4f46e5', '#6366f1', '#818cf8', '#06b6d4', '#0ea5e9', '#3b82f6', '#8b5cf6'][idx % 7],
  }));

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-950 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-bold">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>Institutional Placement Intelligence</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Institutional Placement & Hiring Analytics
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-xl">
            Calculated in real-time from active student application conversions, selections, and corporate recruitment activity.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center min-w-[220px] shrink-0">
          <span className="text-[10px] uppercase font-bold text-slate-300 block">
            Official Placement Rate
          </span>
          <span className="text-4xl font-black text-emerald-400 my-1 block">
            {stats.placementPercentage || 0}%
          </span>
          <span className="text-[11px] text-slate-300 font-medium">
            ({stats.selectedStudentsCount || 0} Placed / {stats.activeApplicantsCount || 0} Active Applicants)
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Student Pool"
          value={stats.totalStudents || 0}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Active Applicants"
          value={stats.activeApplicantsCount || 0}
          icon={Layers}
          color="purple"
        />
        <StatCard
          title="Offers Issued"
          value={stats.selectedStudentsCount || 0}
          icon={Award}
          color="emerald"
        />
        <StatCard
          title="Verified Employers"
          value={stats.verifiedIndustries || 0}
          icon={Building2}
          color="indigo"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Global Recruitment Funnel */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card">
          <h3 className="text-base font-extrabold text-slate-900 mb-1">
            Global Recruitment Funnel
          </h3>
          <p className="text-xs text-slate-500 font-medium mb-4">
            Total application drop-off and conversion across all companies
          </p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnel}>
                <XAxis dataKey="stage" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Demanded Skills */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card">
          <h3 className="text-base font-extrabold text-slate-900 mb-1">
            Most Demanded Technical Skills
          </h3>
          <p className="text-xs text-slate-500 font-medium mb-4">
            Total occurrences in open requisitions
          </p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topSkillsChart}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {topSkillsChart.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Top Recruiting Companies Leaderboard */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card space-y-4">
        <h3 className="text-base font-extrabold text-slate-900">
          Top Recruiting Partner Enterprises
        </h3>
        <p className="text-xs text-slate-500 font-medium">
          Ranked by total internship offers and placement selections issued
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {topCompanies.map((c, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60">
              <span className="text-[10px] font-bold uppercase text-slate-400">Rank #{idx + 1}</span>
              <h4 className="text-sm font-extrabold text-slate-900 mt-1">{c.companyName}</h4>
              <div className="mt-3 flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-500">{c.totalApplications} applicants</span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-black">
                  {c.selectedCandidates} Placed
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
