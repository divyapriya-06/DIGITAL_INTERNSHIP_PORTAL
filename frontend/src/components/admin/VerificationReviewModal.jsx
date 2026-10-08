import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { ShieldCheck, CheckCircle2, XCircle, Clock, Building2, FileText, Globe, MapPin, Mail, Phone, ExternalLink } from 'lucide-react';
import api from '../../services/api';

export const VerificationReviewModal = ({ isOpen, onClose, industry, onUpdated }) => {
  if (!industry) return null;

  const [status, setStatus] = useState(industry.verificationStatus || 'PENDING');
  const [rejectionReason, setRejectionReason] = useState(industry.verificationRejectionReason || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (newStatus) => {
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await api.put(`/admin/verifications/${industry._id}`, {
        status: newStatus,
        rejectionReason: newStatus === 'REJECTED' ? rejectionReason : undefined,
      });

      if (res.data.success) {
        if (onUpdated) onUpdated(res.data.industry);
        onClose();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update verification status');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Company Verification & Compliance Review"
      maxWidth="max-w-xl"
    >
      <div className="space-y-5">
        {/* Company Header */}
        <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex items-start gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white border border-indigo-200 flex items-center justify-center font-black text-indigo-600 text-sm shadow-sm shrink-0">
            {industry.companyName?.slice(0, 2).toUpperCase() || 'CO'}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-base font-extrabold text-slate-900 truncate">
              {industry.companyName}
            </h4>
            <div className="flex flex-wrap gap-3 text-xs text-slate-600 mt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {industry.companyLocation}
              </span>
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {industry.officialEmail}
              </span>
              {industry.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {industry.phone}
                </span>
              )}
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
            {errorMsg}
          </div>
        )}

        {/* Company Description */}
        {industry.companyDescription && (
          <div className="text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
            <span className="font-bold text-slate-800 block mb-0.5">Company Profile:</span>
            {industry.companyDescription}
          </div>
        )}

        {/* Uploaded Verification Document */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-indigo-500" />
            Uploaded Verification Proof
          </h5>

          {industry.verificationProofPath ? (
            <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 text-xs">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span className="font-semibold text-slate-800 truncate max-w-xs">
                  {industry.verificationProofOriginalName || 'Company_Registration_Proof.pdf'}
                </span>
              </div>
              <a
                href={`/${industry.verificationProofPath}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs hover:bg-indigo-100 transition-colors"
              >
                <span>Inspect Document</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">No document file attached</p>
          )}
        </div>

        {/* Rejection Reason Input (if rejecting) */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Rejection Notes (Sent to Industry if rejected)
          </label>
          <textarea
            rows="2"
            placeholder="e.g. Incomplete GST certificate or invalid corporate address..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        {/* Decision Actions */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => handleSubmit('ON_HOLD')}
            disabled={isSubmitting}
            className="px-4 py-2.5 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs transition-colors"
          >
            Hold
          </button>
          <button
            type="button"
            onClick={() => handleSubmit('REJECTED')}
            disabled={isSubmitting}
            className="px-4 py-2.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition-colors flex items-center gap-1.5"
          >
            <XCircle className="w-3.5 h-3.5" />
            Reject
          </button>
          <button
            type="button"
            onClick={() => handleSubmit('APPROVED')}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-200 transition-all flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Approve & Authorize
          </button>
        </div>
      </div>
    </Modal>
  );
};
