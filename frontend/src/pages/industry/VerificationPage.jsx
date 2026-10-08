import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Loader } from '../../components/common/Loader';
import {
  ShieldCheck,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  ArrowRight,
  Sparkles,
  PlusCircle,
  LayoutDashboard,
  Building2
} from 'lucide-react';
import { StatusBadge } from '../../components/common/Badge';

export const VerificationPage = () => {
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [countdown, setCountdown] = useState(null);
  const pollTimerRef = useRef(null);
  const countdownTimerRef = useRef(null);

  const fetchProfile = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await api.get('/industry/profile');
      if (res.data.success) {
        setProfile(res.data.profile);
        if (res.data.profile.verificationStatus === 'APPROVED') {
          if (refreshProfile) refreshProfile();
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Periodic polling if awaiting approval so user auto-updates without manual refresh
  useEffect(() => {
    if (profile && profile.verificationStatus !== 'APPROVED') {
      pollTimerRef.current = setInterval(() => {
        fetchProfile(true);
      }, 5000);
    } else {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    }

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [profile?.verificationStatus]);

  // Initiate countdown redirect when approved
  useEffect(() => {
    if (profile?.verificationStatus === 'APPROVED' && countdown === null) {
      setCountdown(4);
    }
  }, [profile?.verificationStatus, countdown]);

  // Countdown timer effect
  useEffect(() => {
    if (countdown === null) return;
    if (countdown <= 0) {
      navigate('/industry/dashboard');
      return;
    }

    countdownTimerRef.current = setTimeout(() => {
      setCountdown((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => {
      if (countdownTimerRef.current) clearTimeout(countdownTimerRef.current);
    };
  }, [countdown, navigate]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('proof', file);

    setUploading(true);
    setSuccessMsg('');

    try {
      const res = await api.post('/industry/verification', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        setProfile(res.data.profile);
        setSuccessMsg('Verification document submitted successfully! Administrator has been notified for review.');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Document upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <Loader message="Fetching verification status..." />;

  const status = profile?.verificationStatus || 'PENDING';
  const isApproved = status === 'APPROVED';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Building2 className="w-7 h-7 text-indigo-600" />
            Corporate Verification & Authorization
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            To protect students from unverified recruitment, our platform requires corporate proof before authorizing internship postings.
          </p>
        </div>

        {isApproved && (
          <Link
            to="/industry/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition-all self-start sm:self-auto"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Go to Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {successMsg}
        </div>
      )}

      {/* Verification Status Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-white text-indigo-600 border border-slate-200 shadow-sm shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400">Current Status</span>
              <h3 className="text-base font-extrabold text-slate-900">{profile?.companyName}</h3>
            </div>
          </div>
          <div>
            <StatusBadge status={status} />
          </div>
        </div>

        {/* Rejection / Hold Notes */}
        {status === 'REJECTED' && profile?.verificationRejectionReason && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
            <span className="font-bold block mb-1">Rejection Reason by Admin:</span>
            "{profile.verificationRejectionReason}". Please re-upload updated corporate documentation.
          </div>
        )}

        {/* Approved State Banner & Action Navigation */}
        {isApproved ? (
          <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-50 via-teal-50/50 to-emerald-100/40 border-2 border-emerald-300/80 text-emerald-950 space-y-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/30">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-emerald-950 tracking-tight flex items-center gap-2">
                    Company Verified & Approved by Administrator
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-200 text-emerald-900 font-extrabold uppercase">
                      Active
                    </span>
                  </h3>
                  <p className="text-xs text-emerald-800 font-medium mt-1 leading-relaxed">
                    Your corporate credentials have been authorized. You have full access to post internships, review student applicants, and discover AI-matched candidates.
                  </p>
                </div>
              </div>
            </div>

            {/* Countdown / Direct Action Bar */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-emerald-200/70">
              {countdown !== null ? (
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                  <Clock className="w-4 h-4 text-emerald-600 animate-spin" />
                  <span>Redirecting to your Dashboard in <span className="text-emerald-900 font-black text-sm px-1.5 py-0.5 bg-emerald-200/60 rounded-md">{countdown}s</span>...</span>
                  <button
                    onClick={() => setCountdown(null)}
                    className="text-[11px] text-emerald-700 hover:text-emerald-900 underline ml-2 font-medium"
                  >
                    Stay on page
                  </button>
                </div>
              ) : (
                <div className="text-xs font-medium text-emerald-800">
                  Ready to access your corporate dashboard anytime.
                </div>
              )}

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <Link
                  to="/industry/dashboard"
                  className="flex-1 sm:flex-initial px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Proceed to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/industry/post"
                  className="px-4 py-2.5 rounded-2xl bg-white hover:bg-emerald-50 text-emerald-900 border border-emerald-300 font-bold text-xs transition-all flex items-center justify-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4 text-emerald-600" />
                  <span>Post Internship</span>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Upload Company Registration Proof (PDF / JPG / PNG)
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Acceptable documents: GST Certificate, Certificate of Incorporation, MSME Certificate, or Official Letterhead.
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                <Clock className="w-3.5 h-3.5 animate-pulse text-amber-500" />
                <span>Checking approval status in real-time</span>
              </div>
            </div>

            <div className="border-2 border-dashed border-slate-200 rounded-3xl p-8 text-center hover:border-indigo-400 transition-colors bg-slate-50/50">
              <input
                type="file"
                id="proof-upload"
                accept=".pdf,.jpg,.jpeg,.png,.docx"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
              <label htmlFor="proof-upload" className="cursor-pointer flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-slate-800">
                  {uploading ? 'Uploading Verification Proof...' : 'Click to Upload Verification Document'}
                </span>
                <span className="text-[11px] text-slate-400 mt-1">
                  PDF, JPG, or PNG format up to 10MB
                </span>
              </label>
            </div>
          </div>
        )}

        {/* Existing Proof Document View */}
        {profile?.verificationProofPath && (
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-700 font-semibold">
              <FileText className="w-4 h-4 text-indigo-600" />
              <span>{profile.verificationProofOriginalName || 'Company_Verification_Proof.pdf'}</span>
            </div>
            <a
              href={`/${profile.verificationProofPath}`}
              target="_blank"
              rel="noreferrer"
              className="font-bold text-indigo-600 hover:underline flex items-center gap-1"
            >
              <span>View Uploaded File</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}

      </div>

    </div>
  );
};
