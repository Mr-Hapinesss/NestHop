import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import Logo from '../components/ui/Logo';
import ListingGrid from '../components/listings/ListingGrid';
import Sidebar from '../components/ui/Sidebar';
import ThemeToggle from '../components/ui/ThemeToggle';
import { useAuth } from '../context/AuthContext';

const Dashboard: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Topbar */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 30,
        background: 'var(--bg-primary)',
        borderBottom: '1px solid var(--border-color)',
        padding: '0 24px', height: 64,
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', padding: 6 }}>
          <Menu size={22} />
        </button>
        <Logo size="sm" />
        <div style={{ flex: 1 }} />
        <ThemeToggle />
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: '#4F252E',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Archivo Black', sans-serif", fontSize: 14, color: '#FFF7C5',
          cursor: 'pointer',
        }}>
          {user?.name?.charAt(0)}
        </div>
      </header>

      {/* Page header */}
      <div style={{ padding: '32px 24px 20px', maxWidth: 1200, margin: '0 auto' }}>
        <h1 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: 28, color: 'var(--text-primary)', marginBottom: 4 }}>
          Discover Homes
        </h1>
        <p style={{ fontFamily: "'Neuton', serif", fontSize: 15, color: 'var(--text-secondary)' }}>
          Browse verified rental listings across Kenya
        </p>
      </div>

      {/* Grid */}
      <div style={{ padding: '0 24px 48px', maxWidth: 1200, margin: '0 auto' }}>
        <ListingGrid />
      </div>
    </div>
  );
};

export default Dashboard;