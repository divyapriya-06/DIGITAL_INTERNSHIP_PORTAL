import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { SocketProvider } from './context/SocketContext';
import { MainLayout } from './components/layout/MainLayout';
import { ErrorBoundary } from './components/common/ErrorBoundary';

// Pages
import { LandingPage } from './pages/LandingPage';
import { SettingsPage } from './pages/SettingsPage';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { FindInternships } from './pages/student/FindInternships';
import { RecommendedInternships } from './pages/student/RecommendedInternships';
import { StudentApplications } from './pages/student/StudentApplications';
import { UpcomingRounds } from './pages/student/UpcomingRounds';
import { SkillDemandPage } from './pages/student/SkillDemandPage';
import { StudentProfilePage } from './pages/student/StudentProfilePage';
import { CompleteProfilePage } from './pages/student/CompleteProfilePage';
import { StudentReviewsPage } from './pages/student/StudentReviewsPage';
import { StudentNotificationsPage } from './pages/student/StudentNotificationsPage';

// Industry Pages
import { IndustryDashboard } from './pages/industry/IndustryDashboard';
import { CompanyProfilePage } from './pages/industry/CompanyProfilePage';
import { VerificationPage } from './pages/industry/VerificationPage';
import { PostInternshipPage } from './pages/industry/PostInternshipPage';
import { MyInternshipsPage } from './pages/industry/MyInternshipsPage';
import { IndustryApplicationsPage } from './pages/industry/IndustryApplicationsPage';
import { AICandidatesPage } from './pages/industry/AICandidatesPage';
import { RecruitmentRoundsPage } from './pages/industry/RecruitmentRoundsPage';
import { IndustryAnalyticsPage } from './pages/industry/IndustryAnalyticsPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminVerificationRequests } from './pages/admin/AdminVerificationRequests';
import { AdminStudentsPage } from './pages/admin/AdminStudentsPage';
import { AdminIndustriesPage } from './pages/admin/AdminIndustriesPage';
import { AdminInternshipsPage } from './pages/admin/AdminInternshipsPage';
import { AdminApplicationsPage } from './pages/admin/AdminApplicationsPage';
import { AdminAnalyticsPage } from './pages/admin/AdminAnalyticsPage';
import { AdminSkillDemandPage } from './pages/admin/AdminSkillDemandPage';
import { AdminDuplicateAccountsPage } from './pages/admin/AdminDuplicateAccountsPage';
import { AdminFeedbackPage } from './pages/admin/AdminFeedbackPage';

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-bold text-xs">
        Validating session credentials...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to proper role dashboard
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'industry') return <Navigate to="/industry/dashboard" replace />;
    return <Navigate to="/student/dashboard" replace />;
  }

  return children;
};

export function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <SocketProvider>
          <BrowserRouter>
            <ErrorBoundary>
              <Routes>
                {/* Public Split Landing Page */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LandingPage />} />

                {/* Protected App Layout */}
                <Route
                  element={
                    <ProtectedRoute>
                      <MainLayout />
                    </ProtectedRoute>
                  }
                >
                  {/* Common Settings */}
                  <Route path="/settings" element={<SettingsPage />} />

                  {/* STUDENT ROUTES */}
                  <Route
                    path="/student/dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['student']}>
                        <StudentDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/student/find"
                    element={
                      <ProtectedRoute allowedRoles={['student']}>
                        <FindInternships />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/student/recommended"
                    element={
                      <ProtectedRoute allowedRoles={['student']}>
                        <RecommendedInternships />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/student/applications"
                    element={
                      <ProtectedRoute allowedRoles={['student']}>
                        <StudentApplications />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/student/upcoming-rounds"
                    element={
                      <ProtectedRoute allowedRoles={['student']}>
                        <UpcomingRounds />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/student/skill-demand"
                    element={
                      <ProtectedRoute allowedRoles={['student']}>
                        <SkillDemandPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/student/profile"
                    element={
                      <ProtectedRoute allowedRoles={['student']}>
                        <StudentProfilePage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/student/resume"
                    element={<Navigate to="/student/profile" replace />}
                  />
                  <Route
                    path="/student/reviews"
                    element={
                      <ProtectedRoute allowedRoles={['student']}>
                        <StudentReviewsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/student/complete-profile"
                    element={
                      <ProtectedRoute allowedRoles={['student']}>
                        <CompleteProfilePage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/student/notifications"
                    element={
                      <ProtectedRoute allowedRoles={['student']}>
                        <StudentNotificationsPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* INDUSTRY ROUTES */}
                  <Route
                    path="/industry/dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['industry']}>
                        <IndustryDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/industry/profile"
                    element={
                      <ProtectedRoute allowedRoles={['industry']}>
                        <CompanyProfilePage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/industry/verification"
                    element={
                      <ProtectedRoute allowedRoles={['industry']}>
                        <VerificationPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/industry/post"
                    element={
                      <ProtectedRoute allowedRoles={['industry']}>
                        <PostInternshipPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/industry/internships"
                    element={
                      <ProtectedRoute allowedRoles={['industry']}>
                        <MyInternshipsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/industry/applications"
                    element={
                      <ProtectedRoute allowedRoles={['industry']}>
                        <IndustryApplicationsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/industry/ai-candidates"
                    element={
                      <ProtectedRoute allowedRoles={['industry']}>
                        <AICandidatesPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/industry/rounds"
                    element={
                      <ProtectedRoute allowedRoles={['industry']}>
                        <RecruitmentRoundsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/industry/analytics"
                    element={
                      <ProtectedRoute allowedRoles={['industry']}>
                        <IndustryAnalyticsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/industry/notifications"
                    element={
                      <ProtectedRoute allowedRoles={['industry']}>
                        <IndustryApplicationsPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* ADMIN ROUTES */}
                  <Route
                    path="/admin/dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/students"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminStudentsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/industries"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminIndustriesPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/verifications"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminVerificationRequests />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/internships"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminInternshipsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/applications"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminApplicationsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/analytics"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminAnalyticsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/skill-demand"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminSkillDemandPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/feedback"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminFeedbackPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/duplicates"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminDuplicateAccountsPage />
                      </ProtectedRoute>
                    }
                  />
                </Route>

                {/* 404 Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </ErrorBoundary>
          </BrowserRouter>
        </SocketProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
