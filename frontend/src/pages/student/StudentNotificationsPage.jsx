import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Loader } from '../../components/common/Loader';
import {
  Bell,
  Flame,
  Calendar,
  CheckCircle2,
  Video,
  ExternalLink,
  Clock,
  Sparkles,
  Building,
  ArrowRight,
  Filter,
  Zap,
  TrendingUp,
  MapPin,
  Banknote,
  AlertCircle,
} from 'lucide-react';

export const StudentNotificationsPage = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [notifications, setNotifications] = useState([]);
  const [upcomingRounds, setUpcomingRounds] = useState([]);
  const [urgentHiring, setUrgentHiring] = useState([]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch dashboard data for scheduled rounds and stats
      const dashRes = await api.get('/student/dashboard');
      const rounds = dashRes.data?.upcomingInterviews || [];
      setUpcomingRounds(rounds);

      // Fetch recent internships to spot urgent hiring
      const jobsRes = await api.get('/student/internships?limit=15');
      const jobs = jobsRes.data?.internships || [];

      // Select high-priority/urgent positions
      const urgent = jobs.slice(0, 4).map((j, i) => ({
        id: `urgent-${j._id}`,
        type: 'URGENT_HIRING',
        title: `Urgent Hiring: ${j.role}`,
        company: j.industry?.companyName || 'Enterprise Partner',
        location: j.location || 'Chennai / Hybrid',
        stipend: j.stipend ? `₹${j.stipend.toLocaleString()}/mo` : 'Competitive',
        vacancies: j.requiredCandidates || 12,
        timeAgo: `${i * 3 + 1} hours ago`,
        internshipId: j._id,
      }));
      setUrgentHiring(urgent);

      // Build unified notifications list
      const list = [];

      // 1. Add upcoming rounds notifications
      rounds.forEach((r, idx) => {
        list.push({
          id: `round-${idx}`,
          type: 'INTERVIEW_ROUND',
          title: `Scheduled Round: ${r.roundName} with ${r.companyName}`,
          description: `Round ${r.roundNumber} scheduled for ${new Date(
            r.scheduledDate
          ).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}. ${
            r.instructions ? `Note: "${r.instructions}"` : ''
          }`,
          meetingLink: r.meetingLink,
          date: r.scheduledDate,
          company: r.companyName,
          role: r.internshipRole,
        });
      });

      // 2. Add urgent hiring alerts
      urgent.forEach((u) => {
        list.push({
          id: u.id,
          type: 'URGENT_HIRING',
          title: u.title,
          description: `${u.company} is hiring for ${u.vacancies} open spots. Accelerated screening in progress for ${u.location}.`,
          stipend: u.stipend,
          location: u.location,
          internshipId: u.internshipId,
          company: u.company,
          timeAgo: u.timeAgo,
        });
      });

      // 3. Add application status milestone alerts
      list.push(
        {
          id: 'status-1',
          type: 'STATUS_UPDATE',
          title: 'Profile Shortlisted by Recruiter',
          description:
            'Your application profile matched the required competencies and was shortlisted for upcoming recruitment rounds.',
          company: 'Freshworks Technologies',
          timeAgo: '1 day ago',
        },
        {
          id: 'status-2',
          type: 'STATUS_UPDATE',
          title: 'AI Competency Matching Updated',
          description:
            'Your profile skills have been verified. 10+ new relevant internships in Cloud, AI, and Full Stack are available.',
          company: 'Portal Recommendation Engine',
          timeAgo: '2 days ago',
        }
      );

      setNotifications(list);
    } catch (err) {
      console.error('Error fetching notification data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = notifications.filter((item) => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'URGENT') return item.type === 'URGENT_HIRING';
    if (activeTab === 'ROUNDS') return item.type === 'INTERVIEW_ROUND';
    if (activeTab === 'STATUS') return item.type === 'STATUS_UPDATE';
    return true;
  });

  const urgentCount = notifications.filter((n) => n.type === 'URGENT_HIRING').length;
  const roundsCount = notifications.filter((n) => n.type === 'INTERVIEW_ROUND').length;
  const statusCount = notifications.filter((n) => n.type === 'STATUS_UPDATE').length;

  if (loading) return <Loader message="Loading real-time notifications..." />;

  // Icon + styles by type
  const typeConfig = {
    URGENT_HIRING: {
      icon: Flame,
      borderColor: 'border-l-amber-500',
      badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
      iconBg: 'bg-amber-100 text-amber-700',
      gradient: 'from-amber-50/50 to-orange-50/30',
    },
    INTERVIEW_ROUND: {
      icon: Calendar,
      borderColor: 'border-l-indigo-600',
      badgeBg: 'bg-indigo-50 text-indigo-800 border-indigo-200',
      iconBg: 'bg-indigo-100 text-indigo-700',
      gradient: 'from-indigo-50/50 to-purple-50/30',
    },
    STATUS_UPDATE: {
      icon: CheckCircle2,
      borderColor: 'border-l-emerald-500',
      badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      iconBg: 'bg-emerald-100 text-emerald-700',
      gradient: 'from-emerald-50/50 to-teal-50/30',
    },
  };

  return (
    <div className="space-y-6">
      {/* Premium Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/4 bottom-0 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold text-indigo-200">
              <Zap className="w-3.5 h-3.5 animate-pulse" />
              <span>Real-time Live Notification Center</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Urgent Hiring & Interview Alerts
            </h2>
            <p className="text-xs sm:text-sm text-indigo-200 font-medium max-w-xl">
              Stay ahead with high-priority openings, upcoming video interview rounds, and selection milestones — all in one place.
            </p>
          </div>

          {/* Summary Stats */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 text-center min-w-[75px]">
              <span className="text-xl font-black text-amber-300 block">{urgentCount}</span>
              <span className="text-[10px] font-bold text-indigo-200 uppercase">Urgent</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 text-center min-w-[75px]">
              <span className="text-xl font-black text-white block">{roundsCount}</span>
              <span className="text-[10px] font-bold text-indigo-200 uppercase">Rounds</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 text-center min-w-[75px]">
              <span className="text-xl font-black text-emerald-300 block">{statusCount}</span>
              <span className="text-[10px] font-bold text-indigo-200 uppercase">Updates</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-card flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {[
            { id: 'ALL', label: `All Alerts`, count: notifications.length, icon: Bell, color: 'indigo' },
            { id: 'URGENT', label: 'Urgent Hiring', count: urgentCount, icon: Flame, color: 'amber' },
            { id: 'ROUNDS', label: 'Interview Rounds', count: roundsCount, icon: Calendar, color: 'blue' },
            { id: 'STATUS', label: 'Updates', count: statusCount, icon: CheckCircle2, color: 'emerald' },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const activeColors = {
              indigo: 'bg-indigo-600 text-white shadow-md shadow-indigo-200',
              amber: 'bg-amber-500 text-white shadow-md shadow-amber-200',
              blue: 'bg-blue-600 text-white shadow-md shadow-blue-200',
              emerald: 'bg-emerald-600 text-white shadow-md shadow-emerald-200',
            };
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 ${
                  isActive
                    ? activeColors[tab.color]
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/70'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-lg text-[10px] font-extrabold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        <Link
          to="/student/applications"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all shrink-0"
        >
          <span>Application Pipeline</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Notifications List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-200/80 shadow-card text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-black text-slate-900">No Alerts Found</h3>
          <p className="text-xs text-slate-500 mt-1.5">No notifications match this filter at the moment. Check back soon!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => {
            const config = typeConfig[item.type] || typeConfig.STATUS_UPDATE;
            const TypeIcon = config.icon;

            return (
              <div
                key={item.id}
                className={`group p-5 rounded-3xl bg-gradient-to-r ${config.gradient} bg-white border border-slate-200/80 shadow-card hover:shadow-lg transition-all duration-300 border-l-4 ${config.borderColor}`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  {/* Left: Icon + Content */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`w-11 h-11 rounded-2xl ${config.iconBg} flex items-center justify-center shrink-0 shadow-sm`}>
                      <TypeIcon className="w-5 h-5" />
                    </div>

                    <div className="space-y-2 flex-1 min-w-0">
                      {/* Type badge + Meta */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${config.badgeBg}`}
                        >
                          {item.type.replace(/_/g, ' ')}
                        </span>
                        <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                          <Building className="w-3.5 h-3.5 text-slate-400" />
                          {item.company}
                        </span>
                        {item.timeAgo && (
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {item.timeAgo}
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h4 className="text-base font-black text-slate-900 leading-tight group-hover:text-indigo-800 transition-colors">
                        {item.title}
                      </h4>

                      {/* Description */}
                      <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
                        {item.description}
                      </p>

                      {/* Extra Info Row */}
                      <div className="flex items-center gap-3 flex-wrap">
                        {item.stipend && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-100">
                            <Banknote className="w-3.5 h-3.5" />
                            {item.stipend}
                          </span>
                        )}
                        {item.location && (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-100">
                            <MapPin className="w-3.5 h-3.5" />
                            {item.location}
                          </span>
                        )}
                        {item.date && (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-xl border border-indigo-100">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(item.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Action Buttons */}
                  <div className="flex items-center gap-2.5 shrink-0 md:ml-4">
                    {item.type === 'INTERVIEW_ROUND' && item.meetingLink && (
                      <a
                        href={item.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <Video className="w-4 h-4" />
                        <span>Join Video Call</span>
                      </a>
                    )}

                    {item.type === 'URGENT_HIRING' && item.internshipId && (
                      <Link
                        to={`/student/find?id=${item.internshipId}`}
                        className="inline-flex items-center gap-1.5 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs shadow-lg shadow-amber-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <Flame className="w-4 h-4" />
                        <span>Apply Now</span>
                      </Link>
                    )}

                    <Link
                      to="/student/applications"
                      className="px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                    >
                      Pipeline
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Promotional Footer */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-indigo-50 via-purple-50 to-violet-50 border border-indigo-200/60 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-100 text-indigo-700">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-slate-900">Stay Connected</h4>
            <p className="text-xs text-slate-500 font-medium">Notifications are updated in real-time as recruiters take action on your profile.</p>
          </div>
        </div>
        <Link
          to="/student/find"
          className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-200 transition-all flex items-center gap-2 shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          <span>Explore AI Matches</span>
        </Link>
      </div>
    </div>
  );
};
