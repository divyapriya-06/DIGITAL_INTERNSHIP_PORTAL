import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';
import {
  Bell,
  Globe,
  LogOut,
  User,
  CheckCircle2,
  Calendar,
  Briefcase,
  ChevronDown,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Building2,
  GraduationCap
} from 'lucide-react';

export const Navbar = () => {
  const { user, profile, logout } = useAuth();
  const { lang, setLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const langRef = useRef(null);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      console.warn('Could not fetch notifications:', err.message);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [user]);

  // Click outside listeners
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (langRef.current && !langRef.current.contains(event.target)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = async (notif) => {
    try {
      if (!notif.isRead) {
        await api.put(`/notifications/${notif._id}/read`);
        setUnreadCount(prev => Math.max(0, prev - 1));
        setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n));
      }
      setIsNotifOpen(false);
      if (notif.link) {
        navigate(notif.link);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <ShieldCheck className="w-3.5 h-3.5 text-rose-500" /> Admin
          </span>
        );
      case 'industry':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <Building2 className="w-3.5 h-3.5 text-purple-500" /> Industry
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <GraduationCap className="w-3.5 h-3.5 text-indigo-500" /> Student
          </span>
        );
    }
  };

  const dashboardPath = !user
    ? '/'
    : user.role === 'admin'
    ? '/admin/dashboard'
    : user.role === 'industry'
    ? '/industry/dashboard'
    : '/student/dashboard';

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-sm transition-all">
      <div className="flex items-center justify-between px-4 lg:px-8 h-16">
        
        {/* Left Branding / Title */}
        <div className="flex items-center gap-3">
          <Link to={dashboardPath} className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div className="hidden sm:block">
              <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-800 bg-clip-text text-transparent block leading-tight">
                DIICP Portal
              </span>
              <span className="text-[11px] text-slate-500 font-medium tracking-wide">
                Digital Collaboration Network
              </span>
            </div>
          </Link>
        </div>

        {/* Right Section: Language, Notifications, User Profile */}
        <div className="flex items-center gap-2 md:gap-3">
          
          {/* Multilingual Selector */}
          <div className="relative" ref={langRef}>
            <button
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100/80 text-xs font-semibold text-slate-700 transition-all"
              title="Change Language"
            >
              <Globe className="w-4 h-4 text-slate-500" />
              <span>{lang === 'en' ? 'English' : lang === 'ta' ? 'தமிழ்' : 'हिन्दी'}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isLangOpen && (
              <div className="absolute right-0 mt-2 w-36 bg-white rounded-2xl shadow-xl border border-slate-100 py-1 z-50 animate-in fade-in zoom-in-95 duration-150">
                <button
                  onClick={() => { setLanguage('en'); setIsLangOpen(false); }}
                  className={`w-full text-left px-3.5 py-2 text-xs font-medium flex items-center justify-between ${lang === 'en' ? 'text-indigo-600 bg-indigo-50/70 font-bold' : 'text-slate-700 hover:bg-slate-50'}`}
                >
                  English {lang === 'en' && '✓'}
                </button>
                <button
                  onClick={() => { setLanguage('ta'); setIsLangOpen(false); }}
                  className={`w-full text-left px-3.5 py-2 text-xs font-medium flex items-center justify-between ${lang === 'ta' ? 'text-indigo-600 bg-indigo-50/70 font-bold' : 'text-slate-700 hover:bg-slate-50'}`}
                >
                  தமிழ் {lang === 'ta' && '✓'}
                </button>
                <button
                  onClick={() => { setLanguage('hi'); setIsLangOpen(false); }}
                  className={`w-full text-left px-3.5 py-2 text-xs font-medium flex items-center justify-between ${lang === 'hi' ? 'text-indigo-600 bg-indigo-50/70 font-bold' : 'text-slate-700 hover:bg-slate-50'}`}
                >
                  हिन्दी {lang === 'hi' && '✓'}
                </button>
              </div>
            )}
          </div>

          {/* Notifications Dropdown */}
          {user && (
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white animate-bounce">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 py-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-slate-800">Notifications</h3>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-600">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-xs text-slate-400">
                        No notifications yet
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif._id}
                          onClick={() => handleNotificationClick(notif)}
                          className={`p-3.5 hover:bg-slate-50 cursor-pointer transition-colors flex items-start gap-3 ${!notif.isRead ? 'bg-indigo-50/30' : ''}`}
                        >
                          <div className="p-2 rounded-xl bg-slate-100 shrink-0 text-slate-700">
                            {notif.type === 'APPLICATION_UPDATE' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> :
                             notif.type === 'INTERVIEW_SCHEDULED' ? <Calendar className="w-4 h-4 text-indigo-500" /> :
                             <Briefcase className="w-4 h-4 text-blue-500" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-800 leading-snug">
                              {notif.title}
                            </p>
                            <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2">
                              {notif.message}
                            </p>
                            <span className="text-[10px] text-slate-400 mt-1 block">
                              {new Date(notif.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          {!notif.isRead && (
                            <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0 mt-1.5" />
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Account Menu */}
          {user ? (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-1.5 rounded-2xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="hidden md:block text-left">
                  <span className="block text-xs font-bold text-slate-800 leading-tight truncate max-w-[120px]">
                    {user.name}
                  </span>
                  <div className="mt-0.5">{getRoleBadge(user.role)}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-800 truncate">{user.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                    <div className="mt-1.5">{getRoleBadge(user.role)}</div>
                  </div>

                  <div className="py-1">
                    <Link
                      to={user.role === 'student' ? '/student/profile' : user.role === 'industry' ? '/industry/profile' : '/admin/dashboard'}
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      <span>{t('profile')}</span>
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Globe className="w-4 h-4 text-slate-400" />
                      <span>{t('settings')}</span>
                    </Link>
                  </div>

                  <div className="pt-1 border-t border-slate-100">
                    <button
                      onClick={() => { logout(); navigate('/'); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>{t('logout')}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/"
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-xs shadow-md shadow-indigo-200 hover:bg-indigo-700 transition-all"
            >
              {t('login')}
            </Link>
          )}

        </div>
      </div>
    </header>
  );
};
