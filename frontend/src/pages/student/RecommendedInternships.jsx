import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { InternshipCard } from '../../components/student/InternshipCard';
import { Loader } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';
import { Sparkles, Brain, SlidersHorizontal, Target, Layers, ChevronDown, X } from 'lucide-react';

const DEPT_DOMAINS = {
  'CSE / IT / AI': [
    'Full Stack Development', 'AI & Machine Learning', 'Cloud & DevOps',
    'Data Science & Analytics', 'Mobile App Development', 'Cybersecurity',
    'Blockchain Development', 'Game Development', 'UI/UX Design', 'Backend Engineering',
  ],
  'EEE': [
    'Power Systems Engineering', 'Embedded Systems & IoT', 'Control Systems & Automation',
    'Renewable Energy Systems', 'Electric Vehicle Technology', 'Industrial Automation',
  ],
  'ECE': [
    'VLSI Design', 'RF & Communication Systems', 'Signal & Image Processing',
    'PCB Design & Embedded Hardware', 'Wireless & 5G Networks', 'Robotics & Electronics',
  ],
  'Civil': [
    'Structural Engineering', 'Transportation Engineering', 'Environmental & Water Resources',
    'Construction Management', 'Geotechnical Engineering', 'Urban Planning',
  ],
  'Mechanical': [
    'Product Design & CAD', 'Manufacturing & Production', 'Thermal & Fluid Engineering',
    'Robotics & Automation', 'Automotive Engineering', 'Quality Assurance',
  ],
  'Agriculture': [
    'Precision Agriculture & Tech', 'Agri-Business & Supply Chain', 'Food Processing Technology',
    'Agricultural Biotechnology', 'Irrigation & Water Management', 'Rural Development',
  ],
  'Other / General': [
    'Research & Development', 'Business Analytics', 'Digital Marketing',
    'Finance & FinTech', 'Human Resources', 'Operations Management', 'Content & Media',
  ],
};

const ALL_ROLE_SUGGESTIONS = {
  'CSE / IT / AI': ['Full Stack Developer', 'Backend Engineer', 'Frontend Developer', 'AI/ML Intern', 'Data Scientist', 'DevOps Engineer', 'Cloud Engineer', 'Mobile Developer', 'Cybersecurity Analyst', 'Product Manager'],
  'EEE': ['Electrical Engineer Intern', 'Power Systems Intern', 'Embedded Systems Intern', 'Automation Engineer', 'EV Technology Intern', 'Control Systems Intern'],
  'ECE': ['VLSI Design Intern', 'Embedded Hardware Intern', 'RF Engineer Intern', 'Signal Processing Intern', 'PCB Designer Intern', 'IoT Engineer'],
  'Civil': ['Structural Engineer Intern', 'Site Engineer Intern', 'AutoCAD Designer', 'Construction Intern', 'Survey Intern', 'Environmental Engineer'],
  'Mechanical': ['CAD Design Intern', 'Manufacturing Engineer Intern', 'Quality Engineer Intern', 'Automobile Intern', 'Thermal Engineer Intern'],
  'Agriculture': ['Agri-Tech Intern', 'Field Research Intern', 'Food Technology Intern', 'Farm Manager Trainee', 'Precision Agriculture Intern'],
  'Other / General': ['Business Analyst', 'Marketing Intern', 'HR Intern', 'Operations Intern', 'Research Analyst', 'Content Writer'],
};

export const RecommendedInternships = () => {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState([]);
  const [allRecs, setAllRecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState(null);
  const [showFilters, setShowFilters] = useState(true);

  // Filters
  const [count, setCount] = useState(10);
  const [selectedDept, setSelectedDept] = useState('CSE / IT / AI');
  const [targetRole, setTargetRole] = useState('');
  const [roleInput, setRoleInput] = useState('');
  const [showRoleSuggestions, setShowRoleSuggestions] = useState(false);
  const [targetDomain, setTargetDomain] = useState('');
  const [domainInput, setDomainInput] = useState('');
  const [showDomainSuggestions, setShowDomainSuggestions] = useState(false);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (targetRole) params.set('role', targetRole);
      if (targetDomain) params.set('domain', targetDomain);
      params.set('limit', 100);

      const res = await api.get(`/student/recommendations?${params.toString()}`);
      if (res.data.success) {
        const recs = res.data.recommendations || [];
        setAllRecs(recs);
        const effectiveLimit = count === 9999 ? recs.length : count;
        setRecommendations(recs.slice(0, effectiveLimit));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  // Reapply count filter when count changes without re-fetching
  useEffect(() => {
    const effectiveLimit = count === 9999 ? allRecs.length : count;
    setRecommendations(allRecs.slice(0, effectiveLimit));
  }, [count, allRecs]);

  const handleApply = async (id) => {
    try {
      setApplyingId(id);
      const res = await api.post(`/student/apply/${id}`);
      if (res.data.success) {
        alert('Application submitted successfully!');
        fetchRecommendations();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to apply');
    } finally {
      setApplyingId(null);
    }
  };

  const roleSuggestions = (ALL_ROLE_SUGGESTIONS[selectedDept] || []).filter(r =>
    r.toLowerCase().includes(roleInput.toLowerCase()) && r !== targetRole
  );

  const domainSuggestions = (DEPT_DOMAINS[selectedDept] || []).concat(
    Object.entries(DEPT_DOMAINS).filter(([d]) => d !== selectedDept).flatMap(([, list]) => list)
  ).filter((d, i, arr) => arr.indexOf(d) === i && d.toLowerCase().includes(domainInput.toLowerCase()) && d !== targetDomain);

  const handleRoleSelect = (r) => {
    setTargetRole(r);
    setRoleInput(r);
    setShowRoleSuggestions(false);
  };

  const handleDomainSelect = (d) => {
    setTargetDomain(d);
    setDomainInput(d);
    setShowDomainSuggestions(false);
  };

  const handleSearch = () => {
    fetchRecommendations();
  };

  const handleClearFilters = () => {
    setTargetRole('');
    setRoleInput('');
    setTargetDomain('');
    setDomainInput('');
    setCount(10);
    setSelectedDept('CSE / IT / AI');
  };

  const currentDomains = DEPT_DOMAINS[selectedDept] || [];

  if (loading) return <Loader message="Analyzing your profile and calculating AI-powered recommendations..." />;

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-indigo-300 text-xs font-bold">
            <Brain className="w-3.5 h-3.5" />
            <span>TF-IDF + Cosine Similarity Engine</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            AI-Powered Internship Recommendations
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-xl">
            Customize your search by department, role, and domain to get the best-matched internship recommendations for you.
          </p>
        </div>

        {/* Recommendations Ratio Counter Banner */}
        <div className="p-4 px-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center shrink-0 min-w-[170px] shadow-lg">
          <div className="flex items-baseline justify-center gap-1.5 whitespace-nowrap">
            <span className="text-3xl font-black text-white tracking-tight">
              {recommendations.length}
            </span>
            <span className="text-lg font-bold text-indigo-200">
              / {count === 9999 ? allRecs.length : count}
            </span>
          </div>
          <span className="text-[11px] uppercase tracking-wider font-extrabold text-indigo-100 block mt-0.5">
            Recommendations
          </span>
        </div>
      </div>

      {/* Filter Panel */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-extrabold text-slate-900">Recommendation Filters</span>
            <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-100">Customize</span>
          </div>
          <button
            onClick={() => setShowFilters(v => !v)}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 font-bold"
          >
            {showFilters ? 'Collapse' : 'Expand'}
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {showFilters && (
          <div className="p-5 space-y-5">

            {/* Row 1: Department Tabs + Count */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-500" />
                  Select Your Department
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {Object.keys(DEPT_DOMAINS).map(dept => (
                    <button
                      key={dept}
                      type="button"
                      onClick={() => {
                        setSelectedDept(dept);
                        setTargetRole('');
                        setRoleInput('');
                        setTargetDomain('');
                        setCustomDomain('');
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        selectedDept === dept
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                          : 'bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-700'
                      }`}
                    >
                      {dept}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Number of Recommendations
                </label>
                <div className="flex gap-2 flex-wrap">
                  {[5, 10, 15, 20, 'All'].map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setCount(n === 'All' ? 9999 : n)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                        count === (n === 'All' ? 9999 : n)
                          ? 'bg-purple-600 text-white border-purple-600 shadow-md'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-purple-300 hover:text-purple-700'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Row 2: Target Role with word suggestions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="relative">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-purple-500" />
                  Target Role
                </label>
                <input
                  type="text"
                  placeholder={`e.g. ${(ALL_ROLE_SUGGESTIONS[selectedDept] || ['Full Stack Developer'])[0]}...`}
                  value={roleInput}
                  onChange={(e) => {
                    setRoleInput(e.target.value);
                    setTargetRole(e.target.value);
                    setShowRoleSuggestions(true);
                  }}
                  onFocus={() => setShowRoleSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowRoleSuggestions(false), 200)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all"
                />
                {/* Role Suggestions Dropdown */}
                {showRoleSuggestions && roleSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-2xl border border-slate-200 shadow-xl z-30 overflow-hidden">
                    <div className="py-1 max-h-48 overflow-y-auto">
                      {roleSuggestions.map(r => (
                        <button
                          key={r}
                          onMouseDown={() => handleRoleSelect(r)}
                          className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-purple-800 transition-colors"
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {/* Quick role pills */}
                <div className="flex flex-wrap gap-1 mt-2">
                  {(ALL_ROLE_SUGGESTIONS[selectedDept] || []).slice(0, 4).map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => handleRoleSelect(r)}
                      className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border transition-all ${
                        targetRole === r
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-purple-300 hover:text-purple-700'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-purple-500" />
                    Target Technical Domain
                  </span>
                  {targetDomain && (
                    <button
                      type="button"
                      onClick={() => {
                        setTargetDomain('');
                        setDomainInput('');
                      }}
                      className="text-rose-500 hover:text-rose-700 text-[10px] font-bold"
                    >
                      Clear
                    </button>
                  )}
                </label>
                <input
                  type="text"
                  placeholder={`e.g. ${(DEPT_DOMAINS[selectedDept] || ['Full Stack Development'])[0]}...`}
                  value={domainInput}
                  onChange={(e) => {
                    setDomainInput(e.target.value);
                    setTargetDomain(e.target.value);
                    setShowDomainSuggestions(true);
                  }}
                  onFocus={() => setShowDomainSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowDomainSuggestions(false), 200)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all"
                />
                {/* Domain Suggestions Dropdown */}
                {showDomainSuggestions && domainSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-2xl border border-slate-200 shadow-xl z-30 overflow-hidden">
                    <div className="py-1 max-h-48 overflow-y-auto">
                      {domainSuggestions.map(d => (
                        <button
                          key={d}
                          type="button"
                          onMouseDown={() => handleDomainSelect(d)}
                          className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-purple-800 transition-colors"
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {/* Quick domain pills */}
                <div className="flex flex-wrap gap-1 mt-2">
                  {(DEPT_DOMAINS[selectedDept] || []).slice(0, 4).map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => handleDomainSelect(d)}
                      className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border transition-all ${
                        targetDomain === d
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-purple-300 hover:text-purple-700'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleClearFilters}
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-rose-600 font-bold transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Clear Filters
              </button>
              <button
                type="button"
                onClick={handleSearch}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 transition-all flex items-center gap-1.5 active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                Get AI Recommendations
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Grid */}
      {recommendations.length === 0 ? (
        <EmptyState
          title="No Recommendations Found"
          description="Try changing your department, role, or domain filters. Or complete your student profile and upload a resume so our NLP engine can calculate matches."
          actionLabel="Complete Profile Now"
          onAction={() => navigate('/student/profile')}
        />
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500 font-medium">
              Showing <span className="font-bold text-indigo-700">{recommendations.length}</span> of <span className="font-bold text-purple-700">{allRecs.length}</span> AI-matched internships
              {targetRole && <> for role: <span className="font-bold text-purple-700">{targetRole}</span></>}
              {targetDomain && <> in domain: <span className="font-bold text-emerald-700">{targetDomain}</span></>}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {recommendations.map((job) => (
              <InternshipCard
                key={job._id}
                internship={job}
                onApply={handleApply}
                isApplying={applyingId === job._id}
                onViewDetails={(j) => navigate(`/student/find?id=${j._id}`)}
              />
            ))}
          </div>
        </>
      )}

    </div>
  );
};
