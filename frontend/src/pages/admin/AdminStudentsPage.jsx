import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { Loader } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Users,
  Search,
  FileText,
  UserX,
  UserCheck,
  Trash2,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
} from 'lucide-react';

export const AdminStudentsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') || 'ALL';

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [notification, setNotification] = useState('');

  // Sync status filter if searchParams change
  useEffect(() => {
    const qStatus = searchParams.get('status');
    if (qStatus) {
      setStatusFilter(qStatus);
    }
  }, [searchParams]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/students');
      if (res.data.success) {
        setStudents(res.data.students || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleStatusChange = async (student, nextStatus) => {
    const userId = student.user?._id || student.user;
    if (!userId) {
      alert('Associated user account not found');
      return;
    }

    try {
      setActionLoadingId(student._id);
      const res = await api.put(`/admin/users/${userId}/status`, { status: nextStatus });
      if (res.data.success) {
        setNotification(`Account for ${student.fullName} marked as ${nextStatus}`);
        setStudents(prev =>
          prev.map(s => {
            if (s._id === student._id) {
              return {
                ...s,
                user: { ...s.user, status: nextStatus },
              };
            }
            return s;
          })
        );
        setTimeout(() => setNotification(''), 3500);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user status');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteStudent = async (student) => {
    const confirmName = prompt(
      `Are you sure you want to permanently delete student "${student.fullName}"? Type DELETE to confirm:`
    );
    if (confirmName !== 'DELETE') {
      return;
    }

    const userId = student.user?._id || student.user;
    try {
      setActionLoadingId(student._id);
      const res = await api.delete(`/admin/users/${userId}`);
      if (res.data.success) {
        setNotification(`Student account ${student.fullName} deleted successfully.`);
        setStudents(prev => prev.filter(s => s._id !== student._id));
        setTimeout(() => setNotification(''), 3500);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete student account');
    } finally {
      setActionLoadingId(null);
    }
  };

  const setFilterTab = (tab) => {
    setStatusFilter(tab);
    if (tab === 'ALL') {
      searchParams.delete('status');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ status: tab });
    }
  };

  const filtered = students.filter((s) => {
    const matchesQuery =
      (s.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.college || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.department || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.user?.email || '').toLowerCase().includes(searchQuery.toLowerCase());

    const studentUserStatus = s.user?.status || 'ACTIVE';

    if (statusFilter === 'ACTIVE') {
      return matchesQuery && studentUserStatus === 'ACTIVE';
    }
    if (statusFilter === 'INACTIVE') {
      return matchesQuery && studentUserStatus === 'INACTIVE';
    }
    return matchesQuery;
  });

  if (loading) return <Loader message="Fetching institutional student database..." />;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Registered Student Body ({students.length})
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Manage student registrations, review academic credentials, and toggle account activation or deletion.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by student, college or skill..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      {/* Notification banner */}
      {notification && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Filter Tabs for Easy Access */}
      <div className="bg-white rounded-2xl p-2.5 border border-slate-200/80 shadow-sm flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">
          Quick Filters:
        </span>
        {[
          { id: 'ALL', label: `All Students (${students.length})` },
          { id: 'ACTIVE', label: `Active (${students.filter(s => (s.user?.status || 'ACTIVE') === 'ACTIVE').length})` },
          { id: 'INACTIVE', label: `Deactivated (${students.filter(s => (s.user?.status || 'ACTIVE') === 'INACTIVE').length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterTab(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === tab.id
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Students Table */}
      {filtered.length === 0 ? (
        <EmptyState title="No Students Found" description="No registered students match your filter or search criteria." />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                <tr>
                  <th className="py-4 px-6">Student Details</th>
                  <th className="py-4 px-4">College & Department</th>
                  <th className="py-4 px-4">CGPA / Grad Year</th>
                  <th className="py-4 px-4">Account Status</th>
                  <th className="py-4 px-4">Profile Strength</th>
                  <th className="py-4 px-4 text-center">Resume</th>
                  <th className="py-4 px-6 text-right">User Management</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((s) => {
                  const userStatus = s.user?.status || 'ACTIVE';
                  const isInactive = userStatus === 'INACTIVE';
                  const isActing = actionLoadingId === s._id;

                  return (
                    <tr key={s._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-2xl font-black text-xs flex items-center justify-center shrink-0 border ${
                            isInactive
                              ? 'bg-slate-100 text-slate-400 border-slate-200'
                              : 'bg-indigo-50 text-indigo-700 border-indigo-100'
                          }`}>
                            {s.fullName?.slice(0, 2).toUpperCase() || 'ST'}
                          </div>
                          <div>
                            <h4 className={`font-extrabold text-sm ${isInactive ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                              {s.fullName}
                            </h4>
                            <p className="text-[11px] text-slate-500">{s.user?.email || s.phone}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 font-semibold text-slate-800">
                        <div>{s.college || 'N/A'}</div>
                        <div className="text-[11px] text-slate-500">{s.degree} • {s.department}</div>
                      </td>

                      <td className="py-4 px-4 font-bold text-slate-800">
                        <div>CGPA: <span className="text-indigo-600 font-black">{s.cgpa || '8.0'}</span></div>
                        <div className="text-[11px] text-slate-400 font-normal">Class of {s.graduationYear || 2026}</div>
                      </td>

                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          isInactive
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isInactive ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                          {isInactive ? 'Deactivated' : 'Active'}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800">{s.profileCompletionPercentage}%</span>
                          <div className="w-14 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${s.profileCompletionPercentage}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-center">
                        {s.resumePath ? (
                          <a
                            href={`/${s.resumePath}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                          >
                            <FileText className="w-3 h-3 text-indigo-600" />
                            <span>PDF</span>
                          </a>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">None</span>
                        )}
                      </td>

                      {/* Management Action Buttons */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isInactive ? (
                            <button
                              disabled={isActing}
                              onClick={() => handleStatusChange(s, 'ACTIVE')}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs transition-colors border border-emerald-200 disabled:opacity-50"
                              title="Reactivate student account"
                            >
                              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Activate</span>
                            </button>
                          ) : (
                            <button
                              disabled={isActing}
                              onClick={() => handleStatusChange(s, 'INACTIVE')}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-xs transition-colors border border-amber-200 disabled:opacity-50"
                              title="Deactivate student account"
                            >
                              <UserX className="w-3.5 h-3.5 text-amber-600" />
                              <span>Deactivate</span>
                            </button>
                          )}

                          <button
                            disabled={isActing}
                            onClick={() => handleDeleteStudent(s)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition-colors border border-rose-200 disabled:opacity-50"
                            title="Permanently delete user"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                            <span className="hidden lg:inline">Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
