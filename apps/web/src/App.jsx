import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import RequireOnboarding from './components/RequireOnboarding.jsx';
import AppLayout from './layouts/AppLayout.jsx';
import InterviewLayout from './layouts/InterviewLayout.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import SessionsPage from './pages/SessionsPage.jsx';
import InsightsPage from './pages/InsightsPage.jsx';
import HomePage from './pages/HomePage.jsx';
import InterviewReportPage from './pages/InterviewReportPage.jsx';
import InterviewPocPage from './pages/InterviewPocPage.jsx';
import InterviewDemoPage from './pages/InterviewDemoPage.jsx';
import InterviewLivePage from './pages/InterviewLivePage.jsx';
import InterviewLobbyPage from './pages/InterviewLobbyPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import NewInterviewPage from './pages/NewInterviewPage.jsx';
import OnboardingPage from './pages/OnboardingPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import PricingPage from './pages/PricingPage.jsx';
import SetupPage from './pages/SetupPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import { isDevToolsEnabled } from './lib/dev.js';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/setup" element={<SetupPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/onboarding" element={<OnboardingPage />} />

            <Route element={<RequireOnboarding />}>
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/sessions" element={<SessionsPage />} />
                <Route path="/insights" element={<InsightsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/interview/new" element={<NewInterviewPage />} />
                {isDevToolsEnabled ? (
                  <Route path="/interview/poc" element={<InterviewPocPage />} />
                ) : null}
                <Route path="/interview/:id/report" element={<InterviewReportPage />} />
              </Route>

              <Route element={<InterviewLayout />}>
                {isDevToolsEnabled ? (
                  <Route path="/interview/demo" element={<InterviewDemoPage />} />
                ) : null}
                <Route path="/interview/:id/lobby" element={<InterviewLobbyPage />} />
                <Route path="/interview/:id/live" element={<InterviewLivePage />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
