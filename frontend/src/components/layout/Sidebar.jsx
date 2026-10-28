import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  LayoutDashboard,
  Search,
  Sparkles,
  Briefcase,
  CalendarCheck,
  UserCheck,
  Star,
  Bell,
  Settings,
  LogOut,
  Building2,
  PlusCircle,
  Users,
  GitBranch,
  BarChart3,
  CheckSquare,
  AlertTriangle,
  MessageSquareQuote,
  Flame,
} from 'lucide-react';

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  if (!user) return null;

  const role = user.role;

  const studentLinks = [
    { to: '/student/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/student/find', icon: Search, label: 'Find Internships', badge: 'AI' },
    { to: '/student/applications', icon: Briefcase, label: 'Applications' },
    { to: '/student/upcoming-rounds', icon: CalendarCheck, label: 'Upcoming Rounds' },
    { to: '/student/skill-demand', icon: Flame, label: 'Skill Demand' },
    { to: '/student/profile', icon: UserCheck, label: 'Profile' },
    { to: '/student/reviews', icon: Star, label: 'Reviews' },
    { to: '/student/notifications', icon: Bell, label: 'Notifications' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  const industryLinks = [
    { to: '/industry/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/industry/profile', icon: Building2, label: 'Company Profile' },
    { to: '/industry/post', icon: PlusCircle, label: 'Post Internship' },
    { to: '/industry/internships', icon: Briefcase, label: 'My Internships' },
    { to: '/industry/applications', icon: Users, label: 'Applications' },
    { to: '/industry/ai-candidates', icon: Sparkles, label: 'AI Candidates', badge: 'AI' },
    { to: '/industry/rounds', icon: GitBranch, label: 'Recruitment Rounds' },
    { to: '/industry/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/industry/notifications', icon: Bell, label: 'Notifications' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/students', icon: Users, label: 'Students' },
    { to: '/admin/industries', icon: Building2, label: 'Industries Directory' },
    { to: '/admin/internships', icon: Briefcase, label: 'Internships' },
    { to: '/admin/verifications', icon: CheckSquare, label: 'Verification Requests' },
    { to: '/admin/duplicates', icon: AlertTriangle, label: 'Duplicate Accounts' },
    { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/admin/skill-demand', icon: Flame, label: 'Skill Demand' },
    { to: '/admin/feedback', icon: MessageSquareQuote, label: 'Feedback & Suggestions' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  let links = studentLinks;
  if (role === 'industry') links = industryLinks;
  if (role === 'admin') links = adminLinks;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside className="w-64 bg-white/95 backdrop-blur-md border-r border-slate-200/80 min-h-[calc(100vh-4rem)] flex flex-col justify-between p-4 shadow-sm">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
          {role === 'admin' ? 'Administration' : role === 'industry' ? 'Industry Portal' : 'Student Portal'}
        </div>

        <nav className="space-y-1">
          {links.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.to} className="space-y-1">
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 scale-[1.01]'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded-md text-[9px] font-extrabold bg-amber-400 text-amber-950 uppercase tracking-wider">
                      {item.badge}
                    </span>
                  )}
                </NavLink>

                {/* Sub filters for easy access if present */}
                {item.subFilters && (
                  <div className="flex items-center gap-1 pl-9 pr-1 py-1">
                    {item.subFilters.map((sub, sIdx) => (
                      <NavLink
                        key={sIdx}
                        to={`${item.to}${sub.query}`}
                        className={({ isActive }) =>
                          `px-2 py-0.5 rounded-lg text-[10px] font-bold transition-colors ${
                            isActive && (!sub.query || window.location.search === sub.query)
                              ? 'bg-indigo-100 text-indigo-800 font-extrabold'
                              : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-100'
                          }`
                        }
                      >
                        {sub.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Bottom Logout Button */}
      <div className="pt-4 border-t border-slate-100 mt-6">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors"
        >
          <LogOut className="w-4 h-4 text-rose-500" />
          <span>{t('logout')}</span>
        </button>
      </div>
    </aside>
  );
};
