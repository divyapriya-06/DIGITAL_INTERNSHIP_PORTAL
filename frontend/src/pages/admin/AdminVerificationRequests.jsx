import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Loader } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';
import { StatusBadge } from '../../components/common/Badge';
import { VerificationReviewModal } from '../../components/admin/VerificationReviewModal';
import { ShieldCheck, Filter, Search, Building2, FileText, CheckCircle2, Clock, XCircle } from 'lucide-react';

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

  const filtered = industries.filter((ind) =>
    (ind.companyName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (ind.officialEmail || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (ind.companyLocation || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <Loader message="Fetching verification queue..." />;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Industry Verification Requests
        </h2>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Review corporate documents, GST filings, company credentials, and manage authorization statuses.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-card flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
          {[
            { id: 'PENDING', label: 'Pending Review' },
            { id: 'APPROVED', label: 'Verified & Approved' },
            { id: 'REJECTED', label: 'Rejected' },
            { id: 'ON_HOLD', label: 'On Hold' },
            { id: 'ALL', label: 'All Requests' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === tab.id
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search company name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      {/* Requests Table */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No Verification Records Found"
          description={`No corporate verification requests currently in "${statusFilter}" state.`}
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card overflow-hidden">
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
                        onClick={() => setSelectedIndustry(ind)}
                        className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm"
                      >
                        Inspect & Decide
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
