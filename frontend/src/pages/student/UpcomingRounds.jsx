import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Loader } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';
import { Calendar, Video, Clock, Building2, MapPin, CheckCircle2, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const UpcomingRounds = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        setLoading(true);
        const res = await api.get('/student/dashboard');
        if (res.data.success) {
          setInterviews(res.data.upcomingInterviews || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInterviews();
  }, []);

  if (loading) return <Loader message="Fetching your interview schedules..." />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Upcoming Interview Rounds
        </h2>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Join scheduled online video assessments, review recruiter notes, and prepare for upcoming evaluations.
        </p>
      </div>

      {interviews.length === 0 ? (
        <EmptyState
          title="No Interviews Currently Scheduled"
          description="When an industry recruiter shortlists your application and schedules an interview round, it will appear here."
          actionLabel="View My Applications"
          onAction={() => window.location.href = '/student/applications'}
          icon={Calendar}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {interviews.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card flex flex-col justify-between gap-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-extrabold text-xs">
                    Round {item.roundNumber}: {item.roundName}
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    {item.companyName}
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-slate-900">
                  {item.internshipRole}
                </h3>

                <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-100/80 text-xs space-y-1.5">
                  <p className="font-bold text-indigo-950 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-indigo-600" />
                    {new Date(item.scheduledDate).toLocaleString()}
                  </p>
                  <p className="text-slate-600">
                    <b>Mode:</b> {item.interviewMode?.replace('ONLINE_', '').replace('_', ' ') || 'Google Meet'}
                  </p>
                  {item.venue && (
                    <p className="text-slate-600">
                      <b>Venue:</b> {item.venue}
                    </p>
                  )}
                </div>

                {item.instructions && (
                  <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 italic">
                    "{item.instructions}"
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <Link
                  to="/student/applications"
                  className="text-xs font-bold text-slate-600 hover:text-indigo-600"
                >
                  View Timeline
                </Link>

                {item.meetingLink && (
                  <a
                    href={item.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 transition-all"
                  >
                    <Video className="w-4 h-4" />
                    <span>Join Meeting Room</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
