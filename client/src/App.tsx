import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ToastContainer } from './components/ui/Toast';
import LoadingScreen from './components/ui/LoadingScreen';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import ListingDetailPage from './pages/ListingDetailPage';
import MyListings from './pages/MyListings';
import ChatPage from './pages/ChatPage';
import AdminPage from './pages/AdminPage';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';


const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean }> = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (adminOnly && user?.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();
  return (
    <Routes>
      <Route path="/"           element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Landing />} />
      <Route path="/dashboard"  element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/listing/:id" element={<ListingDetailPage />} />
      <Route path="/my-listings" element={<ProtectedRoute><MyListings /></ProtectedRoute>} />
      <Route path="/chat"       element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
      <Route path="/admin"      element={<ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>} />
      <Route path="/signup"     element={<SignupPage />} />
      <Route path="/login"      element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="*"           element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  const [ready, setReady] = useState(false);
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          {!ready && <LoadingScreen onComplete={() => setReady(true)} />}
          <div style={{ opacity: ready ? 1 : 0, transition: 'opacity 0.4s ease' }}>
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </div>
          <ToastContainer />
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;