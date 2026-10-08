import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Loader } from '../../components/common/Loader';
import { StatCard } from '../../components/common/StatCard';
import { BarChart3, TrendingUp, Users, Award, Briefcase, CheckCircle2 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';

export const IndustryAnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await api.get('/industry/dashboard');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <Loader message="Compiling corporate hiring analytics..." />;

  const stats = data?.stats || {};
  const pipelineData = data?.pipelineData || [];
  const applicationsByRole = data?.applicationsByRole || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Recruitment Analytics & Insights
        </h2>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Measure hiring conversion rates, requisition performance, and candidate pipeline drop-offs.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Inbound Applications"
          value={stats.totalApplicationsCount || 0}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Candidates Shortlisted"
          value={stats.shortlistedCount || 0}
          icon={CheckCircle2}
          color="purple"
        />
        <StatCard
          title="Selected / Offers"
          value={stats.selectedCount || 0}
          icon={Award}
          color="emerald"
        />
        <StatCard
          title="Conversion / Offer Rate"
          value={`${stats.selectionRate || 0}%`}
          icon={TrendingUp}
          color="indigo"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Pipeline conversion */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card">
          <h3 className="text-base font-extrabold text-slate-900 mb-1">
            Recruitment Funnel Breakdown
          </h3>
          <p className="text-xs text-slate-500 font-medium mb-4">
            Candidate progression through each stage
          </p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pipelineData}>
                <XAxis dataKey="stage" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Volume by role */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card">
          <h3 className="text-base font-extrabold text-slate-900 mb-1">
            Applicant Volume by Position
          </h3>
          <p className="text-xs text-slate-500 font-medium mb-4">
            Total applications received across active requisitions
          </p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={applicationsByRole}>
                <XAxis dataKey="role" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#06b6d4" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};
