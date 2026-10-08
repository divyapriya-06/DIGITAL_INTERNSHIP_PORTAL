import React from 'react';
import { Link } from 'react-router-dom';
import { StudentProfilePage } from './StudentProfilePage';
import { Sparkles, ArrowRight } from 'lucide-react';

export const CompleteProfilePage = () => {
  return (
    <div className="space-y-6">
      <div className="p-5 rounded-2xl bg-indigo-50 border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-600 text-white shrink-0 shadow-md shadow-indigo-200">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-indigo-950">
              Complete Your Student Profile
            </h3>
            <p className="text-xs text-indigo-700 mt-0.5">
              Fill in your academic standing and upload your resume. Our NLP AI engine uses this to calculate match rankings.
            </p>
          </div>
        </div>

        <Link
          to="/student/dashboard"
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 transition-all flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
        >
          <span>Go to Dashboard</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <StudentProfilePage />
    </div>
  );
};
