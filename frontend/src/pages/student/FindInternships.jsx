import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { InternshipCard } from '../../components/student/InternshipCard';
import { Loader } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import { ALL_LOCATIONS, ALL_DOMAINS } from '../../utils/portalConstants';
import {
  Search,
  Filter,
  RotateCcw,
  MapPin,
  IndianRupee,
  Briefcase,
  Layers,
  Sparkles,
  Building2,
  Calendar,
  CheckCircle2,
  Star,
  Clock,
  X,
} from 'lucide-react';
import { WorkModeBadge } from '../../components/common/Badge';

// Word-Based Location Autocomplete Filter
const LocationFilterInput = ({ value, onChange }) => {
  const [query, setQuery] = useState(value === 'All' ? '' : value);
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    setQuery(value === 'All' ? '' : value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = ALL_LOCATIONS.filter(loc =>
    loc.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (loc) => {
    onChange(loc);
    setQuery(loc === 'All' ? '' : loc);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange('All');
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1 flex items-center justify-between">
        <span className="flex items-center gap-1">
          <MapPin className="w-3 h-3 text-indigo-500" />
          Location
        </span>
        {value !== 'All' && value && (
          <button
            type="button"
            onClick={handleClear}
            className="text-rose-500 hover:text-rose-700 text-[10px] font-bold"
          >
            Clear
          </button>
        )}
      </label>
      <div className="relative">
        <input
          type="text"
          placeholder="City or Remote..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onChange(e.target.value || 'All');
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full pl-2.5 pr-7 py-2 rounded-xl border border-slate-200 font-semibold text-slate-800 text-xs bg-white hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
        />
        {query ? (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : null}
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 max-h-56 overflow-y-auto p-1 text-xs">
          <button
            type="button"
            onMouseDown={() => handleSelect('All')}
            className={`w-full text-left px-3 py-1.5 rounded-lg font-bold transition-colors ${
              value === 'All' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            🌐 All Locations
          </button>
          {filtered.map(loc => (
            <button
              key={loc}
              type="button"
              onMouseDown={() => handleSelect(loc)}
              className={`w-full text-left px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center justify-between ${
                value === loc ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>{loc}</span>
              {loc === 'Remote' && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">WFH</span>
              )}
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="p-2 text-center text-slate-400 text-[11px]">
              Search for "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Word-Based Domain Autocomplete Filter
const DomainFilterInput = ({ value, onChange }) => {
  const [query, setQuery] = useState(value === 'All' ? '' : value);
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    setQuery(value === 'All' ? '' : value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = ALL_DOMAINS.filter(item =>
    item.name.toLowerCase().includes(query.toLowerCase()) ||
    item.dept.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (dom) => {
    onChange(dom);
    setQuery(dom === 'All' ? '' : dom);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange('All');
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1 flex items-center justify-between">
        <span className="flex items-center gap-1">
          <Layers className="w-3 h-3 text-purple-500" />
          Domain
        </span>
        {value !== 'All' && value && (
          <button
            type="button"
            onClick={handleClear}
            className="text-rose-500 hover:text-rose-700 text-[10px] font-bold"
          >
            Clear
          </button>
        )}
      </label>
      <div className="relative">
        <input
          type="text"
          placeholder="e.g. AI, VLSI, Robotics..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onChange(e.target.value || 'All');
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full pl-2.5 pr-7 py-2 rounded-xl border border-slate-200 font-semibold text-slate-800 text-xs bg-white hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all"
        />
        {query ? (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : null}
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-72 bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 max-h-60 overflow-y-auto p-1 text-xs">
          <button
            type="button"
            onMouseDown={() => handleSelect('All')}
            className={`w-full text-left px-3 py-1.5 rounded-lg font-bold transition-colors ${
              value === 'All' ? 'bg-purple-50 text-purple-700' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            ⚡ All Domains
          </button>
          {filtered.map(item => (
            <button
              key={item.name}
              type="button"
              onMouseDown={() => handleSelect(item.name)}
              className={`w-full text-left px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center justify-between group ${
                value === item.name ? 'bg-purple-50 text-purple-900 font-bold' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="truncate mr-2">{item.name}</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 group-hover:bg-purple-100 text-slate-500 font-bold border border-slate-200/60 shrink-0">
                {item.dept}
              </span>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="p-2 text-center text-slate-400 text-[11px]">
              Search for "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const FindInternships = () => {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  const [internships, setInternships] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState(null);

  // Detail modal state
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [reviews, setReviews] = useState([]);

  // Search & Filter Form state
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [location, setLocation] = useState(searchParams.get('location') || 'All');
  const [domain, setDomain] = useState(searchParams.get('domain') || 'All');
  const [workMode, setWorkMode] = useState(searchParams.get('workMode') || 'All');
  const [stipendRange, setStipendRange] = useState('All');
  const [sort, setSort] = useState('BEST_MATCH');

  const fetchInternships = async () => {
    try {
      setLoading(true);
      const params = {
        keyword: keyword || undefined,
        location: location && location !== 'All' && location.trim() ? location.trim() : undefined,
        domain: domain && domain !== 'All' && domain.trim() ? domain.trim() : undefined,
        workMode: workMode !== 'All' ? workMode : undefined,
        sort,
      };

      if (stipendRange === 'BELOW_10K') {
        params.maxSalary = 10000;
      } else if (stipendRange === '10K_25K') {
        params.minSalary = 10000;
        params.maxSalary = 25000;
      } else if (stipendRange === '25K_PLUS') {
        params.minSalary = 25000;
      }

      const res = await api.get('/student/internships', { params });
      if (res.data.success) {
        setInternships(res.data.internships || []);
        setTotal(res.data.total || 0);
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const urlKeyword = searchParams.get('keyword');
    if (urlKeyword !== null && urlKeyword !== keyword) {
      setKeyword(urlKeyword);
    }
    const targetId = searchParams.get('id');
    if (targetId) {
      api.get(`/student/internships/${targetId}`).then((res) => {
        if (res.data.success && res.data.internship) {
          setSelectedInternship(res.data.internship);
          setReviews(res.data.reviews || []);
        }
      }).catch((err) => console.warn('Could not load target internship:', err.message));
    }
  }, [searchParams]);

  useEffect(() => {
    fetchInternships();
  }, [keyword, location, domain, workMode, stipendRange, sort]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchInternships();
  };

  const handleClearFilters = () => {
    setKeyword('');
    setLocation('All');
    setDomain('All');
    setWorkMode('All');
    setStipendRange('All');
    setSort('BEST_MATCH');
    setSearchParams({});
  };

  const handleApply = async (id) => {
    try {
      setApplyingId(id);
      const res = await api.post(`/student/apply/${id}`);
      if (res.data.success) {
        alert('Application submitted successfully!');
        fetchInternships();
        if (selectedInternship && selectedInternship._id === id) {
          setSelectedInternship(null);
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to apply');
    } finally {
      setApplyingId(null);
    }
  };

  const handleViewDetails = async (internship) => {
    try {
      setSelectedInternship(internship);
      const res = await api.get(`/student/internships/${internship._id}`);
      if (res.data.success) {
        setReviews(res.data.reviews || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Explore Internship Opportunities
        </h2>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Discover approved industry roles, filter by stipend & location, and apply directly.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-card space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search internships by role, skill, company or keyword..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 transition-all shrink-0"
          >
            Search Positions
          </button>
        </form>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-3 border-t border-slate-100 text-xs">
          
          {/* Location */}
          <LocationFilterInput value={location} onChange={setLocation} />

          {/* Domain */}
          <DomainFilterInput value={domain} onChange={setDomain} />

          {/* Work Mode */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
              Work Mode
            </label>
            <select
              value={workMode}
              onChange={(e) => setWorkMode(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold text-slate-700 bg-white"
            >
              <option value="All">All Modes</option>
              <option value="REMOTE">Remote</option>
              <option value="HYBRID">Hybrid</option>
              <option value="ON_SITE">On-Site</option>
            </select>
          </div>

          {/* Stipend */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
              Monthly Stipend
            </label>
            <select
              value={stipendRange}
              onChange={(e) => setStipendRange(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold text-slate-700 bg-white"
            >
              <option value="All">Any Stipend</option>
              <option value="BELOW_10K">Below ₹10,000</option>
              <option value="10K_25K">₹10,000 - ₹25,000</option>
              <option value="25K_PLUS">₹25,000+</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
              Sort By
            </label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold text-slate-700 bg-white"
            >
              <option value="BEST_MATCH">AI Match Score</option>
              <option value="HIGHEST_STIPEND">Highest Stipend</option>
              <option value="DEADLINE_SOON">Deadline Soon</option>
            </select>
          </div>

        </div>

        {/* Active Filters count and Clear Button */}
        <div className="flex items-center justify-between text-xs pt-1">
          <span className="text-slate-500 font-medium">
            Showing <b className="text-slate-800">{internships.length}</b> verified opportunities
          </span>
          <button
            type="button"
            onClick={handleClearFilters}
            className="text-slate-500 hover:text-indigo-600 font-bold flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Filters</span>
          </button>
        </div>
      </div>

      {/* Results Grid */}
      {loading ? (
        <Loader message="Searching verified internships..." />
      ) : internships.length === 0 ? (
        <EmptyState
          title="No Matching Internships Found"
          description="Try broadening your search query or reset your location/stipend filters."
          actionLabel="Clear All Filters"
          onAction={handleClearFilters}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {internships.map((job) => (
            <InternshipCard
              key={job._id}
              internship={job}
              onApply={handleApply}
              isApplying={applyingId === job._id}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      )}

      {/* Internship Full Details & Reviews Modal */}
      {selectedInternship && (
        <Modal
          isOpen={!!selectedInternship}
          onClose={() => setSelectedInternship(null)}
          title="Internship Position Overview"
          maxWidth="max-w-2xl"
        >
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100">
              <div>
                <span className="text-xs font-bold uppercase text-indigo-700">
                  {selectedInternship.industry?.companyName}
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 mt-0.5">
                  {selectedInternship.role}
                </h3>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 mt-2">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {selectedInternship.location}
                  </span>
                  <WorkModeBadge mode={selectedInternship.workMode} />
                  <span className="flex items-center gap-1 font-bold text-slate-800">
                    ₹{selectedInternship.stipend?.toLocaleString()}/month
                  </span>
                </div>
              </div>

              {selectedInternship.matchPercentage && (
                <div className="text-center p-3 rounded-2xl bg-white shadow-sm border border-indigo-100 shrink-0">
                  <span className="text-2xl font-black text-indigo-600 block">
                    {selectedInternship.matchPercentage}%
                  </span>
                  <span className="text-[9px] font-bold uppercase text-slate-400">Match Score</span>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Role Description & Scope
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
                {selectedInternship.description}
              </p>
            </div>

            {/* Skills */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Required Competencies
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {(selectedInternship.requiredSkills || []).map((sk, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-xl bg-indigo-50 text-indigo-700 font-bold text-xs border border-indigo-100">
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Preferred / Nice to Have
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {(selectedInternship.preferredSkills || ['Git & Agile Workflows']).map((sk, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs">
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Perks */}
            {selectedInternship.perks && selectedInternship.perks.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Perks & Benefits
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedInternship.perks.map((p, idx) => (
                    <span key={idx} className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-100">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Company Reviews Snippet */}
            {reviews.length > 0 && (
              <div className="pt-3 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                  Verified Student Reviews ({reviews.length})
                </h4>
                <div className="space-y-3">
                  {reviews.map((rev) => (
                    <div key={rev._id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-800">{rev.title}</span>
                        <span className="flex items-center text-amber-500 font-bold">
                          ★ {rev.rating}/5
                        </span>
                      </div>
                      <p className="text-slate-600 italic">"{rev.feedback}"</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Footer Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedInternship(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50"
              >
                Close
              </button>

              {selectedInternship.hasApplied ? (
                <span className="px-5 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Already Applied
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => handleApply(selectedInternship._id)}
                  disabled={applyingId === selectedInternship._id}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 transition-all flex items-center gap-1.5"
                >
                  <Briefcase className="w-4 h-4" />
                  {applyingId === selectedInternship._id ? 'Submitting...' : 'Submit Application'}
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};
