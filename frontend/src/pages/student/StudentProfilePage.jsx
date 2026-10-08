import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Loader } from '../../components/common/Loader';
import { ALL_DOMAINS } from '../../utils/portalConstants';
import {
  User,
  GraduationCap,
  Briefcase,
  Code,
  FileText,
  Sparkles,
  Upload,
  Trash2,
  Plus,
  X,
  CheckCircle2,
  Save,
  ExternalLink,
  Phone,
  MapPin,
  Compass,
  BookOpen,
  Award,
  IndianRupee,
  Layers,
  Search,
} from 'lucide-react';

// Word-Based Domain Autocomplete Component
const DomainAutocomplete = ({ value, onChange, studentDept }) => {
  const [query, setQuery] = useState(value || '');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
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

  // Map student department to short tag
  const deptShortName = studentDept?.includes('Electrical and Electronics') ? 'EEE'
    : studentDept?.includes('Electronics and Communication') ? 'ECE'
    : studentDept?.includes('Civil') ? 'Civil'
    : studentDept?.includes('Mechanical') ? 'Mechanical'
    : studentDept?.includes('Agriculture') ? 'Agriculture'
    : 'CSE / IT / AI';

  const quickPills = ALL_DOMAINS.filter(d => d.dept === deptShortName).slice(0, 4);

  return (
    <div className="relative" ref={containerRef}>
      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-purple-500" />
          Target Technical Domain
        </span>
        <span className="text-[10px] text-purple-600 font-bold lowercase">word suggestions available</span>
      </label>
      <div className="relative">
        <input
          type="text"
          placeholder="Type or search domain (e.g. VLSI, Robotics, Full Stack, Power Systems)..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full pl-3.5 pr-8 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all shadow-sm"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              onChange('');
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Suggestion Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 max-h-64 overflow-y-auto p-1.5 divide-y divide-slate-50">
          {filtered.length > 0 ? (
            filtered.map((item) => (
              <button
                key={item.name}
                type="button"
                onMouseDown={() => {
                  setQuery(item.name);
                  onChange(item.name);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors flex items-center justify-between group ${
                  value === item.name ? 'bg-purple-50 text-purple-900 font-bold' : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span>{item.name}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 group-hover:bg-purple-100 text-slate-500 group-hover:text-purple-700 font-bold border border-slate-200/60 shrink-0 ml-2">
                  {item.dept}
                </span>
              </button>
            ))
          ) : (
            <div className="p-3 text-center">
              <p className="text-xs text-slate-500 mb-1.5 font-medium">No standard matches for "{query}"</p>
              <button
                type="button"
                onMouseDown={() => {
                  onChange(query);
                  setIsOpen(false);
                }}
                className="px-3 py-1 bg-purple-600 text-white rounded-lg text-xs font-bold shadow"
              >
                Use custom domain: "{query}"
              </button>
            </div>
          )}
        </div>
      )}

      {/* Quick suggestions pills */}
      <div className="flex flex-wrap items-center gap-1.5 mt-2">
        <span className="text-[10px] text-slate-400 font-bold mr-0.5">Quick picks:</span>
        {quickPills.map(d => (
          <button
            key={d.name}
            type="button"
            onClick={() => {
              setQuery(d.name);
              onChange(d.name);
            }}
            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all border ${
              value === d.name
                ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-purple-300 hover:text-purple-700 hover:bg-purple-50/50'
            }`}
          >
            {d.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export const StudentProfilePage = () => {
  const { user, refreshProfile } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [resumeParsedInfo, setResumeParsedInfo] = useState(null);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [preferredLocations, setPreferredLocations] = useState('');

  const [college, setCollege] = useState('');
  const [degree, setDegree] = useState('B.Tech');
  const [department, setDepartment] = useState('');
  const [cgpa, setCgpa] = useState('');
  const [graduationYear, setGraduationYear] = useState('');

  const [technicalSkills, setTechnicalSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [activeDept, setActiveDept] = useState('CSE / IT / AI');

  const [preferredRole, setPreferredRole] = useState('');
  const [preferredDomain, setPreferredDomain] = useState('Full Stack Development');
  const [preferredStipend, setPreferredStipend] = useState('');
  const [preferredWorkMode, setPreferredWorkMode] = useState('HYBRID');

  const [projects, setProjects] = useState([]);
  const [newProjTitle, setNewProjTitle] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');
  const [newProjTech, setNewProjTech] = useState('');
  const [newProjGithub, setNewProjGithub] = useState('');

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/student/profile');
      if (res.data.success) {
        const p = res.data.profile;
        setProfile(p);
        setFullName(p.fullName || '');
        setPhone(p.phone || '');
        setLocation(p.location || '');
        setBio(p.bio || '');
        setPreferredLocations((p.preferredLocations || []).join(', '));
        setCollege(p.college || '');
        setDegree(p.degree || 'B.Tech');
        setDepartment(p.department || '');
        setCgpa(p.cgpa || '');
        setGraduationYear(p.graduationYear || '');
        setTechnicalSkills(p.technicalSkills || []);
        setPreferredRole(p.preferredRole || '');
        setPreferredDomain(p.preferredDomain || 'Full Stack Development');
        setPreferredStipend(p.preferredStipend || '');
        setPreferredWorkMode(p.preferredWorkMode || 'HYBRID');
        setProjects(p.projects || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (newSkill.trim() && !technicalSkills.includes(newSkill.trim())) {
      setTechnicalSkills([...technicalSkills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill) => {
    setTechnicalSkills(technicalSkills.filter(s => s !== skill));
  };

  const handleAddProject = (e) => {
    e.preventDefault();
    if (!newProjTitle.trim()) return;

    const newProj = {
      title: newProjTitle.trim(),
      description: newProjDesc.trim(),
      technologies: newProjTech.split(',').map(t => t.trim()).filter(Boolean),
      githubLink: newProjGithub.trim(),
    };

    setProjects([...projects, newProj]);
    setNewProjTitle('');
    setNewProjDesc('');
    setNewProjTech('');
    setNewProjGithub('');
  };

  const handleRemoveProject = (index) => {
    setProjects(projects.filter((_, idx) => idx !== index));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');

    try {
      const payload = {
        fullName,
        phone,
        location,
        bio,
        preferredLocations: preferredLocations.split(',').map(l => l.trim()).filter(Boolean),
        college,
        degree,
        department,
        cgpa: Number(cgpa) || 0,
        graduationYear: Number(graduationYear) || 2026,
        technicalSkills,
        preferredRole,
        preferredDomain,
        preferredStipend: Number(preferredStipend) || 0,
        preferredWorkMode,
        projects,
      };

      const res = await api.put('/student/profile', payload);
      if (res.data.success) {
        setProfile(res.data.profile);
        setSuccessMsg('Profile updated successfully! AI recommendation rankings refreshed.');
        refreshProfile();
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('resume', file);

    setUploadingResume(true);
    setResumeParsedInfo(null);

    try {
      const res = await api.post('/student/resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        setProfile(res.data.profile);
        setResumeParsedInfo(res.data.extractedData);
        setTechnicalSkills(res.data.profile.technicalSkills || []);
        refreshProfile();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Resume upload and parsing failed');
    } finally {
      setUploadingResume(false);
    }
  };

  const handleDeleteResume = async () => {
    if (!window.confirm('Are you sure you want to delete your uploaded resume?')) return;

    try {
      const res = await api.delete('/student/resume');
      if (res.data.success) {
        setProfile(res.data.profile);
        setResumeParsedInfo(null);
        refreshProfile();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete resume');
    }
  };

  if (loading) return <Loader message="Loading your complete profile..." />;

  const completion = profile?.profileCompletionPercentage || 40;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      
      {/* Profile Header & Completion Score */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-200 shrink-0">
            {fullName ? fullName.slice(0, 2).toUpperCase() : 'ST'}
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900">{fullName || user?.name}</h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {user?.email} • {college || 'University Student'}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 min-w-[220px] text-center shrink-0">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            Profile Completion Meter
          </span>
          <div className="flex items-center justify-center gap-1.5 my-1">
            <span className="text-2xl font-black text-indigo-600">
              {completion}%
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${completion}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-500 font-semibold mt-1.5 block">
            {completion >= 80 ? '🌟 Highly Competitive Profile' : 'Upload Resume & Skills to reach 100%'}
          </span>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {successMsg}
        </div>
      )}

      {/* RESUME NLP EXTRACTION SECTION */}
      <div id="resume" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Resume & AI Entity Extractor (PDF / DOCX)
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Our NLP engine extracts your technical skills, projects, and education to match internships.
              </p>
            </div>
          </div>
        </div>

        {profile?.resumePath ? (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-xl text-indigo-600 border border-slate-200">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">
                  {profile.resumeOriginalName || 'Uploaded_Resume.pdf'}
                </h4>
                <p className="text-[11px] text-slate-500">
                  Processed on {profile.resumeUploadedAt ? new Date(profile.resumeUploadedAt).toLocaleDateString() : 'Recently'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`/${profile.resumePath}`}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors flex items-center gap-1"
              >
                <span>View Resume</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <label className="px-3.5 py-2 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-bold hover:bg-indigo-100 transition-colors cursor-pointer">
                Replace File
                <input
                  type="file"
                  accept=".pdf,.docx,.doc"
                  onChange={handleResumeUpload}
                  disabled={uploadingResume}
                  className="hidden"
                />
              </label>

              <button
                onClick={handleDeleteResume}
                className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                title="Delete Resume"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="border-2 border-dashed border-slate-200 rounded-3xl p-8 text-center hover:border-indigo-400 transition-colors bg-slate-50/50">
            <input
              type="file"
              id="resume-upload"
              accept=".pdf,.docx,.doc"
              onChange={handleResumeUpload}
              disabled={uploadingResume}
              className="hidden"
            />
            <label htmlFor="resume-upload" className="cursor-pointer flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                <Upload className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-slate-800">
                {uploadingResume ? 'Processing Resume with AI Engine...' : 'Click to Upload Resume (PDF or DOCX)'}
              </span>
              <span className="text-[11px] text-slate-400 mt-1">
                Max file size: 5MB. NLP parser will auto-extract skills and experience.
              </span>
            </label>
          </div>
        )}

        {/* NLP Extraction Summary Pill Box */}
        {resumeParsedInfo && (
          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-xs animate-in fade-in">
            <div className="flex items-center gap-1.5 text-emerald-800 font-bold mb-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>AI Parser Successfully Extracted {resumeParsedInfo.skillsFound} Skills:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(resumeParsedInfo.programmingLanguages || []).concat(resumeParsedInfo.frameworks || []).map((s, idx) => (
                <span key={idx} className="px-2 py-0.5 rounded-md bg-white text-emerald-700 font-bold text-[11px] border border-emerald-200">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* EDIT PROFILE FORM */}
      <form onSubmit={handleSaveProfile} className="space-y-8">
        
        {/* Section 1: Personal Details */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-card space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <User className="w-4 h-4" />
              </span>
              Personal & Contact Information
            </h3>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Identity & Reach</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-500" />
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Priyadharshini K"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50/40 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                  Registered Email Address
                </span>
                <span className="text-[10px] text-emerald-600 font-extrabold uppercase bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">Verified</span>
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-500 bg-slate-100/80 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-indigo-500" />
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50/40 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                Current City
              </label>
              <input
                type="text"
                placeholder="e.g. Chennai, Coimbatore, Madurai"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-slate-50/40 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-indigo-500" />
                Preferred Internship Locations
              </span>
              <span className="text-[10px] text-slate-400 font-normal">Comma-separated</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Chennai, Bangalore, Hyderabad, Remote"
              value={preferredLocations}
              onChange={(e) => setPreferredLocations(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-slate-50/40 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Professional Bio & Career Objective</span>
              <span className="text-[10px] text-slate-400 font-normal">{bio.length}/500 chars</span>
            </label>
            <textarea
              rows="3"
              maxLength={500}
              placeholder="Write a concise professional summary highlighting your key interests, career goals, and internship aspirations..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-slate-50/40 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all leading-relaxed"
            />
          </div>
        </div>

        {/* Section 2: Education Details */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-card space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <GraduationCap className="w-4 h-4" />
              </span>
              Academic Background & Education
            </h3>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Institution & Marks</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-blue-500" />
              College / University Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. College of Engineering Guindy, Anna University"
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50/40 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Degree</label>
              <select
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="B.Tech">B.Tech</option>
                <option value="B.E">B.E</option>
                <option value="MCA">MCA</option>
                <option value="M.Tech">M.Tech</option>
                <option value="B.Sc">B.Sc</option>
                <option value="M.Sc">M.Sc</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                Department / Branch
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              >
                <option value="">Select Department...</option>
                <optgroup label="Computer & IT">
                  <option value="Computer Science and Engineering">Computer Science and Engineering (CSE)</option>
                  <option value="Information Technology">Information Technology (IT)</option>
                  <option value="Artificial Intelligence and Data Science">Artificial Intelligence & Data Science (AIDS)</option>
                  <option value="Computer Science and Business Systems">Computer Science & Business Systems (CSBS)</option>
                  <option value="Cyber Security">Cyber Security</option>
                </optgroup>
                <optgroup label="Electrical & Electronics">
                  <option value="Electrical and Electronics Engineering">Electrical & Electronics Engineering (EEE)</option>
                  <option value="Electronics and Communication Engineering">Electronics & Communication Engineering (ECE)</option>
                  <option value="Electronics and Instrumentation Engineering">Electronics & Instrumentation Engineering (EIE)</option>
                  <option value="Biomedical Engineering">Biomedical Engineering (BME)</option>
                </optgroup>
                <optgroup label="Mechanical & Civil">
                  <option value="Mechanical Engineering">Mechanical Engineering (MECH)</option>
                  <option value="Civil Engineering">Civil Engineering (CIVIL)</option>
                  <option value="Automobile Engineering">Automobile Engineering</option>
                  <option value="Aerospace Engineering">Aerospace Engineering</option>
                  <option value="Production Engineering">Production Engineering</option>
                </optgroup>
                <optgroup label="Science & Agriculture">
                  <option value="Agricultural Engineering">Agricultural Engineering (AGRI)</option>
                  <option value="Food Technology">Food Technology</option>
                  <option value="Bio Technology">Bio Technology (BT)</option>
                  <option value="Chemical Engineering">Chemical Engineering</option>
                  <option value="Environmental Engineering">Environmental Engineering</option>
                </optgroup>
                <optgroup label="Management & Others">
                  <option value="Master of Business Administration">MBA</option>
                  <option value="Master of Computer Applications">MCA</option>
                  <option value="BSc Computer Science">B.Sc Computer Science</option>
                  <option value="BSc Mathematics">B.Sc Mathematics</option>
                </optgroup>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-500" />
                CGPA (0 - 10)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                placeholder="8.75"
                value={cgpa}
                onChange={(e) => setCgpa(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50/40 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-mono"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Technical Skills Tagging */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-card space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Code className="w-4 h-4" />
              </span>
              Skills & Technical Expertise
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
              {technicalSkills.length} Skills Listed
            </span>
          </div>

          {/* Quick suggestions by department */}
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Quick Add Skills by Department:
            </span>
            {(() => {
              const deptSkills = {
                'CSE / IT / AI': ['React', 'Node.js', 'Python', 'JavaScript', 'TypeScript', 'MongoDB', 'Docker', 'AWS', 'TailwindCSS', 'Machine Learning', 'Deep Learning', 'FastAPI', 'PostgreSQL', 'Git', 'Kubernetes', 'Next.js', 'Spring Boot', 'Flutter', 'Figma', 'Data Structures'],
                'EEE': ['MATLAB', 'PLC Programming', 'SCADA', 'Power Systems', 'Circuit Design', 'AutoCAD Electrical', 'Embedded Systems', 'Arduino', 'Raspberry Pi', 'Control Systems', 'Power Electronics', 'Transformer Design', 'ETAP', 'LabVIEW', 'PSCAD'],
                'ECE': ['VLSI Design', 'Verilog', 'VHDL', 'Embedded C', 'Arduino', 'Raspberry Pi', 'PCB Design', 'Cadence', 'RF Design', 'Signal Processing', 'MATLAB', 'LabVIEW', 'IoT', '8051 Microcontroller', 'ARM Cortex'],
                'Civil': ['AutoCAD', 'STAAD Pro', 'ETABS', 'Revit', 'Civil 3D', 'PRIMAVERA', 'Total Station Survey', 'GIS & Remote Sensing', 'SAP2000', 'HEC-RAS', 'Structural Analysis', 'Construction Management', 'Soil Testing', 'QA/QC'],
                'Mechanical': ['AutoCAD', 'SolidWorks', 'CATIA', 'ANSYS', 'Pro-E', 'CNC Programming', 'GD&T', 'Lean Manufacturing', 'Finite Element Analysis', 'Thermodynamics', 'Fluid Mechanics', 'Welding Technology', 'Six Sigma', '3D Printing'],
                'Agriculture': ['Precision Farming', 'GIS & Remote Sensing', 'Soil Science', 'Agricultural Machinery', 'Drip Irrigation Design', 'Plant Pathology', 'Agronomy', 'Farm Management', 'Post Harvest Technology', 'Food Processing', 'ArcGIS', 'Climate Smart Agriculture'],
              };
              return (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-1.5">
                    {Object.keys(deptSkills).map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setActiveDept(d)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                          activeDept === d
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-700'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    {(deptSkills[activeDept] || []).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => {
                          if (!technicalSkills.includes(s)) {
                            setTechnicalSkills(prev => [...prev, s]);
                          }
                        }}
                        disabled={technicalSkills.includes(s)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                          technicalSkills.includes(s)
                            ? 'bg-emerald-100 text-emerald-600 cursor-default'
                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200'
                        }`}
                      >
                        {technicalSkills.includes(s) ? '✓' : '+'} {s}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Add custom skill (e.g. Next.js, FastAPI, Kubernetes, Solidity)..."
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(e); } }}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-slate-50/40 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>
            <button
              type="button"
              onClick={handleAddSkill}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shrink-0 flex items-center gap-1.5 shadow-md shadow-emerald-100 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Add Skill
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-2 min-h-[40px]">
            {technicalSkills.length === 0 ? (
              <span className="text-xs text-slate-400 italic">No skills added yet. Use the input above or click quick add tags.</span>
            ) : (
              technicalSkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-900 font-bold text-xs border border-emerald-200 shadow-sm"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-emerald-500 hover:text-rose-600 transition-colors ml-0.5"
                    title={`Remove ${skill}`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))
            )}
          </div>
        </div>

        {/* Section 4: Academic & Personal Projects */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-card space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Briefcase className="w-4 h-4" />
              </span>
              Portfolio Projects ({projects.length})
            </h3>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Showcase Work</span>
          </div>

          {/* Existing Projects List */}
          {projects.length > 0 && (
            <div className="space-y-3 mb-4">
              {projects.map((proj, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-amber-50/20 border border-slate-200/80 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="text-sm font-extrabold text-slate-900">{proj.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{proj.description}</p>
                    {proj.technologies && proj.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {proj.technologies.map((t, i) => (
                          <span key={i} className="px-2 py-0.5 bg-white text-indigo-700 text-[10px] font-bold rounded-md border border-slate-200">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                    {proj.githubLink && (
                      <a
                        href={proj.githubLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-bold inline-flex items-center gap-1 mt-1"
                      >
                        <span>Project Repository / Demo</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveProject(idx)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete Project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add Project Form Box */}
          <div className="p-5 rounded-2xl bg-slate-50/70 border border-dashed border-slate-300 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-indigo-600" />
              Add New Project
            </span>
            <input
              type="text"
              placeholder="Project Title (e.g. AI-Powered Healthcare Diagnosis)"
              value={newProjTitle}
              onChange={(e) => setNewProjTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white"
            />
            <textarea
              rows="2"
              placeholder="Project description and key technical highlights..."
              value={newProjDesc}
              onChange={(e) => setNewProjDesc(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white leading-relaxed"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Tech Stack (comma separated: React, FastAPI, PyTorch)"
                value={newProjTech}
                onChange={(e) => setNewProjTech(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white"
              />
              <input
                type="url"
                placeholder="GitHub / Live Link (e.g. https://github.com/...)"
                value={newProjGithub}
                onChange={(e) => setNewProjGithub(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white"
              />
            </div>
            <button
              type="button"
              onClick={handleAddProject}
              className="px-4 py-2.5 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-900 transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Project to Profile
            </button>
          </div>
        </div>

        {/* Section 5: Internship Preferences */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-card space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </span>
              Career & Internship Preferences
            </h3>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">AI Match Factors</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-purple-500" />
                Target Role
              </label>
              <input
                type="text"
                placeholder="e.g. Full Stack Developer, AI/ML Intern"
                value={preferredRole}
                onChange={(e) => setPreferredRole(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50/40 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
              />
            </div>

            <div>
              <DomainAutocomplete
                value={preferredDomain}
                onChange={setPreferredDomain}
                studentDept={department}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5 text-purple-500" />
                Expected Monthly Stipend (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  placeholder="20000"
                  value={preferredStipend}
                  onChange={(e) => setPreferredStipend(e.target.value)}
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50/40 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Preferred Work Mode</label>
              <select
                value={preferredWorkMode}
                onChange={(e) => setPreferredWorkMode(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              >
                <option value="ANY">Any Work Mode</option>
                <option value="REMOTE">Remote (Work from Home)</option>
                <option value="HYBRID">Hybrid</option>
                <option value="ON_SITE">On-Site (Office)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between sticky bottom-4 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 shadow-2xl z-20">
          <span className="text-xs text-slate-500 font-medium hidden sm:block">
            Changes will immediately update your TF-IDF AI match ranking.
          </span>
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-lg shadow-indigo-200 transition-all flex items-center gap-2 disabled:opacity-50 ml-auto"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
          </button>
        </div>

      </form>

    </div>
  );
};
