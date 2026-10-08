import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Loader } from '../../components/common/Loader';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/Badge';
import { VerificationReviewModal } from '../../components/admin/VerificationReviewModal';
import {
  Users,
  Building2,
  ShieldCheck,
  Briefcase,
  GitBranch,
  Award,
  Percent,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Clock,
} from 'lucide-react';

export const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedIndustry, setSelectedIndustry] = useState(null);

  const fetchAdminDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/dashboard');
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
    fetchAdminDashboard();
  }, []);

  if (loading) return <Loader message="Loading administrator governance control panel..." />;

  const stats = data?.stats || {};

  return (
    <div className="space-y-8">
      
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-700 via-blue-700 to-teal-600 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
            <span>Master Governance Console</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Institutional Admin Dashboard
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-xl">
            Real-time platform oversight, corporate verification approvals, placement rate metrics, and student profile compliance.
          </p>
        </div>

        {/* Placement Rate Hero KPI */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center min-w-[200px] shrink-0">
          <span className="text-[10px] uppercase font-bold text-slate-300 block">
            Portal Placement Rate
          </span>
          <span className="text-3xl font-black text-emerald-400 my-0.5 block">
            {stats.placementPercentage || 0}%
          </span>
          <span className="text-[10px] text-slate-300">
            {stats.selectedStudentsCount || 0} placed of {stats.activeApplicantsCount || 0} active applicants
          </span>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={stats.totalStudents || 0}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Total Industries"
          value={stats.totalIndustries || 0}
          icon={Building2}
          subtitle={`${stats.verifiedIndustries || 0} Verified • ${stats.pendingIndustries || 0} Pending`}
          color="purple"
        />
        <StatCard
          title="Active Internships"
          value={stats.activeInternships || 0}
          icon={Briefcase}
          subtitle={`${stats.totalInternships || 0} Total Postings`}
          color="indigo"
        />
        <StatCard
          title="Total Applications"
          value={stats.totalApplications || 0}
          icon={GitBranch}
          subtitle={`${stats.selectedStudentsCount || 0} Offers Issued`}
          color="emerald"
        />
      </div>


      {/* Pending Industry Verification Queue */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              Pending Industry Verification Requests ({data?.pendingVerificationRequests?.length || 0})
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Companies waiting for authorization to publish internship requisitions
            </p>
          </div>
          <Link
            to="/admin/verifications"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
          >
            View Verification Queue →
          </Link>
        </div>

        {(!data?.pendingVerificationRequests || data.pendingVerificationRequests.length === 0) ? (
          <div className="py-8 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-slate-100">
            No pending verification requests at this moment. All companies are verified.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                <tr>
                  <th className="pb-3">Company Name</th>
                  <th className="pb-3">Contact Person</th>
                  <th className="pb-3">Location</th>
                  <th className="pb-3">Official Email</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Review Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data.pendingVerificationRequests.map((ind) => (
                  <tr key={ind._id} className="hover:bg-slate-50">
                    <td className="py-3 font-extrabold text-slate-900">{ind.companyName}</td>
                    <td className="py-3 text-slate-600">{ind.contactPerson}</td>
                    <td className="py-3 text-slate-600">{ind.companyLocation}</td>
                    <td className="py-3 text-slate-600">{ind.officialEmail}</td>
                    <td className="py-3">
                      <StatusBadge status={ind.verificationStatus} />
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => setSelectedIndustry(ind)}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
                      >
                        Inspect & Authorize
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>


      {/* Verification Review Modal */}
      {selectedIndustry && (
        <VerificationReviewModal
          isOpen={!!selectedIndustry}
          onClose={() => setSelectedIndustry(null)}
          industry={selectedIndustry}
          onUpdated={() => {
            fetchAdminDashboard();
            setSelectedIndustry(null);
          }}
        />
      )}

    </div>
  );
};
