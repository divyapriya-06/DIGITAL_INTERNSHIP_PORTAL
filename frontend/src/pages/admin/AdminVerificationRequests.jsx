import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Loader } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';
import { StatusBadge } from '../../components/common/Badge';
import { VerificationReviewModal } from '../../components/admin/VerificationReviewModal';
import { ShieldCheck, Search, Building2, FileText, CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';

// Demo placeholder companies shown when no real data is available
const DEMO_COMPANIES = [
  {
    _id: 'demo-1',
    companyName: 'Nexora Technologies Pvt. Ltd.',
    companyLocation: 'Bengaluru, Karnataka',
    industryType: 'IT Services',
    contactPerson: 'Aditya Mehta',
    officialEmail: 'aditya@nexora.in',
    phone: '+91 98765 43210',
    verificationStatus: 'PENDING',
    verificationProofPath: 'demo-proof.pdf',
    _isDemo: true,
  },
  {
    _id: 'demo-2',
    companyName: 'Greenfield Solar Solutions',
    companyLocation: 'Hyderabad, Telangana',
    industryType: 'Renewable Energy',
    contactPerson: 'Priya Nair',
    officialEmail: 'priya@greenfieldsolar.com',
    phone: '+91 91234 56789',
    verificationStatus: 'REJECTED',
    verificationProofPath: null,
    _isDemo: true,
  },
];

export const AdminVerificationRequests = () => {
  const [industries, setIndustries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState(null);

  const fetchVerifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/verifications', {
        params: { status: statusFilter !== 'ALL' ? statusFilter : undefined },
      });
      if (res.data.success) {
        setIndustries(res.data.industries || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifications();
  }, [statusFilter]);

  // Merge real + demo entries (demo entries fill empty slots)
  const allEntries = industries.length > 0
    ? industries
    : DEMO_COMPANIES.filter((d) =>
        statusFilter === 'ALL' || d.verificationStatus === statusFilter
      );

  const filtered = allEntries.filter((ind) =>
    (ind.companyName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (ind.officialEmail || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (ind.companyLocation || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Count for each status from real data (for tab badges)
  const pendingCount = industries.filter((i) => i.verificationStatus === 'PENDING').length;
  const approvedCount = industries.filter((i) => i.verificationStatus === 'APPROVED').length;
  const rejectedCount = industries.filter((i) => i.verificationStatus === 'REJECTED').length;
  const onHoldCount = industries.filter((i) => i.verificationStatus === 'ON_HOLD').length;

  const TABS = [
    {
      id: 'PENDING',
      label: 'Pending Review',
      icon: Clock,
      color: 'amber',
      count: pendingCount || (industries.length === 0 ? 1 : 0),
    },
    {
      id: 'APPROVED',
      label: 'Verified',
      icon: CheckCircle2,
      color: 'emerald',
      count: approvedCount,
    },
    {
      id: 'REJECTED',
      label: 'Rejected',
      icon: XCircle,
      color: 'rose',
      count: rejectedCount || (industries.length === 0 ? 1 : 0),
    },
    {
      id: 'ON_HOLD',
      label: 'On Hold',
      icon: AlertCircle,
      color: 'slate',
      count: onHoldCount,
    },
    {
      id: 'ALL',
      label: 'All Requests',
      icon: Building2,
      color: 'indigo',
      count: industries.length,
    },
  ];

  const tabColorMap = {
    amber: {
      active: 'bg-amber-500 text-white shadow-sm shadow-amber-200',
      inactive: 'text-amber-700 hover:bg-amber-50 border border-amber-200',
      badge: 'bg-amber-100 text-amber-800',
    },
    emerald: {
      active: 'bg-emerald-600 text-white shadow-sm shadow-emerald-200',
      inactive: 'text-emerald-700 hover:bg-emerald-50 border border-emerald-200',
      badge: 'bg-emerald-100 text-emerald-800',
    },
    rose: {
      active: 'bg-rose-600 text-white shadow-sm shadow-rose-200',
      inactive: 'text-rose-700 hover:bg-rose-50 border border-rose-200',
      badge: 'bg-rose-100 text-rose-800',
    },
    slate: {
      active: 'bg-slate-700 text-white shadow-sm shadow-slate-200',
      inactive: 'text-slate-600 hover:bg-slate-100 border border-slate-200',
      badge: 'bg-slate-100 text-slate-700',
    },
    indigo: {
      active: 'bg-indigo-600 text-white shadow-sm shadow-indigo-200',
      inactive: 'text-indigo-700 hover:bg-indigo-50 border border-indigo-200',
      badge: 'bg-indigo-100 text-indigo-800',
    },
  };

  if (loading) return <Loader message="Fetching verification queue..." />;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-indigo-600" />
            Industry Verification Requests
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Review corporate documents, GST filings, company credentials, and manage authorization statuses.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search company name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      {/* Enhanced Filter Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const colors = tabColorMap[tab.color];
          const isActive = statusFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                isActive ? colors.active : `bg-white ${colors.inactive}`
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{tab.label}</span>
              </div>
              {tab.count > 0 && (
                <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full min-w-[20px] text-center ${
                  isActive ? 'bg-white/20 text-white' : colors.badge
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Requests Table */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No Verification Records Found"
          description={`No corporate verification requests currently in "${statusFilter}" state.`}
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card overflow-hidden">
          {/* Demo Notice */}
          {allEntries.some((e) => e._isDemo) && (
            <div className="px-6 py-2.5 bg-amber-50 border-b border-amber-100 flex items-center gap-2 text-[11px] text-amber-800 font-semibold">
              <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              Sample entries shown for demonstration. Real submissions will appear here.
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                <tr>
                  <th className="py-4 px-6">Company & Location</th>
                  <th className="py-4 px-4">Contact Person</th>
                  <th className="py-4 px-4">Official Email & Phone</th>
                  <th className="py-4 px-4">Document Proof</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-6 text-right">Review Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((ind) => (
                  <tr key={ind._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 font-black text-xs flex items-center justify-center shrink-0 border border-indigo-100">
                          {ind.companyName?.slice(0, 2).toUpperCase() || 'CO'}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-sm">{ind.companyName}</h4>
                          <p className="text-[11px] text-slate-500">{ind.companyLocation} • {ind.industryType}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 font-bold text-slate-800">
                      {ind.contactPerson}
                    </td>

                    <td className="py-4 px-4 text-slate-600">
                      <div>{ind.officialEmail}</div>
                      <div className="text-[11px] text-slate-400">{ind.phone || 'N/A'}</div>
                    </td>

                    <td className="py-4 px-4">
                      {ind.verificationProofPath ? (
                        <span className="inline-flex items-center gap-1 text-indigo-600 font-bold">
                          <FileText className="w-3.5 h-3.5" />
                          <span>Proof Attached</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">No document</span>
                      )}
                    </td>

                    <td className="py-4 px-4">
                      <StatusBadge status={ind.verificationStatus} />
                    </td>

                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => !ind._isDemo && setSelectedIndustry(ind)}
                        className={`px-4 py-1.5 rounded-xl font-bold text-xs shadow-sm transition-all ${
                          ind._isDemo
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        }`}
                        title={ind._isDemo ? 'Demo entry — not actionable' : 'Review this request'}
                      >
                        {ind._isDemo ? 'Demo Entry' : 'Inspect & Decide'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Verification Review Modal */}
      {selectedIndustry && (
        <VerificationReviewModal
          isOpen={!!selectedIndustry}
          onClose={() => setSelectedIndustry(null)}
          industry={selectedIndustry}
          onUpdated={() => {
            fetchVerifications();
            setSelectedIndustry(null);
          }}
        />
      )}

    </div>
  );
};
