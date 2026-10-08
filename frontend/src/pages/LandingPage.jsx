import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Sparkles,
  GraduationCap,
  Building2,
  Lock,
  Mail,
  Phone,
  User,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe,
  Briefcase,
} from 'lucide-react';

export const LandingPage = () => {
  const { login, register, logout, isAuthenticated, user } = useAuth();
  const { t, lang, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'
  const [selectedRole, setSelectedRole] = useState('student'); // 'student' | 'industry' (strictly no admin)

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regCompanyName, setRegCompanyName] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    const res = await login(loginEmail, loginPassword);
    setIsLoading(false);

    if (res.success) {
      if (res.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (res.role === 'industry') {
        navigate(res.verificationStatus === 'APPROVED' ? '/industry/dashboard' : '/industry/verification');
      } else {
        navigate(res.isProfileComplete ? '/student/dashboard' : '/student/complete-profile');
      }
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    if (regPassword !== regConfirmPassword) {
      setIsLoading(false);
      setErrorMsg('Passwords do not match');
      return;
    }

    const payload = {
      role: selectedRole,
      name: selectedRole === 'industry' ? regName : regName,
      email: regEmail,
      password: regPassword,
      phone: regPhone,
      companyName: selectedRole === 'industry' ? regCompanyName || regName : undefined,
    };

    const res = await register(payload);
    setIsLoading(false);

    if (res.success) {
      if (selectedRole === 'industry') {
        navigate('/industry/verification');
      } else {
        navigate('/student/complete-profile');
      }
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      
      {/* Top Navbar */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight text-white">DIICP PORTAL</h1>
            <p className="text-[10px] text-slate-400 font-medium">Digital Internship Platform</p>
          </div>
        </div>

        {/* Language selector */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLanguage(lang === 'en' ? 'ta' : lang === 'ta' ? 'hi' : 'en')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-semibold hover:bg-slate-700 transition-colors"
          >
            <Globe className="w-3.5 h-3.5 text-indigo-400" />
            <span>{lang === 'en' ? 'English' : lang === 'ta' ? 'தமிழ்' : 'हिन्दी'}</span>
          </button>
        </div>
      </header>

      {/* Main Split-Screen Section */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-12">
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* LEFT HALF: Title, Tagline, Visual Theme */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-extrabold tracking-wide">
              <Zap className="w-3.5 h-3.5 text-indigo-400 animate-bounce" />
              <span>AI-Powered Academic & Industry Collaboration</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Digital Internship and <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-indigo-200 bg-clip-text text-transparent">Industry Collaboration</span> Management Portal
            </h1>

            <p className="text-base sm:text-lg text-slate-300 font-medium max-w-xl mx-auto lg:mx-0 leading-relaxed">
              {t('portalTagline')}
            </p>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 text-left">
              <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 backdrop-blur-sm">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-2.5">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-white">For Students</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Resume NLP parsing, explainable AI matching, and transparent application tracking.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 backdrop-blur-sm">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-2.5">
                  <Building2 className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-white">For Industry</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Reverse candidate recommendation, interview pipeline stages, and verified hiring.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT HALF: Modern Auth Card */}
          <div className="lg:col-span-5 w-full max-w-md mx-auto">
            <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 relative">
              
              {/* Tab Switcher: Login / Register */}
              <div className="flex p-1 bg-slate-100 rounded-2xl mb-6">
                <button
                  type="button"
                  onClick={() => { setActiveTab('login'); setErrorMsg(''); }}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                    activeTab === 'login'
                      ? 'bg-white text-slate-900 shadow-md shadow-slate-200'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {t('login')}
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveTab('register'); setErrorMsg(''); }}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                    activeTab === 'register'
                      ? 'bg-white text-slate-900 shadow-md shadow-slate-200'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {t('register')}
                </button>
              </div>

              {errorMsg && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
                  {errorMsg}
                </div>
              )}

              {isAuthenticated && user && (
                <div className="mb-5 p-3.5 rounded-2xl bg-indigo-50/80 border border-indigo-200 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] uppercase font-bold text-indigo-500 block">Current Session</span>
                      <p className="font-extrabold text-slate-800 truncate">{user.name} <span className="text-slate-500 font-normal">({user.role})</span></p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (user.role === 'admin') navigate('/admin/dashboard');
                        else if (user.role === 'industry') navigate('/industry/dashboard');
                        else navigate(user.isProfileComplete ? '/student/dashboard' : '/student/complete-profile');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] shadow-sm shrink-0"
                    >
                      Continue →
                    </button>
                  </div>
                  <div className="mt-2 pt-2 border-t border-indigo-100/80 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">Sign in as different user:</span>
                    <button
                      type="button"
                      onClick={logout}
                      className="text-[11px] font-bold text-rose-600 hover:text-rose-700 underline"
                    >
                      Log Out
                    </button>
                  </div>
                </div>
              )}

              {/* LOGIN FORM */}
              {activeTab === 'login' ? (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      {t('emailAddress')}
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        placeholder="you@domain.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      {t('password')}
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
                  >
                    <span>{isLoading ? 'Authenticating...' : t('login')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                /* REGISTRATION FORM */
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  {/* Role Selector: ONLY STUDENT AND INDUSTRY (NO ADMIN) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      {t('selectRole')}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedRole('student')}
                        className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold border transition-all ${
                          selectedRole === 'student'
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <GraduationCap className="w-4 h-4" />
                        <span>{t('student')}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedRole('industry')}
                        className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold border transition-all ${
                          selectedRole === 'industry'
                            ? 'border-purple-600 bg-purple-50 text-purple-700'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <Building2 className="w-4 h-4" />
                        <span>{t('industry')}</span>
                      </button>
                    </div>
                  </div>

                  {selectedRole === 'industry' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        {t('companyName')}
                      </label>
                      <div className="relative">
                        <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          placeholder="e.g. Acme Technologies Inc."
                          value={regCompanyName}
                          onChange={(e) => setRegCompanyName(e.target.value)}
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      {selectedRole === 'industry' ? 'Contact Person Name' : t('fullName')}
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        placeholder="John Doe"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      {selectedRole === 'industry' ? 'Official Company Email' : t('emailAddress')}
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        placeholder="name@organization.com"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      {t('phoneNumber')}
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        placeholder="+91 9876543210"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        {t('password')}
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Confirm
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
                  >
                    <span>{isLoading ? 'Creating Account...' : t('register')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 text-center border-t border-slate-800/80 text-xs text-slate-500">
        © 2026 Digital Internship and Industry Collaboration Management Portal. All rights reserved.
      </footer>
    </div>
  );
};
