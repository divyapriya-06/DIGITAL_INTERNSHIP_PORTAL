import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { ApplicationTimeline } from '../../components/student/ApplicationTimeline';
import { Loader } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';
import { Briefcase, Filter, Search, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const StudentApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/student/applications');
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
    fetchApplications();
  }, []);

  const handleDeleteRejected = async (appId) => {
    if (!window.confirm('Are you sure you want to remove this rejected application from your active tracking dashboard?')) return;

    try {
      const res = await api.delete(`/student/applications/${appId}`);
      if (res.data.success) {
        setApplications(prev => prev.filter(a => a._id !== appId));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete application');
    }
  };

  const filteredApps = applications.filter((app) => {
    const roleMatch = (app.internship?.role || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                      (app.industry?.companyName || '').toLowerCase().includes(searchQuery.toLowerCase());
    if (statusFilter === 'ALL') return roleMatch;
    if (statusFilter === 'ACTIVE') return roleMatch && !['SELECTED', 'REJECTED'].includes(app.status);
    return roleMatch && app.status === statusFilter;
  });

  if (loading) return <Loader message="Fetching your application pipeline..." />;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            My Application Pipeline
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Track interview rounds, meeting links, recruiter feedback and selection status in real-time.
          </p>
        </div>

        <Link
          to="/student/find"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 transition-all shrink-0"
        >
          <Briefcase className="w-4 h-4" />
          <span>Apply to More Roles</span>
        </Link>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-card flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap gap-1 w-full sm:w-auto">
          {[
            { id: 'ALL', label: 'All Applications' },
            { id: 'ACTIVE', label: 'In Progress' },
            { id: 'SELECTED', label: 'Selected / Placed' },
            { id: 'REJECTED', label: 'Rejected' },
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
            placeholder="Search company or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      {/* Applications List */}
      {filteredApps.length === 0 ? (
        <EmptyState
          title="No Applications Found"
          description={statusFilter !== 'ALL' ? 'No applications match your active filter.' : 'You have not submitted any applications yet. Explore internships and apply today!'}
          actionLabel="Find Internships"
          onAction={() => window.location.href = '/student/find'}
        />
      ) : (
        <div className="space-y-6">
          {filteredApps.map((app) => (
            <ApplicationTimeline
              key={app._id}
              application={app}
              onDeleteRejected={handleDeleteRejected}
            />
          ))}
        </div>
      )}

    </div>
  );
};
