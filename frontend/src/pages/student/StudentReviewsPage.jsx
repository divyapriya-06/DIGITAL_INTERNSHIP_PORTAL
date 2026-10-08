import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import { Loader } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Star,
  MessageSquareQuote,
  CheckCircle2,
  Building2,
  Send,
  Search,
  MapPin,
  Globe,
  X,
} from 'lucide-react';

// Interactive Star Rating Component
const StarRating = ({ value, onChange, label }) => {
  const [hovered, setHovered] = useState(0);

  return (
    <div>
      {label && (
        <label className="block font-bold text-slate-700 text-xs mb-1.5">{label}</label>
      )}
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => onChange(star)}
            className="p-0.5 transition-transform hover:scale-125 focus:outline-none"
            title={`${star} star${star > 1 ? 's' : ''}`}
          >
            <Star
              className={`w-6 h-6 transition-colors ${
                star <= (hovered || value)
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-slate-300 fill-transparent'
              }`}
            />
          </button>
        ))}
        <span className="ml-1.5 text-xs font-bold text-slate-600">
          {value > 0 ? `${value}/5` : ''}
        </span>
      </div>
    </div>
  );
};

// Company Autocomplete Component
const CompanyAutocomplete = ({ companies, value, onChange }) => {
  const [inputVal, setInputVal] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const ref = useRef(null);

  const selectedCompany = companies.find(c => c._id === value);

  useEffect(() => {
    if (selectedCompany) {
      setInputVal(selectedCompany.companyName);
    }
  }, [value, companies]);

  const filtered = companies.filter(c =>
    (c.companyName || '').toLowerCase().includes(inputVal.toLowerCase())
  ).slice(0, 10);

  const handleSelect = (company) => {
    onChange(company._id);
    setInputVal(company.companyName);
    setShowDropdown(false);
  };

  const handleClear = () => {
    onChange('');
    setInputVal('');
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setShowDropdown(false);
        // Reset if invalid selection
        if (!companies.find(c => c.companyName === inputVal)) {
          setInputVal(selectedCompany?.companyName || '');
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [inputVal, companies, selectedCompany]);

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search and select company..."
          value={inputVal}
          onChange={(e) => {
            setInputVal(e.target.value);
            setShowDropdown(true);
            if (!e.target.value) onChange('');
          }}
          onFocus={() => setShowDropdown(true)}
          className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
        />
        {inputVal && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {selectedCompany && (
        <div className="mt-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center gap-2 text-xs">
          <div className="w-5 h-5 rounded-md bg-indigo-600 text-white flex items-center justify-center font-black text-[9px] shrink-0">
            {selectedCompany.companyName?.slice(0, 2).toUpperCase()}
          </div>
          <span className="font-bold text-indigo-800">{selectedCompany.companyName}</span>
          {selectedCompany.companyLocation && (
            <span className="text-indigo-500 flex items-center gap-0.5">
              <MapPin className="w-3 h-3" /> {selectedCompany.companyLocation}
            </span>
          )}
        </div>
      )}

      {showDropdown && filtered.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-2xl border border-slate-200 shadow-2xl z-30 overflow-hidden">
          <div className="px-3 py-2 border-b border-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {filtered.length} Companies Found
          </div>
          <div className="max-h-52 overflow-y-auto">
            {filtered.map(company => (
              <button
                key={company._id}
                type="button"
                onMouseDown={() => handleSelect(company)}
                className="w-full text-left px-3.5 py-2.5 flex items-center gap-2.5 hover:bg-indigo-50 transition-colors border-b border-slate-50 last:border-0"
              >
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 font-black text-[10px] flex items-center justify-center border border-indigo-100 shrink-0">
                  {company.companyName?.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">{company.companyName}</p>
                  <p className="text-[11px] text-slate-500">
                    {company.industryType || 'Corporate Partner'}{company.companyLocation ? ` • ${company.companyLocation}` : ''}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {showDropdown && inputVal && filtered.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-2xl border border-slate-200 shadow-xl z-30 p-4 text-center text-xs text-slate-400">
          No company found matching "{inputVal}"
        </div>
      )}
    </div>
  );
};

export const StudentReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [allCompanies, setAllCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeView, setActiveView] = useState('all_reviews');

  // Form state
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [title, setTitle] = useState('');
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(5);
  const [mentorshipRating, setMentorshipRating] = useState(5);
  const [workEnvironmentRating, setWorkEnvironmentRating] = useState(5);
  const [learningOpportunitiesRating, setLearningOpportunitiesRating] = useState(5);

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [revRes, compRes] = await Promise.all([
        api.get('/reviews/all'),
        api.get('/reviews/companies'),
      ]);

      if (revRes.data.success) {
        setReviews(revRes.data.reviews || []);
      }
      if (compRes.data.success) {
        setAllCompanies(compRes.data.companies || []);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedIndustry || !title || !feedback) return;

    setSubmitting(true);
    setSuccessMsg('');

    try {
      const payload = {
        industryId: selectedIndustry,
        rating: Number(rating),
        title,
        feedback,
        mentorshipRating: Number(mentorshipRating),
        workEnvironmentRating: Number(workEnvironmentRating),
        learningOpportunitiesRating: Number(learningOpportunitiesRating),
      };

      const res = await api.post('/reviews', payload);
      if (res.data.success) {
        setSuccessMsg('Review submitted successfully! Thank you for helping fellow students.');
        setTitle('');
        setFeedback('');
        setSelectedIndustry('');
        setRating(5);
        setMentorshipRating(5);
        setWorkEnvironmentRating(5);
        setLearningOpportunitiesRating(5);
        fetchData();
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCompanies = allCompanies.filter((c) =>
    (c.companyName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.companyLocation || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.industryType || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredReviews = reviews.filter((r) =>
    (r.industry?.companyName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.feedback || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <Loader message="Loading verified enterprise reviews and all registered companies..." />;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* Header Banner & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Company Reviews &amp; Enterprise Directory
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Search across <b>all companies</b> registered in the portal to explore employee ratings, mentorship quality, and authentic intern experiences.
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search all companies, locations or reviews..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm"
          />
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
        <button
          onClick={() => setActiveView('all_reviews')}
          className={`flex items-center gap-2 pb-2.5 px-3 text-xs font-black border-b-2 transition-all ${
            activeView === 'all_reviews'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <MessageSquareQuote className="w-4 h-4" />
          <span>Verified Reviews Feed ({filteredReviews.length})</span>
        </button>

        <button
          onClick={() => setActiveView('all_companies')}
          className={`flex items-center gap-2 pb-2.5 px-3 text-xs font-black border-b-2 transition-all ${
            activeView === 'all_companies'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>All Registered Companies ({filteredCompanies.length} of {allCompanies.length})</span>
        </button>
      </div>

      {/* VIEW 1: ALL COMPANIES DIRECTORY */}
      {activeView === 'all_companies' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Showing all {filteredCompanies.length} partner enterprises in the collaboration network:</span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-indigo-600 font-bold hover:underline"
              >
                Clear Search
              </button>
            )}
          </div>

          {filteredCompanies.length === 0 ? (
            <EmptyState
              title="No Companies Found"
              description={`No registered enterprise matches "${searchQuery}".`}
              icon={Building2}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCompanies.map((comp) => {
                const companyReviews = reviews.filter(r => r.industry?._id === comp._id);

                return (
                  <div
                    key={comp._id}
                    className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-card flex flex-col justify-between hover:border-indigo-200 transition-all"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 font-black text-xs flex items-center justify-center border border-indigo-100 shrink-0">
                            {comp.companyName?.slice(0, 2).toUpperCase() || 'CO'}
                          </div>
                          <div>
                            <h4 className="font-extrabold text-sm text-slate-900 line-clamp-1">
                              {comp.companyName}
                            </h4>
                            <p className="text-[11px] text-slate-500">
                              {comp.industryType || 'Corporate Partner'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center text-amber-500 font-black text-xs shrink-0 gap-0.5">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          {comp.averageRating || '4.8'}
                        </div>
                      </div>

                      <div className="space-y-1 text-xs text-slate-600 my-2 pt-2 border-t border-slate-100">
                        <p className="flex items-center gap-1 text-[11px]">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{comp.companyLocation || 'India'}</span>
                        </p>
                        {comp.website && (
                          <p className="flex items-center gap-1 text-[11px] text-indigo-600 truncate">
                            <Globe className="w-3 h-3 text-slate-400" />
                            <a href={comp.website} target="_blank" rel="noreferrer" className="hover:underline truncate">
                              {comp.website}
                            </a>
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-1">
                      <span className="text-[11px] font-bold text-slate-500">
                        {comp.totalReviews || companyReviews.length} Student Reviews
                      </span>

                      <button
                        onClick={() => {
                          setSelectedIndustry(comp._id);
                          setActiveView('all_reviews');
                          setTimeout(() => window.scrollTo({ top: 500, behavior: 'smooth' }), 100);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors"
                      >
                        Review Company →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Review Submission Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-card space-y-5">
        <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
          Write an Internship Review for Any Company
        </h3>

        {successMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Company Search + Overall Rating */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Select Company ({allCompanies.length} Enterprises Available)
              </label>
              <CompanyAutocomplete
                companies={allCompanies}
                value={selectedIndustry}
                onChange={setSelectedIndustry}
              />
            </div>

            <div>
              <StarRating
                label="Overall Rating"
                value={Number(rating)}
                onChange={setRating}
              />
              <p className="text-[11px] text-slate-400 mt-1">
                {rating === 5 ? 'Exceptional 🌟' : rating === 4 ? 'Very Good 👍' : rating === 3 ? 'Average 😐' : rating === 2 ? 'Below Expectations 😕' : 'Poor 😞'}
              </p>
            </div>
          </div>

          {/* Detailed Sub-Ratings */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <StarRating
              label="Mentorship Quality"
              value={Number(mentorshipRating)}
              onChange={setMentorshipRating}
            />
            <StarRating
              label="Work Culture & Environment"
              value={Number(workEnvironmentRating)}
              onChange={setWorkEnvironmentRating}
            />
            <StarRating
              label="Learning & Growth"
              value={Number(learningOpportunitiesRating)}
              onChange={setLearningOpportunitiesRating}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Review Headline
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Outstanding real-world product engineering experience and supportive mentorship"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Detailed Feedback &amp; Work Experience
            </label>
            <textarea
              rows="3"
              required
              placeholder="Share your experience: onboarding process, tech stack, team culture, and advice for prospective interns..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || !selectedIndustry}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Submitting...' : 'Post Verified Review'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Reviews List */}
      {activeView === 'all_reviews' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <MessageSquareQuote className="w-5 h-5 text-indigo-600" />
              Verified Student Reviews ({filteredReviews.length})
            </h3>
            {searchQuery && (
              <span className="text-xs text-slate-400 font-bold">
                Filtered by: "{searchQuery}"
              </span>
            )}
          </div>

          {filteredReviews.length === 0 ? (
            <EmptyState
              title="No Reviews Found"
              description="No reviews matched your search criteria. You can be the first to post a review!"
              icon={MessageSquareQuote}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredReviews.map((r) => (
                <div
                  key={r._id}
                  className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-indigo-600" />
                        <h4 className="text-xs font-bold text-slate-700">
                          {r.industry?.companyName}
                        </h4>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${s <= r.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`}
                          />
                        ))}
                        <span className="text-xs font-extrabold text-amber-600 ml-1">{r.rating}/5</span>
                      </div>
                    </div>

                    <h4 className="text-sm font-extrabold text-slate-900 mb-1">
                      "{r.title}"
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed italic">
                      "{r.feedback}"
                    </p>

                    {/* Sub-ratings */}
                    {(r.mentorshipRating || r.workEnvironmentRating || r.learningOpportunitiesRating) && (
                      <div className="mt-3 pt-3 border-t border-slate-50 flex flex-wrap gap-3 text-[11px] text-slate-500">
                        {r.mentorshipRating && (
                          <span className="flex items-center gap-1">
                            Mentorship: <span className="flex">{[1,2,3,4,5].map(s=><Star key={s} className={`w-3 h-3 ${s<=r.mentorshipRating?'fill-amber-400 text-amber-400':'fill-slate-200 text-slate-200'}`}/>)}</span>
                          </span>
                        )}
                        {r.workEnvironmentRating && (
                          <span className="flex items-center gap-1">
                            Culture: <span className="flex">{[1,2,3,4,5].map(s=><Star key={s} className={`w-3 h-3 ${s<=r.workEnvironmentRating?'fill-amber-400 text-amber-400':'fill-slate-200 text-slate-200'}`}/>)}</span>
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                    <span>By: {r.authorUser?.name || 'Verified Student'}</span>
                    <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
