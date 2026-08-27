import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AppLayout from './layouts/AppLayout.jsx';
import InterviewLayout from './layouts/InterviewLayout.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import HomePage from './pages/HomePage.jsx';
import InterviewReportPage from './pages/InterviewReportPage.jsx';
import InterviewPocPage from './pages/InterviewPocPage.jsx';
import InterviewDemoPage from './pages/InterviewDemoPage.jsx';
import InterviewLivePage from './pages/InterviewLivePage.jsx';
import InterviewLobbyPage from './pages/InterviewLobbyPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import NewInterviewPage from './pages/NewInterviewPage.jsx';
import SetupPage from './pages/SetupPage.jsx';
import SignupPage from './pages/SignupPage.jsx';

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
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/interview/new" element={<NewInterviewPage />} />
              <Route path="/interview/poc" element={<InterviewPocPage />} />
              <Route path="/interview/:id/report" element={<InterviewReportPage />} />
            </Route>

            <Route element={<InterviewLayout />}>
              <Route path="/interview/demo" element={<InterviewDemoPage />} />
              <Route path="/interview/:id/lobby" element={<InterviewLobbyPage />} />
              <Route path="/interview/:id/live" element={<InterviewLivePage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
