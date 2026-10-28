import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Loader } from '../../components/common/Loader';
import { PlusCircle, Briefcase, MapPin, IndianRupee, Layers, Calendar, CheckCircle2, ShieldAlert } from 'lucide-react';
import { ALL_DOMAINS, ALL_ROLES } from '../../utils/portalConstants';

export const PostInternshipPage = () => {
  const navigate = useNavigate();

  const [checking, setChecking] = useState(true);
  const [isApproved, setIsApproved] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form fields
  const [role, setRole] = useState('');
  const [domain, setDomain] = useState('Full Stack Development');
  const [description, setDescription] = useState('');
  const [requiredSkills, setRequiredSkills] = useState('');
  const [preferredSkills, setPreferredSkills] = useState('');
  const [experienceRequired, setExperienceRequired] = useState('FRESHER');
  const [educationRequired, setEducationRequired] = useState('B.E / B.Tech / MCA in CS / IT / Related Disciplines');
  const [location, setLocation] = useState('Chennai');
  const [workMode, setWorkMode] = useState('HYBRID');
  const [duration, setDuration] = useState('6 Months');
  const [stipend, setStipend] = useState('');
  const [applicationDeadline, setApplicationDeadline] = useState('');
  
  // Private vacancy field: STRICTLY HIDDEN FROM STUDENTS
  const [requiredCandidates, setRequiredCandidates] = useState('3');
  const [eligibilityCgpa, setEligibilityCgpa] = useState('6.5');
  const [perks, setPerks] = useState('Certificate of Completion, Pre-Placement Offer (PPO) Opportunity, Flexible Hours');

  useEffect(() => {
    const checkVerification = async () => {
      try {
        setChecking(true);
        const res = await api.get('/industry/profile');
        if (res.data.success) {
          setIsApproved(res.data.profile.verificationStatus === 'APPROVED');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setChecking(false);
      }
    };
    checkVerification();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    try {
      const payload = {
        role,
        domain,
        description,
        requiredSkills: requiredSkills.split(',').map(s => s.trim()).filter(Boolean),
        preferredSkills: preferredSkills.split(',').map(s => s.trim()).filter(Boolean),
        experienceRequired,
        educationRequired,
        location,
        workMode,
        duration,
        stipend: Number(stipend),
        applicationDeadline,
        requiredCandidates: Number(requiredCandidates) || 1, // Private vacancy count
        eligibilityCgpa: Number(eligibilityCgpa) || 6.0,
        perks: perks.split(',').map(p => p.trim()).filter(Boolean),
      };

      const res = await api.post('/industry/internships', payload);
      if (res.data.success) {
        navigate('/industry/internships');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to post internship requisition');
    } finally {
      setSubmitting(false);
    }
  };

  if (checking) return <Loader message="Checking company authorization..." />;

  if (!isApproved) {
    return (
      <div className="max-w-2xl mx-auto p-8 bg-white rounded-3xl border border-slate-200/80 text-center space-y-4 shadow-card">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-extrabold text-slate-900">Verification Required</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
          Posting internships is restricted to Admin-approved companies. Please complete your company verification to post requisitions.
        </p>
        <button
          onClick={() => navigate('/industry/verification')}
          className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs"
        >
          Go to Verification Page
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Post a New Internship Position
        </h2>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Define role requirements, required skill taxonomy, private vacancy targets, and stipend.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700">
          {errorMsg}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-card space-y-6">
        
        {/* Basic Role & Domain */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Position / Role Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Full Stack Web Development Intern, HR Recruiter, Sales Manager, Corporate Trainer..."
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
            {/* Quick role suggestions */}
            <div className="flex flex-wrap gap-1 mt-1.5">
              {['Full Stack Developer', 'HR Recruiter', 'Sales Manager', 'Teacher / Trainer', 'Data Analyst', 'Cloud / DevOps'].map((suggested) => (
                <button
                  type="button"
                  key={suggested}
                  onClick={() => setRole(suggested)}
                  className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-[10px] font-bold text-slate-600 transition-colors"
                >
                  + {suggested}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Internship Domain *
            </label>
            <select
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white"
            >
              {ALL_DOMAINS.map((d) => (
                <option key={d.name} value={d.name}>
                  {d.name} ({d.dept})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Job Description & Responsibilities *
          </label>
          <textarea
            rows="4"
            required
            placeholder="Detailed description of internship project scope, expectations, and mentorship..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        {/* Skills Taxonomy */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Required Skills (Comma separated) *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. React, Node.js, MongoDB, JavaScript, REST API"
              value={requiredSkills}
              onChange={(e) => setRequiredSkills(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">Used by AI matching engine (40% weight)</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Preferred Skills (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. TypeScript, Redis, Docker"
              value={preferredSkills}
              onChange={(e) => setPreferredSkills(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800"
            />
          </div>
        </div>

        {/* Location, Work Mode, Duration */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Location *</label>
            <input
              type="text"
              required
              placeholder="e.g. Chennai"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Work Mode *</label>
            <select
              value={workMode}
              onChange={(e) => setWorkMode(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white"
            >
              <option value="HYBRID">Hybrid</option>
              <option value="REMOTE">Remote</option>
              <option value="ON_SITE">On-Site</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Duration *</label>
            <input
              type="text"
              placeholder="e.g. 6 Months"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800"
            />
          </div>
        </div>

        {/* Stipend, Deadline & PRIVATE Vacancy count */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-indigo-50/40 border border-indigo-100">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Monthly Stipend (₹) *
            </label>
            <input
              type="number"
              required
              placeholder="25000"
              value={stipend}
              onChange={(e) => setStipend(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Application Deadline *
            </label>
            <input
              type="date"
              required
              value={applicationDeadline}
              onChange={(e) => setApplicationDeadline(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white"
            />
          </div>

          {/* CRITICAL: PRIVATE VACANCY COUNT */}
          <div>
            <label className="block text-xs font-bold text-indigo-900 uppercase tracking-wider mb-1">
              Required Candidates / Vacancies *
            </label>
            <input
              type="number"
              min="1"
              required
              value={requiredCandidates}
              onChange={(e) => setRequiredCandidates(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-indigo-200 text-xs font-black text-indigo-700 bg-white"
            />
            <span className="text-[10px] text-indigo-600 font-semibold mt-1 block">
              🔒 Strictly private. Hidden from students.
            </span>
          </div>
        </div>

        {/* Perks & Minimum CGPA */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Perks & Benefits (Comma separated)
            </label>
            <input
              type="text"
              value={perks}
              onChange={(e) => setPerks(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Minimum CGPA Eligibility
            </label>
            <input
              type="number"
              step="0.1"
              value={eligibilityCgpa}
              onChange={(e) => setEligibilityCgpa(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-3 border-t border-slate-100">
          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-lg shadow-indigo-200 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{submitting ? 'Publishing Post...' : 'Publish Internship Position'}</span>
          </button>
        </div>

      </form>

    </div>
  );
};
