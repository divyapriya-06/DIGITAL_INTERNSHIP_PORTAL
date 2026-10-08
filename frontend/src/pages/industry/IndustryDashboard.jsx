import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { StatCard } from '../../components/common/StatCard';
import { Loader } from '../../components/common/Loader';
import { StatusBadge } from '../../components/common/Badge';
import {
  Briefcase,
  Users,
  CheckCircle2,
  Calendar,
  Award,
  ShieldCheck,
  PlusCircle,
  Sparkles,
  ArrowRight,
  TrendingUp,
  BarChart3,
  ExternalLink,
  Building2,
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

export const IndustryDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
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

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) return <Loader message="Loading recruitment intelligence..." />;

  const stats = data?.stats || {};
  const isApproved = stats.verificationStatus === 'APPROVED';

  return (
    <div className="space-y-8">
      
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-purple-950 to-indigo-950 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-purple-300 text-xs font-bold">
            <Building2 className="w-3.5 h-3.5" />
            <span>Corporate Recruitment Console</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            {user?.name} Recruitment Portal
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-xl">
            {isApproved
              ? 'Your company is verified and active. Create internship requisitions, discover AI matching student candidates, and manage interview rounds.'
              : 'Your verification status is currently pending or on hold. Complete verification to post internships.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 shrink-0">
          <Link
            to="/industry/post"
            className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post New Internship</span>
          </Link>
          <Link
            to="/industry/ai-candidates"
            className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs backdrop-blur-md transition-all flex items-center justify-center gap-2 border border-white/20"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>AI Candidate Matches</span>
          </Link>
        </div>
      </div>

      {/* Verification Notice if not approved */}
      {!isApproved && (
        <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-amber-900">
            <ShieldCheck className="w-6 h-6 text-amber-600 shrink-0" />
            <div>
              <h4 className="text-sm font-bold">Company Verification: {stats.verificationStatus}</h4>
              <p className="text-xs text-amber-700 mt-0.5">
                Upload your GST or Corporate Registration document for Administrator authorization.
              </p>
            </div>
          </div>
          <Link
            to="/industry/verification"
            className="px-4 py-2 bg-amber-600 text-white text-xs font-bold rounded-xl shrink-0"
          >
            Upload Proof
          </Link>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Active Postings"
          value={stats.activeInternshipsCount || 0}
          icon={Briefcase}
          color="indigo"
        />
        <StatCard
          title="Total Applications"
          value={stats.totalApplicationsCount || 0}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Shortlisted"
          value={stats.shortlistedCount || 0}
          icon={CheckCircle2}
          color="purple"
        />
        <StatCard
          title="Selected / Placed"
          value={stats.selectedCount || 0}
          icon={Award}
          color="emerald"
        />
        <StatCard
          title="Selection Rate"
          value={`${stats.selectionRate || 0}%`}
          icon={TrendingUp}
          color="amber"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Pipeline Distribution */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Recruitment Funnel & Pipeline
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Live candidate distribution across hiring stages
              </p>
            </div>
            <BarChart3 className="w-5 h-5 text-slate-400" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.pipelineData || []}>
                <XAxis dataKey="stage" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Applications By Role */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card flex flex-col justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 mb-1">
              Applications by Role
            </h3>
            <p className="text-xs text-slate-500 font-medium mb-4">
              Applicant volume per opening
            </p>

            <div className="space-y-3">
              {(data?.applicationsByRole || []).slice(0, 5).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 text-xs">
                  <span className="font-bold text-slate-800 truncate max-w-[180px]">{item.role}</span>
                  <span className="font-extrabold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                    {item.count} candidates
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 mt-4 flex justify-between text-xs">
            <Link to="/industry/applications" className="font-bold text-indigo-600 hover:underline">
              View All Applications →
            </Link>
          </div>
        </div>

      </div>

      {/* Recent Applications Table Preview */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              Recent Candidate Applications
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Candidates who recently applied to your requisitions
            </p>
          </div>
          <Link
            to="/industry/applications"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
          >
            Manage Pipeline →
          </Link>
        </div>

        {(!data?.recentApplications || data.recentApplications.length === 0) ? (
          <p className="text-xs text-slate-400 py-6 text-center">No applications received yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                <tr>
                  <th className="pb-3">Candidate</th>
                  <th className="pb-3">Role Applied</th>
                  <th className="pb-3">AI Match</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data.recentApplications.map((app) => (
                  <tr key={app._id} className="hover:bg-slate-50">
                    <td className="py-3 font-bold text-slate-800">
                      {app.student?.fullName || app.studentUser?.name}
                    </td>
                    <td className="py-3 text-slate-600">{app.internship?.role}</td>
                    <td className="py-3">
                      <span className="font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                        {app.matchScore}%
                      </span>
                    </td>
                    <td className="py-3">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        to="/industry/applications"
                        className="text-indigo-600 font-bold hover:underline"
                      >
                        Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
