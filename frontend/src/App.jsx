import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import NewRequestPage from './pages/NewRequestPage';
import MyRequestsPage from './pages/MyRequestsPage';
import ApprovalsPage from './pages/ApprovalsPage';
import TrackingPage from './pages/TrackingPage';
import EscalationsPage from './pages/EscalationsPage';
import FeedbackPage from './pages/FeedbackPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ProfilePage from './pages/ProfilePage';
import NotificationsPage from './pages/NotificationsPage';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="auth-container">
      <div className="animated-bg"></div>
      <div style={{ textAlign: 'center', color: 'var(--neutral-400)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
        <div className="spinner" style={{ width: 28, height: 28, borderWidth: 3 }}></div>
        Loading...
      </div>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AuthRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

function AuthPages() {
  const [view, setView] = useState('login');
  if (view === 'register') return <RegisterPage onSwitchToLogin={() => setView('login')} />;
  return <LoginPage onSwitchToRegister={() => setView('register')} />;
}

function LandingRoute() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return <LandingPage onGetStarted={() => navigate('/login')} />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Landing Page */}
      <Route path="/" element={<LandingRoute />} />

      {/* Auth */}
      <Route path="/login" element={<AuthRoute><AuthPages /></AuthRoute>} />

      {/* Protected — Layout with Sidebar */}
      <Route path="/" element={<ProtectedRoute><DataProvider><Layout /></DataProvider></ProtectedRoute>}>
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="new-request" element={<NewRequestPage />} />
        <Route path="my-requests" element={<MyRequestsPage />} />
        <Route path="approvals" element={<ApprovalsPage />} />
        <Route path="tracking" element={<TrackingPage />} />
        <Route path="escalations" element={<EscalationsPage />} />
        <Route path="feedback" element={<FeedbackPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="notifications" element={<NotificationsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
