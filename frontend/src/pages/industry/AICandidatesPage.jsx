import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { Loader } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';
import { AICandidateCard } from '../../components/industry/AICandidateCard';
import { RoundScheduleModal } from '../../components/industry/RoundScheduleModal';
import { Sparkles, Brain, Briefcase, Filter, CheckCircle2 } from 'lucide-react';

export const AICandidatesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [internships, setInternships] = useState([]);
  const [selectedInternshipId, setSelectedInternshipId] = useState(searchParams.get('internshipId') || '');
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInternshipData, setSelectedInternshipData] = useState(null);

  // Active candidate for modal
  const [activeApplication, setActiveApplication] = useState(null);

  useEffect(() => {
    const fetchInternships = async () => {
      try {
        const res = await api.get('/industry/internships');
        if (res.data.success) {
          const list = res.data.internships || [];
          setInternships(list);
          if (list.length > 0 && !selectedInternshipId) {
            setSelectedInternshipId(list[0]._id);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchInternships();
  }, []);

  useEffect(() => {
    if (!selectedInternshipId) return;

    const fetchAICandidates = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/industry/ai-candidates/${selectedInternshipId}`);
        if (res.data.success) {
          setCandidates(res.data.candidates || []);
          setSelectedInternshipData(res.data.internship);
        }
      } catch (err) {
        console.error('Error fetching AI candidates:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAICandidates();
  }, [selectedInternshipId]);

  const handleSelectRound = (cand) => {
    // Construct mock/real application object for modal
    const mockApp = {
      _id: cand.applicationId || cand.student._id,
      student: cand.student,
      internship: selectedInternshipData,
      matchScore: cand.matchPercentage,
      status: cand.applicationStatus || 'SHORTLISTED',
      activeRoundNumber: 1,
      rounds: [],
    };
    setActiveApplication(mockApp);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-900 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 text-amber-300 text-xs font-bold border border-amber-400/20">
            <Brain className="w-3.5 h-3.5 text-amber-400" />
            <span>AI Reverse Candidate Matching Engine</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            AI Recommended Candidate Pool
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-xl">
            Our TF-IDF and NLP semantic engine ranks all qualified student candidates based on your requisition's required skills, experience criteria, and project domain.
          </p>
        </div>

        {/* Requisition Dropdown */}
        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 min-w-[240px]">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
            Select Internship Requisition:
          </label>
          <select
            value={selectedInternshipId}
            onChange={(e) => setSelectedInternshipId(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white text-slate-900 font-bold text-xs focus:outline-none"
          >
            {internships.map((job) => (
              <option key={job._id} value={job._id}>
                {job.role}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Candidates Grid */}
      {loading ? (
        <Loader message="Running TF-IDF multi-factor candidate matching..." />
      ) : candidates.length === 0 ? (
        <EmptyState
          title="No Candidates Found"
          description="Create more internship requisitions or check back as more students complete their profiles."
        />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600 animate-pulse" />
              Top Ranked Candidates ({candidates.length})
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              Ranked by Multi-Factor Cosine & Skill Match
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {candidates.map((candidate, idx) => (
              <AICandidateCard
                key={candidate.student._id || idx}
                candidate={candidate}
                onSelectRound={handleSelectRound}
                internshipId={selectedInternshipId}
              />
            ))}
          </div>
        </div>
      )}

      {/* Stage Advance Modal */}
      {activeApplication && (
        <RoundScheduleModal
          isOpen={!!activeApplication}
          onClose={() => setActiveApplication(null)}
          application={activeApplication}
          onStatusUpdated={() => {
            alert('Candidate updated');
            setActiveApplication(null);
          }}
        />
      )}

    </div>
  );
};
