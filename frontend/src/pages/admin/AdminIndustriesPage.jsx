import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { Loader } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';
import { StatusBadge, WorkModeBadge } from '../../components/common/Badge';
import {
  Building2,
  Search,
  MapPin,
  Globe,
  Star,
  FileText,
  Briefcase,
  UserCheck,
  UserX,
  Trash2,
  ShieldCheck,
  CheckCircle2,
  Layers,
  ExternalLink,
} from 'lucide-react';
import { VerificationReviewModal } from '../../components/admin/VerificationReviewModal';

export const AdminIndustriesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'internships' ? 'internships' : 'directory';
  const initialStatus = searchParams.get('status') || 'ALL';

  const [activeTab, setActiveTab] = useState(initialTab);
  const [statusFilter, setStatusFilter] = useState(initialStatus);

  const [industries, setIndustries] = useState([]);
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [notification, setNotification] = useState('');

  // Sync with searchParams
  useEffect(() => {
    const qTab = searchParams.get('tab');
    if (qTab === 'internships') setActiveTab('internships');
    else if (qTab === 'directory') setActiveTab('directory');

    const qStatus = searchParams.get('status');
    if (qStatus) setStatusFilter(qStatus);
  }, [searchParams]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [indRes, intRes] = await Promise.all([
        api.get('/admin/industries'),
        api.get('/admin/internships'),
      ]);
      if (indRes.data.success) {
        setIndustries(indRes.data.industries || []);
      }
      if (intRes.data.success) {
        setInternships(intRes.data.internships || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUserStatusChange = async (ind, nextStatus) => {
    const userId = ind.user?._id || ind.user;
    if (!userId) {
      alert('Associated user account not found');
      return;
    }

    try {
      setActionLoadingId(ind._id);
      const res = await api.put(`/admin/users/${userId}/status`, { status: nextStatus });
      if (res.data.success) {
        setNotification(`Company account "${ind.companyName}" marked as ${nextStatus}`);
        setIndustries(prev =>
          prev.map(i => {
            if (i._id === ind._id) {
              return {
                ...i,
                user: { ...i.user, status: nextStatus },
              };
            }
            return i;
          })
        );
        setTimeout(() => setNotification(''), 3500);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update company account status');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteIndustry = async (ind) => {
    const confirmName = prompt(
      `Are you sure you want to permanently delete company "${ind.companyName}" and its requisitions? Type DELETE to confirm:`
    );
    if (confirmName !== 'DELETE') return;

    const userId = ind.user?._id || ind.user;
    try {
      setActionLoadingId(ind._id);
      const res = await api.delete(`/admin/users/${userId}`);
      if (res.data.success) {
        setNotification(`Company "${ind.companyName}" deleted permanently.`);
        setIndustries(prev => prev.filter(i => i._id !== ind._id));
        setInternships(prev => prev.filter(j => j.industry?._id !== ind._id));
        setTimeout(() => setNotification(''), 3500);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete company account');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleToggleInternshipStatus = async (id, currentStatus) => {
    const next = currentStatus === 'OPEN' ? 'CLOSED' : 'OPEN';
    try {
      setActionLoadingId(id);
      const res = await api.put(`/admin/internships/${id}/status`, { status: next });
      if (res.data.success) {
        setNotification(`Internship requisition updated to ${next}`);
        setInternships(prev =>
          prev.map(j => (j._id === id ? { ...j, status: next } : j))
        );
        setTimeout(() => setNotification(''), 3000);
      }
    } catch (e) {
      alert('Failed to update internship status');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams(prev => {
      const p = new URLSearchParams(prev);
      p.set('tab', tab);
      return p;
    });
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    setSearchParams(prev => {
      const p = new URLSearchParams(prev);
      if (status === 'ALL') p.delete('status');
      else p.set('status', status);
      return p;
    });
  };

  // Filtered industries
  const filteredIndustries = industries.filter((ind) => {
    const matchesQuery =
      (ind.companyName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ind.officialEmail || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ind.companyLocation || '').toLowerCase().includes(searchQuery.toLowerCase());

    const userStatus = ind.user?.status || 'ACTIVE';

    if (statusFilter === 'ACTIVE') return matchesQuery && userStatus === 'ACTIVE';
    if (statusFilter === 'INACTIVE') return matchesQuery && userStatus === 'INACTIVE';
    if (statusFilter === 'VERIFIED') return matchesQuery && ind.verificationStatus === 'APPROVED';
    if (statusFilter === 'PENDING') return matchesQuery && ind.verificationStatus === 'PENDING';

    return matchesQuery;
  });

  // Filtered internships
  const filteredInternships = internships.filter((j) => {
    return (
      (j.role || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (j.industry?.companyName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (j.domain || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (j.location || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  if (loading) return <Loader message="Fetching industry employers & internship requisitions..." />;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Industry Employers & Requisitions
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Integrated corporate governance: manage employer accounts, verifications, and active internship requisitions in one place.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={activeTab === 'directory' ? 'Search company or location...' : 'Search role, company or domain...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Top Navigation Tabs: Directory vs Integrated Internships */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-1">
        <div className="flex gap-2">
          <button
            onClick={() => handleTabChange('directory')}
            className={`flex items-center gap-2 pb-2.5 px-3 text-xs font-black border-b-2 transition-all ${
              activeTab === 'directory'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Company Directory & Profiles ({industries.length})</span>
          </button>

          <button
            onClick={() => handleTabChange('internships')}
            className={`flex items-center gap-2 pb-2.5 px-3 text-xs font-black border-b-2 transition-all ${
              activeTab === 'internships'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Integrated Internship Requisitions ({internships.length})</span>
          </button>
        </div>
      </div>

      {/* Directory Tab */}
      {activeTab === 'directory' && (
        <div className="space-y-4">
          
          {/* Status Filter Pills for Easy Access */}
          <div className="bg-white rounded-2xl p-2.5 border border-slate-200/80 shadow-sm flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">
              Filter Companies:
            </span>
            {[
              { id: 'ALL', label: `All (${industries.length})` },
              { id: 'ACTIVE', label: `Active (${industries.filter(i => (i.user?.status || 'ACTIVE') === 'ACTIVE').length})` },
              { id: 'INACTIVE', label: `Deactivated (${industries.filter(i => (i.user?.status || 'ACTIVE') === 'INACTIVE').length})` },
              { id: 'VERIFIED', label: `Verified (${industries.filter(i => i.verificationStatus === 'APPROVED').length})` },
              { id: 'PENDING', label: `Pending Verification (${industries.filter(i => i.verificationStatus === 'PENDING').length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleStatusFilterChange(tab.id)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === tab.id
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {filteredIndustries.length === 0 ? (
            <EmptyState title="No Companies Found" description="No registered industry accounts match your filter criteria." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredIndustries.map((ind) => {
                const userStatus = ind.user?.status || 'ACTIVE';
                const isInactive = userStatus === 'INACTIVE';
                const isActing = actionLoadingId === ind._id;
                const companyInternshipsCount = internships.filter(j => j.industry?._id === ind._id).length;

                return (
                  <div
                    key={ind._id}
                    className={`bg-white rounded-3xl p-6 border shadow-card flex flex-col justify-between transition-all ${
                      isInactive ? 'border-rose-200 bg-rose-50/20 opacity-80' : 'border-slate-200/80 hover:border-indigo-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 font-black text-sm flex items-center justify-center border border-indigo-100 shadow-sm">
                            {ind.companyName?.slice(0, 2).toUpperCase() || 'CO'}
                          </div>
                          <div>
                            <h3 className={`text-base font-extrabold line-clamp-1 ${isInactive ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                              {ind.companyName}
                            </h3>
                            <p className="text-xs text-slate-500 font-medium">
                              {ind.industryType || 'Enterprise'}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                          <StatusBadge status={ind.verificationStatus} />
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                            isInactive ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {isInactive ? 'Deactivated' : 'Active Account'}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-600 my-3 pt-3 border-t border-slate-100">
                        <p className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{ind.companyLocation}</span>
                        </p>
                        <p className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>Contact: <b>{ind.contactPerson}</b></span>
                        </p>
                        <p className="truncate text-slate-400">
                          {ind.officialEmail}
                        </p>
                      </div>

                      {/* Internship Quick Count link */}
                      <div className="py-2 px-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700 mb-3">
                        <span className="flex items-center gap-1.5">
                          <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                          <span>{companyInternshipsCount} Posted Requisitions</span>
                        </span>
                        <button
                          onClick={() => {
                            setSearchQuery(ind.companyName);
                            handleTabChange('internships');
                          }}
                          className="text-indigo-600 hover:text-indigo-800 text-[11px] font-extrabold"
                        >
                          View →
                        </button>
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => setSelectedIndustry(ind)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors"
                      >
                        Verification
                      </button>

                      <div className="flex items-center gap-1">
                        {isInactive ? (
                          <button
                            disabled={isActing}
                            onClick={() => handleUserStatusChange(ind, 'ACTIVE')}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs transition-colors border border-emerald-200 disabled:opacity-50"
                            title="Reactivate company account"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Activate</span>
                          </button>
                        ) : (
                          <button
                            disabled={isActing}
                            onClick={() => handleUserStatusChange(ind, 'INACTIVE')}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-xs transition-colors border border-amber-200 disabled:opacity-50"
                            title="Deactivate company account"
                          >
                            <UserX className="w-3.5 h-3.5" />
                            <span>Deactivate</span>
                          </button>
                        )}

                        <button
                          disabled={isActing}
                          onClick={() => handleDeleteIndustry(ind)}
                          className="inline-flex items-center p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition-colors border border-rose-200 disabled:opacity-50"
                          title="Delete company permanently"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Internships Requisitions Tab (Integrated) */}
      {activeTab === 'internships' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-700 uppercase tracking-wider">
              Live Requisition Oversight ({filteredInternships.length})
            </h3>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-indigo-600 font-bold hover:underline"
              >
                Clear Search Filter
              </button>
            )}
          </div>

          {filteredInternships.length === 0 ? (
            <EmptyState title="No Internships Found" description="No requisitions match your search criteria." />
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
                      <th className="py-4 px-6 text-right">Requisition Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredInternships.map((j) => (
                      <tr key={j._id} className="hover:bg-slate-50/80 transition-colors">
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
                            onClick={() => handleToggleInternshipStatus(j._id, j.status)}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors ${
                              j.status === 'OPEN'
                                ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
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
            </div>
          )}
        </div>
      )}

      {selectedIndustry && (
        <VerificationReviewModal
          isOpen={!!selectedIndustry}
          onClose={() => setSelectedIndustry(null)}
          industry={selectedIndustry}
          onUpdated={() => {
            fetchData();
            setSelectedIndustry(null);
          }}
        />
      )}

    </div>
  );
};
