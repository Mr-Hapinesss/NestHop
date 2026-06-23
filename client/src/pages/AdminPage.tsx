import React, { useState, useEffect } from 'react';
import { Menu, Users, Building2, Ticket, UserPlus, RefreshCw } from 'lucide-react';
import MetricsBar from '../components/admin/MetricsBar';
import UserManagement from '../components/admin/UserManagement';
import ContentModeration from '../components/admin/ContentModeration';
import SupportPanel from '../components/admin/SupportPanel';
import { adminService } from '../services/admin.service';
import type { AdminMetrics } from '../types';
import Logo from '../components/ui/Logo';
import Sidebar from '../components/ui/Sidebar';
import toast from 'react-hot-toast';

type Tab = 'metrics' | 'users' | 'listings' | 'tickets' | 'create-admin';

const AdminPage: React.FC = () => {
  const [tab, setTab] = useState<Tab>('metrics');
  const [metrics, setMetrics] = useState<AdminMetrics>({ totalUsers: 0, totalLandlords: 0, totalListings: 0, openTickets: 0 });
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ name: '', contact: '', contactType: 'email' as const });
  const [creating, setCreating] = useState(false);

  const fetchMetrics = async () => {
    setMetricsLoading(true);
    try {
      const res = await adminService.getMetrics();
      if (res.success) setMetrics(res.data);
    } finally {
      setMetricsLoading(false);
    }
  };

  useEffect(() => { fetchMetrics(); }, []);

  const handleCreateAdmin = async () => {
    if (!newAdmin.name || !newAdmin.contact) { toast.error('Fill all fields'); return; }
    setCreating(true);
    try {
      const res = await adminService.createAdmin(newAdmin);
      if (res.success) {
        toast.success(`Admin account for ${res.data.name} created. They'll receive a verification OTP.`);
        setNewAdmin({ name: '', contact: '', contactType: 'email' });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create admin');
    } finally {
      setCreating(false);
    }
  };

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'metrics', label: 'Overview', icon: RefreshCw },
    { key: 'users', label: 'Users', icon: Users },
    { key: 'listings', label: 'Listings', icon: Building2 },
    { key: 'tickets', label: 'Support', icon: Ticket },
    { key: 'create-admin', label: 'Add Admin', icon: UserPlus },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

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
        <span style={{
          background: '#4F252E18', color: '#4F252E',
          padding: '4px 12px', borderRadius: 99,
          fontFamily: "'Neuton', serif", fontSize: 12,
        }}>
          Admin Panel
        </span>
      </header>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: 28, color: 'var(--text-primary)', marginBottom: 4 }}>
            Administration
          </h1>
          <p style={{ fontFamily: "'Neuton', serif", fontSize: 15, color: 'var(--text-secondary)' }}>
            Platform oversight and moderation
          </p>
        </div>

        {/* Metrics always visible */}
        <MetricsBar metrics={metrics} loading={metricsLoading} />

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'var(--bg-secondary)', padding: 4, borderRadius: 12, overflowX: 'auto' }}>
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '9px 16px', borderRadius: 9, border: 'none',
                background: tab === key ? 'var(--bg-card)' : 'transparent',
                color: tab === key ? '#4F252E' : 'var(--text-secondary)',
                cursor: 'pointer', fontFamily: "'Neuton', serif", fontSize: 14,
                fontWeight: tab === key ? 700 : 400,
                boxShadow: tab === key ? '0 1px 6px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
              }}
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === 'users' && <UserManagement />}
        {tab === 'listings' && <ContentModeration />}
        {tab === 'tickets' && <SupportPanel />}

        {tab === 'create-admin' && (
          <div style={{ maxWidth: 480 }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 20, padding: 28 }}>
              <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 20, color: 'var(--text-primary)', marginBottom: 20 }}>
                Create Admin Account
              </h2>
              <p style={{ fontFamily: "'Neuton', serif", fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>
                Only existing admins can create new admin accounts. The new admin will receive an OTP to verify their identity.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', fontFamily: "'Neuton', serif", marginBottom: 6 }}>Full Name</label>
                  <input
                    value={newAdmin.name}
                    onChange={e => setNewAdmin(p => ({ ...p, name: e.target.value }))}
                    placeholder="Admin Name"
                    style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontFamily: "'Neuton', serif", fontSize: 14, outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', fontFamily: "'Neuton', serif", marginBottom: 6 }}>Contact</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <select
                      value={newAdmin.contactType}
                      onChange={e => setNewAdmin(p => ({ ...p, contactType: e.target.value as any }))}
                      style={{ padding: '12px', borderRadius: 10, border: '1.5px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontFamily: "'Neuton', serif", fontSize: 14, outline: 'none' }}
                    >
                      <option value="email">Email</option>
                      <option value="phone">Phone</option>
                    </select>
                    <input
                      value={newAdmin.contact}
                      onChange={e => setNewAdmin(p => ({ ...p, contact: e.target.value }))}
                      placeholder={newAdmin.contactType === 'email' ? 'admin@example.com' : '+254700000000'}
                      style={{ flex: 1, padding: '12px 14px', borderRadius: 10, border: '1.5px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontFamily: "'Neuton', serif", fontSize: 14, outline: 'none' }}
                    />
                  </div>
                </div>

                <button
                  onClick={handleCreateAdmin}
                  disabled={creating}
                  style={{
                    padding: '14px', borderRadius: 12,
                    background: creating ? '#ccc' : '#4F252E',
                    color: '#FFF7C5', border: 'none', cursor: creating ? 'not-allowed' : 'pointer',
                    fontFamily: "'Archivo Black', sans-serif", fontSize: 15,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  }}
                >
                  <UserPlus size={16} />
                  {creating ? 'Creating...' : 'Create Admin Account'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;