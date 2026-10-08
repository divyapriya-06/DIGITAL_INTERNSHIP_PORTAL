import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Loader } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';
import { AlertTriangle, CheckCircle2, XCircle, ShieldCheck, UserCheck } from 'lucide-react';

export const AdminDuplicateAccountsPage = () => {
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFlags = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/duplicate-flags');
      if (res.data.success) {
        setFlags(res.data.flags || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlags();
  }, []);

  const handleResolve = async (id, status) => {
    try {
      const res = await api.put(`/admin/duplicate-flags/${id}`, { status });
      if (res.data.success) {
        fetchFlags();
      }
    } catch (e) {
      alert('Failed to resolve flag');
    }
  };

  if (loading) return <Loader message="Checking duplicate student account heuristic flags..." />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Duplicate & Suspicious Student Account Flags
        </h2>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Heuristic detection identifies duplicate registrations based on matching phone numbers, colleges, departments, and resume fingerprints.
        </p>
      </div>

      {flags.length === 0 ? (
        <EmptyState
          title="No Duplicate Account Flags"
          description="All registered student accounts are distinct and verified."
          icon={UserCheck}
        />
      ) : (
        <div className="space-y-4">
          {flags.map((f) => (
            <div
              key={f._id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-600">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="text-xs font-black uppercase tracking-wider">
                    {f.similarityScore}% Profile Similarity Detected
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200">
                  Status: {f.status}
                </span>
              </div>

              <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl">
                <b>Detection Note:</b> {f.reason}
              </p>

              {/* Comparison Columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-indigo-50/40 border border-indigo-100">
                  <span className="text-[10px] font-bold uppercase text-indigo-700 block mb-1">Suspect Profile</span>
                  <h4 className="font-extrabold text-slate-900">{f.suspectProfile?.fullName}</h4>
                  <p className="text-slate-500">{f.suspectUser?.email} • {f.suspectUser?.phone}</p>
                  <p className="text-slate-600 mt-1">{f.suspectProfile?.college} ({f.suspectProfile?.department})</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Matching Profile</span>
                  <h4 className="font-extrabold text-slate-900">{f.matchingProfile?.fullName}</h4>
                  <p className="text-slate-500">{f.matchingUser?.email} • {f.matchingUser?.phone}</p>
                  <p className="text-slate-600 mt-1">{f.matchingProfile?.college} ({f.matchingProfile?.department})</p>
                </div>
              </div>

              {/* Decision Actions */}
              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  onClick={() => handleResolve(f._id, 'DISMISSED')}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Dismiss Flag
                </button>
                <button
                  onClick={() => handleResolve(f._id, 'REVIEWED_LEGITIMATE')}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm"
                >
                  Mark as Legitimate Account
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
