import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Loader } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';
import { StatusBadge } from '../../components/common/Badge';
import { GitBranch, Search, Filter, GraduationCap, Building2 } from 'lucide-react';

export const AdminApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('ALL');

  const fetchApps = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/applications');
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
    fetchApps();
  }, []);

  const filtered = applications.filter((a) => {
    const textMatch =
      (a.student?.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.industry?.companyName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.internship?.role || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (stageFilter === 'ALL') return textMatch;
    return textMatch && a.status === stageFilter;
  });

  if (loading) return <Loader message="Fetching institutional application ledger..." />;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Institutional Application Ledger ({applications.length})
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Audit candidate applications, recruitment stages, and offer outcomes across all partner employers.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search candidate, role or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      {/* Stage Filter Pills */}
      <div className="bg-white rounded-3xl p-3.5 border border-slate-200/80 shadow-card flex flex-wrap gap-1.5">
        {[
          { id: 'ALL', label: 'All Submissions' },
          { id: 'APPLIED', label: 'Applied' },
          { id: 'UNDER_REVIEW', label: 'Under Review' },
          { id: 'SHORTLISTED', label: 'Shortlisted' },
          { id: 'ROUND_1', label: 'Round 1' },
          { id: 'ROUND_2', label: 'Round 2' },
          { id: 'TECHNICAL', label: 'Technical' },
          { id: 'HR', label: 'HR' },
          { id: 'SELECTED', label: 'Selected & Placed' },
          { id: 'REJECTED', label: 'Rejected' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStageFilter(tab.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              stageFilter === tab.id
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState title="No Applications Found" description="No candidate applications match your current filters." />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                <tr>
                  <th className="py-4 px-6">Student Candidate</th>
                  <th className="py-4 px-4">College & Dept</th>
                  <th className="py-4 px-4">Requisition Role</th>
                  <th className="py-4 px-4">Employer</th>
                  <th className="py-4 px-4">Current Stage</th>
                  <th className="py-4 px-6 text-right">Applied Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((a) => (
                  <tr key={a._id} className="hover:bg-slate-50/80">
                    <td className="py-4 px-6 font-extrabold text-slate-900">
                      {a.student?.fullName || 'Student'}
                    </td>
                    <td className="py-4 px-4 text-slate-600">
                      {a.student?.college}
                    </td>
                    <td className="py-4 px-4 font-bold text-slate-800">
                      {a.internship?.role}
                    </td>
                    <td className="py-4 px-4 text-slate-600">
                      {a.industry?.companyName}
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={a.status} />
                    </td>
                    <td className="py-4 px-6 text-right text-slate-400">
                      {new Date(a.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
