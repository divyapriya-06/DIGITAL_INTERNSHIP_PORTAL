import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';
import { Modal } from '../components/common/Modal';
import {
  Globe,
  Settings,
  ShieldAlert,
  AlertTriangle,
  UserX,
  Trash2,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export const SettingsPage = () => {
  const { user, logout } = useAuth();
  const { lang, setLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const handleDeactivate = async () => {
    try {
      setActionLoading(true);
      setErrorMsg('');
      const res = await api.put('/auth/deactivate');
      if (res.data.success) {
        alert(res.data.message || 'Your account has been deactivated. Logging out...');
        logout();
        navigate('/');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to deactivate account');
    } finally {
      setActionLoading(false);
      setShowDeactivateModal(false);
    }
  };

  const handleDelete = async () => {
    if (deleteConfirmText.trim().toUpperCase() !== 'DELETE') {
      alert('Please type DELETE to confirm permanent account deletion.');
      return;
    }

    try {
      setActionLoading(true);
      setErrorMsg('');
      const res = await api.delete('/auth/delete');
      if (res.data.success) {
        alert(res.data.message || 'Your account has been permanently deleted.');
        logout();
        navigate('/');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to delete account');
    } finally {
      setActionLoading(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          {t('settings')} & Preferences
        </h2>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Manage localization, preferences, and account controls.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600" />
          {errorMsg}
        </div>
      )}


      {/* Account Deactivation & Deletion (Danger Zone) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-100 shadow-card space-y-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              Account Management & Danger Zone
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Temporarily deactivate or permanently delete your portal account.
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100 pt-1">
          {/* Deactivate Option */}
          <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1 max-w-xl">
              <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <UserX className="w-4 h-4 text-amber-500" />
                Deactivate Account
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Temporarily disable your profile, applications, and visibility. You can easily reactivate your account anytime by logging back in with your credentials.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowDeactivateModal(true)}
              className="px-4 py-2.5 rounded-xl border border-amber-300 text-amber-800 bg-amber-50 hover:bg-amber-100 text-xs font-bold transition-all shrink-0 active:scale-95"
            >
              Deactivate Account
            </button>
          </div>

          {/* Delete Option */}
          <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1 max-w-xl">
              <h4 className="text-sm font-extrabold text-rose-700 flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-rose-500" />
                Delete Account Permanently
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Permanently erase your account, uploaded resumes, profile information, and submission history. <b className="text-rose-600">This action cannot be undone.</b>
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setDeleteConfirmText('');
                setShowDeleteModal(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-200 transition-all shrink-0 active:scale-95"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Deactivate Confirmation Modal */}
      <Modal
        isOpen={showDeactivateModal}
        onClose={() => setShowDeactivateModal(false)}
        title="Confirm Account Deactivation"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2">
            <p className="font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Are you sure you want to deactivate your account?
            </p>
            <p className="text-amber-800">
              Your profile and active applications will be paused. You will be signed out immediately. You can reactivate at any time simply by signing in.
            </p>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowDeactivateModal(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={actionLoading}
              onClick={handleDeactivate}
              className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors disabled:opacity-50"
            >
              {actionLoading ? 'Deactivating...' : 'Yes, Deactivate'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Permanent Account Deletion"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs space-y-2">
            <p className="font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              Warning: This is an irreversible action!
            </p>
            <p className="text-rose-800 leading-relaxed">
              All your account credentials, uploaded resumes, recommendations, and past applications will be permanently wiped from the portal database.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Type <span className="font-mono text-rose-600 font-black">DELETE</span> below to confirm:
            </label>
            <input
              type="text"
              placeholder="DELETE"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-mono uppercase"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowDeleteModal(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={actionLoading || deleteConfirmText.trim().toUpperCase() !== 'DELETE'}
              onClick={handleDelete}
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors disabled:opacity-40"
            >
              {actionLoading ? 'Deleting Account...' : 'Permanently Delete'}
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
};
