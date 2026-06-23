import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import LoadingScreen from './components/ui/LoadingScreen';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import ListingDetailPage from './pages/ListingDetailPage';
import MyListings from './pages/MyListings';
import ChatPage from './pages/ChatPage';
import AdminPage from './pages/AdminPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean }> = ({
  children, adminOnly = false,
}) => {
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
      <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Landing />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/listing/:id" element={<ListingDetailPage />} />
      <Route path="/my-listings" element={<ProtectedRoute><MyListings /></ProtectedRoute>} />
      <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  const [appReady, setAppReady] = useState(false);

  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          {!appReady && <LoadingScreen onComplete={() => setAppReady(true)} />}
          <div style={{ opacity: appReady ? 1 : 0, transition: 'opacity 0.4s ease' }}>
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </div>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                fontFamily: "'Neuton', serif",
                fontSize: 14,
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: 12,
              },
              success: { iconTheme: { primary: '#4F252E', secondary: '#FFF7C5' } },
            }}
          />
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;