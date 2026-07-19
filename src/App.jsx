import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Loader from './components/Loader';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import WorkoutSchedule from './pages/WorkoutSchedule';
import Matches from './pages/Matches';
import PartnerRequests from './pages/PartnerRequests';
import Connections from './pages/Connections';
import LookingToday from './pages/LookingToday';
import Chat from './pages/Chat';
import PrivacySettings from './pages/PrivacySettings';
import Settings from './pages/Settings';

// Layout
import AppLayout from './layouts/AppLayout';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <Loader fullScreen />;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <Loader fullScreen />;
  return !isAuthenticated ? children : <Navigate to="/" replace />;
};

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
              
              {/* Protected Routes wrapped in Layout */}
              <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                <Route index element={<Dashboard />} />
                <Route path="profile" element={<Profile />} />
                <Route path="schedule" element={<WorkoutSchedule />} />
                <Route path="matches" element={<Matches />} />
                <Route path="requests" element={<PartnerRequests />} />
                <Route path="connections" element={<Connections />} />
                <Route path="looking-today" element={<LookingToday />} />
                <Route path="chat" element={<Chat />} />
                <Route path="privacy-settings" element={<PrivacySettings />} />
                <Route path="settings" element={<Settings />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
