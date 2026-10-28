import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Loader } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import {
  Star,
  MessageSquareQuote,
  Building2,
  Lightbulb,
  Sparkles,
  CheckCircle2,
  Clock,
  Send,
  PlusCircle,
  Filter,
  Tag,
  AlertCircle,
  ThumbsUp,
} from 'lucide-react';

export const AdminFeedbackPage = () => {
  const [activeTab, setActiveTab] = useState('portal'); // 'portal' | 'evaluations'
  const [portalFeedback, setPortalFeedback] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters for portal feedback
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Submit Modal state
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [submitCategory, setSubmitCategory] = useState('PORTAL_IMPROVEMENT');
  const [submitTitle, setSubmitTitle] = useState('');
  const [submitDescription, setSubmitDescription] = useState('');
  const [submitPriority, setSubmitPriority] = useState('MEDIUM');
  const [submitting, setSubmitting] = useState(false);

  // Status update modal for admin
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [adminResponse, setAdminResponse] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [revRes, feedRes] = await Promise.all([
        api.get('/reviews/all'),
        api.get('/feedback/portal'),
      ]);

      if (revRes.data.success) {
        setReviews(revRes.data.reviews || []);
      }
      if (feedRes.data.success) {
        setPortalFeedback(feedRes.data.feedback || []);
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

  const handleCreateFeedback = async (e) => {
    e.preventDefault();
    if (!submitTitle || !submitDescription) return;

    try {
      setSubmitting(true);
      const res = await api.post('/feedback/portal', {
        category: submitCategory,
        title: submitTitle,
        description: submitDescription,
        priority: submitPriority,
      });

      if (res.data.success) {
        setSuccessMsg('Portal suggestion submitted successfully!');
        setIsSubmitOpen(false);
        setSubmitTitle('');
        setSubmitDescription('');
        fetchData();
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedFeedback) return;

    try {
      setUpdatingStatus(true);
      const res = await api.put(`/feedback/portal/${selectedFeedback._id}/status`, {
        status: newStatus,
        adminResponse,
      });

      if (res.data.success) {
        setSuccessMsg(`Feedback status updated to ${newStatus}`);
        setSelectedFeedback(null);
        fetchData();
        setTimeout(() => setSuccessMsg(''), 3500);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update feedback status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const filteredPortalFeedback = portalFeedback.filter((item) => {
    if (categoryFilter !== 'ALL' && item.category !== categoryFilter) return false;
    return true;
  });

  if (loading) return <Loader message="Compiling portal improvement suggestions & evaluations..." />;

  const getCategoryBadge = (cat) => {
    switch (cat) {
      case 'PORTAL_IMPROVEMENT':
        return <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-extrabold text-[10px] border border-indigo-200">Portal Improvement</span>;
      case 'SUGGESTION':
        return <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-extrabold text-[10px] border border-emerald-200">Feature Suggestion</span>;
      case 'FEATURE_REQUEST':
        return <span className="px-2.5 py-0.5 rounded-md bg-purple-50 text-purple-700 font-extrabold text-[10px] border border-purple-200">Feature Request</span>;
      case 'BUG_REPORT':
        return <span className="px-2.5 py-0.5 rounded-md bg-rose-50 text-rose-700 font-extrabold text-[10px] border border-rose-200">Bug Report</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-extrabold text-[10px]">General</span>;
    }
  };

  const getStatusBadge = (st) => {
    switch (st) {
      case 'IMPLEMENTED':
        return <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-black text-[10px]">Implemented</span>;
      case 'PLANNED':
        return <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-black text-[10px]">Planned</span>;
      case 'UNDER_REVIEW':
        return <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-black text-[10px]">Under Review</span>;
      case 'DISMISSED':
        return <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-black text-[10px]">Dismissed</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-black text-[10px]">Pending</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Institutional Feedback & Portal Suggestions
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Review user-submitted portal improvement suggestions, feature proposals, and peer company evaluations.
          </p>
        </div>

        <button
          onClick={() => setIsSubmitOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 transition-all shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Submit Portal Suggestion</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
        <button
          onClick={() => setActiveTab('portal')}
          className={`flex items-center gap-2 pb-2.5 px-3 text-xs font-black border-b-2 transition-all ${
            activeTab === 'portal'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Lightbulb className="w-4 h-4" />
          <span>Portal Improvements & Suggestions ({portalFeedback.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('evaluations')}
          className={`flex items-center gap-2 pb-2.5 px-3 text-xs font-black border-b-2 transition-all ${
            activeTab === 'evaluations'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <MessageSquareQuote className="w-4 h-4" />
          <span>Company & Student Evaluations ({reviews.length})</span>
        </button>
      </div>

      {/* TAB 1: PORTAL IMPROVEMENTS & SUGGESTIONS */}
      {activeTab === 'portal' && (
        <div className="space-y-4">
          
          {/* Category Filter Only */}
          <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-sm flex flex-wrap items-center gap-2 text-xs">
            <span className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">
              Category:
            </span>
            {[
              { id: 'ALL', label: 'All' },
              { id: 'PORTAL_IMPROVEMENT', label: 'Portal Improvement' },
              { id: 'SUGGESTION', label: 'Feature Suggestion' },
              { id: 'FEATURE_REQUEST', label: 'Feature Request' },
              { id: 'BUG_REPORT', label: 'Bug Report' },
            ].map((c) => (
              <button
                key={c.id}
                onClick={() => setCategoryFilter(c.id)}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
                  categoryFilter === c.id
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                    : 'text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {c.label}
              </button>
            ))}
            <span className="ml-auto text-[11px] text-slate-400 font-medium">
              {filteredPortalFeedback.length} suggestion{filteredPortalFeedback.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Feedback list */}
          {filteredPortalFeedback.length === 0 ? (
            <EmptyState
              title="No Portal Feedback Yet"
              description="Users have not submitted any suggestions matching this filter. Click 'Submit Portal Suggestion' above to add one."
              icon={Lightbulb}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPortalFeedback.map((item) => (
                <div
                  key={item._id}
                  className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card flex flex-col justify-between space-y-4 hover:border-indigo-200 hover:shadow-lg transition-all duration-200"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {getCategoryBadge(item.category)}
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                          item.priority === 'HIGH'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : item.priority === 'MEDIUM'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          {item.priority} Priority
                        </span>
                      </div>
                      {getStatusBadge(item.status)}
                    </div>

                    <h4 className="text-base font-black text-slate-900 mt-1 leading-snug">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed whitespace-pre-line line-clamp-3">
                      {item.description}
                    </p>

                    {item.adminResponse && (
                      <div className="mt-3 p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs">
                        <span className="font-extrabold text-indigo-900 block mb-0.5">Admin Response:</span>
                        <p className="text-indigo-800">{item.adminResponse}</p>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-600">
                        {(item.name || item.user?.name || 'U').charAt(0).toUpperCase()}
                      </div>
                      <span>
                        <b className="text-slate-700">{item.name || item.user?.name || 'Portal User'}</b>
                        <span className="ml-1 uppercase text-[10px] px-1.5 py-0.5 rounded bg-slate-100 font-bold text-slate-600">
                          {item.role || item.user?.role || 'user'}
                        </span>
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedFeedback(item);
                        setNewStatus(item.status);
                        setAdminResponse(item.adminResponse || '');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition-colors border border-indigo-200"
                    >
                      Update Status
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* TAB 2: COMPANY & STUDENT EVALUATIONS (REVIEWS) */}
      {activeTab === 'evaluations' && (
        <div>
          {reviews.length === 0 ? (
            <EmptyState title="No Reviews Submitted Yet" description="Reviews submitted by students and employers will appear here." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map((r) => (
                <div key={r._id} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                        {r.industry?.companyName}
                      </span>
                      <span className="flex items-center text-amber-500 font-extrabold text-xs">
                        ★ {r.rating}/5
                      </span>
                    </div>

                    <h4 className="text-sm font-extrabold text-slate-900 mb-1">"{r.title}"</h4>
                    <p className="text-xs text-slate-600 italic">"{r.feedback}"</p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 mt-4 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Author: <b>{r.authorUser?.name}</b> ({r.authorRole})</span>
                    <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUBMIT MODAL */}
      {isSubmitOpen && (
        <Modal
          isOpen={isSubmitOpen}
          onClose={() => setIsSubmitOpen(false)}
          title="Submit Portal Improvement or Suggestion"
        >
          <form onSubmit={handleCreateFeedback} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={submitCategory}
                onChange={(e) => setSubmitCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white"
              >
                <option value="PORTAL_IMPROVEMENT">Portal Improvement</option>
                <option value="SUGGESTION">Feature Suggestion</option>
                <option value="FEATURE_REQUEST">Feature Request</option>
                <option value="BUG_REPORT">Bug Report</option>
                <option value="GENERAL">General Feedback</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Priority Level
              </label>
              <select
                value={submitPriority}
                onChange={(e) => setSubmitPriority(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Suggestion Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Add dark mode toggle or auto-fill college details"
                value={submitTitle}
                onChange={(e) => setSubmitTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Detailed Proposal / Improvement Idea
              </label>
              <textarea
                rows="4"
                required
                placeholder="Explain the proposed improvement or feature suggestion in detail..."
                value={submitDescription}
                onChange={(e) => setSubmitDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsSubmitOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-200 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Post Suggestion'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* UPDATE STATUS MODAL */}
      {selectedFeedback && (
        <Modal
          isOpen={!!selectedFeedback}
          onClose={() => setSelectedFeedback(null)}
          title="Update Feedback Status"
        >
          <form onSubmit={handleUpdateStatus} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Suggestion: <b>{selectedFeedback.title}</b>
              </label>
              <p className="text-xs text-slate-500">{selectedFeedback.description}</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white"
              >
                <option value="PENDING">Pending</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="PLANNED">Planned</option>
                <option value="IMPLEMENTED">Implemented</option>
                <option value="DISMISSED">Dismissed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Admin Response (Visible to User)
              </label>
              <textarea
                rows="3"
                placeholder="Add a comment or development status update..."
                value={adminResponse}
                onChange={(e) => setAdminResponse(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedFeedback(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updatingStatus}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-200 disabled:opacity-50"
              >
                {updatingStatus ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
};
