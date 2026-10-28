import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Loader } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';
import { StatusBadge, WorkModeBadge } from '../../components/common/Badge';
import { Briefcase, Search, ChevronLeft, ChevronRight } from 'lucide-react';

const ROWS_PER_PAGE = 5;

export const AdminInternshipsPage = () => {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const fetchInternships = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/internships');
      if (res.data.success) {
        setInternships(res.data.internships || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInternships();
  }, []);

  const handleToggleStatus = async (id, currentStatus) => {
    const next = currentStatus === 'OPEN' ? 'CLOSED' : 'OPEN';
    try {
      const res = await api.put(`/admin/internships/${id}/status`, { status: next });
      if (res.data.success) {
        fetchInternships();
      }
    } catch (e) {
      alert('Failed to update status');
    }
  };

  const filtered = internships.filter((j) =>
    (j.role || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (j.industry?.companyName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (j.domain || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <Loader message="Fetching institutional internship oversight..." />;

  const totalPages = Math.ceil(filtered.length / ROWS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ROWS_PER_PAGE, currentPage * ROWS_PER_PAGE);

  const handleSearch = (val) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Internships
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Monitor all posted requisitions across partner companies, track vacancy fulfillment, and enforce compliance.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search requisition or company..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState title="No Internships Found" description="No requisitions match your query." />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                <tr>
                  <th className="py-4 px-6">Role & Domain</th>
                  <th className="py-4 px-4">Posting Company</th>
                  <th className="py-4 px-4">Location / Mode</th>
                  <th className="py-4 px-4">Stipend</th>
                  <th className="py-4 px-4">Vacancy Target</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-6 text-right">Admin Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginated.map((j) => (
                  <tr key={j._id} className="hover:bg-slate-50/80">
                    <td className="py-4 px-6 font-extrabold text-slate-900">
                      <div>{j.role}</div>
                      <div className="text-[11px] text-indigo-600 font-medium">{j.domain}</div>
                    </td>

                    <td className="py-4 px-4 font-bold text-slate-800">
                      {j.industry?.companyName}
                    </td>

                    <td className="py-4 px-4 text-slate-600">
                      <div>{j.location}</div>
                      <div className="mt-0.5"><WorkModeBadge mode={j.workMode} /></div>
                    </td>

                    <td className="py-4 px-4 font-black text-slate-900">
                      ₹{j.stipend?.toLocaleString()}/mo
                    </td>

                    <td className="py-4 px-4">
                      <span className="font-bold text-indigo-950 bg-indigo-50 px-2 py-0.5 rounded">
                        {j.selectedCount || 0} / {j.requiredCandidates} Filled
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <StatusBadge status={j.status} />
                    </td>

                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleToggleStatus(j._id, j.status)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs ${
                          j.status === 'OPEN'
                            ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        {j.status === 'OPEN' ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between px-6 py-3 border-t border-slate-100 bg-slate-50/60">
            <span className="text-[11px] text-slate-500 font-medium">
              {filtered.length === 0
                ? 'No results'
                : `Showing ${(currentPage - 1) * ROWS_PER_PAGE + 1}–${Math.min(currentPage * ROWS_PER_PAGE, filtered.length)} of ${filtered.length} internships`}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Previous
              </button>
              <span className="text-xs font-bold text-slate-600 px-1">
                {currentPage} / {Math.max(1, totalPages)}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages || totalPages <= 1}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
