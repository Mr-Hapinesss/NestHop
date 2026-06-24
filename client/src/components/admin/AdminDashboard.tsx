import React, { useState, useEffect } from 'react';
import { Users, Building2, Ticket, UserPlus, RefreshCw, TrendingUp } from 'lucide-react';
import { adminService } from '../../services/admin.service';
import UserManagement from './UserManagement';
import ContentModeration from './ContentModeration';
import SupportPanel from './SupportPanel';
import type { AdminMetrics } from '../../types';
import { toast } from '../ui/Toast';

type Tab = 'users' | 'listings' | 'tickets' | 'create-admin';

const AdminDashboard: React.FC = () => {
  const [tab, setTab] = useState<Tab>('users');
  const [metrics, setMetrics] = useState<AdminMetrics>({ totalUsers: 0, totalLandlords: 0, totalListings: 0, openTickets: 0 });
  const [loading, setLoading] = useState(true);
  const [newAdmin, setNewAdmin] = useState({ name: '', contact: '', contactType: 'email' as 'email' | 'phone' });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    adminService.getMetrics()
      .then(r => { if (r.success) setMetrics(r.data); })
      .catch(() => toast.error('Failed to load metrics'))
      .finally(() => setLoading(false));
  }, []);

  const handleCreateAdmin = async () => {
    if (!newAdmin.name || !newAdmin.contact) { toast.error('Fill all fields'); return; }
    setCreating(true);
    try {
      const r = await adminService.createAdmin(newAdmin);
      if (r.success) {
        toast.success(`Admin "${r.data.name}" created. OTP sent.`);
        setNewAdmin({ name: '', contact: '', contactType: 'email' });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create admin');
    } finally {
      setCreating(false);
    }
  };

  const cards = [
    { label: 'Total Users',   value: metrics.totalUsers,    icon: Users,     color: '#4F252E' },
    { label: 'Landlords',     value: metrics.totalLandlords, icon: TrendingUp, color: '#c4902a' },
    { label: 'Listings',      value: metrics.totalListings,  icon: Building2,  color: '#0ea5e9' },
    { label: 'Open Tickets',  value: metrics.openTickets,   icon: Ticket,     color: '#ef4444' },
  ];

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'users',        label: 'Users',    icon: Users },
    { key: 'listings',     label: 'Listings', icon: Building2 },
    { key: 'tickets',      label: 'Support',  icon: Ticket },
    { key: 'create-admin', label: 'Add Admin',icon: UserPlus },
  ];

  const inp: React.CSSProperties = {
    width: '100%', padding: '12px 14px', borderRadius: 10,
    border: '1.5px solid var(--border-color)',
    background: 'var(--bg-secondary)', color: 'var(--text-primary)',
    fontFamily: "'Neuton', serif", fontSize: 14, outline: 'none',
  };

  return (
    <div>
      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 16, marginBottom: 28 }}>
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} style={{
            background: 'var(--bg-card)', border: '1px solid var(--border-color)',
            borderRadius: 16, padding: '20px 22px',
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <div style={{ width: 46, height: 46, borderRadius: 12, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={21} color={color} />
            </div>
            <div>
              {loading
                ? <div style={{ width: 44, height: 26, borderRadius: 6, background: 'var(--bg-secondary)' }} />
                : <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: 24, color: 'var(--text-primary)', lineHeight: 1 }}>{value.toLocaleString()}</div>
              }
              <div style={{ fontFamily: "'Neuton', serif", fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: 'var(--bg-secondary)', padding: 4, borderRadius: 12, marginBottom: 24, overflowX: 'auto' }}>
        {tabs.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '9px 16px', borderRadius: 9, border: 'none',
            background: tab === key ? 'var(--bg-card)' : 'transparent',
            color: tab === key ? '#4F252E' : 'var(--text-secondary)',
            cursor: 'pointer', fontFamily: "'Neuton', serif", fontSize: 14,
            fontWeight: tab === key ? 700 : 400,
            boxShadow: tab === key ? '0 1px 6px rgba(0,0,0,0.08)' : 'none',
            transition: 'all 0.15s', whiteSpace: 'nowrap',
          }}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === 'users'    && <UserManagement />}
      {tab === 'listings' && <ContentModeration />}
      {tab === 'tickets'  && <SupportPanel />}
      {tab === 'create-admin' && (
        <div style={{ maxWidth: 460 }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 18, padding: 28 }}>
            <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 19, color: 'var(--text-primary)', marginBottom: 8 }}>
              Create Admin Account
            </h2>
            <p style={{ fontFamily: "'Neuton', serif", fontSize: 14, color: 'var(--text-secondary)', marginBottom: 22, lineHeight: 1.6 }}>
              Only verified admins can create new admin accounts. The new admin will verify via OTP on first sign-in.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <input value={newAdmin.name} onChange={e => setNewAdmin(p => ({ ...p, name: e.target.value }))} placeholder="Full Name" style={inp} />
              <div style={{ display: 'flex', gap: 10 }}>
                <select value={newAdmin.contactType} onChange={e => setNewAdmin(p => ({ ...p, contactType: e.target.value as any }))} style={{ ...inp, width: 'auto' }}>
                  <option value="email">Email</option>
                  <option value="phone">Phone</option>
                </select>
                <input value={newAdmin.contact} onChange={e => setNewAdmin(p => ({ ...p, contact: e.target.value }))} placeholder={newAdmin.contactType === 'email' ? 'admin@domain.com' : '+254700000000'} style={{ ...inp }} />
              </div>
              <button onClick={handleCreateAdmin} disabled={creating} style={{
                padding: '13px', borderRadius: 10, border: 'none',
                background: creating ? '#ccc' : '#4F252E',
                color: '#FFF7C5', cursor: creating ? 'not-allowed' : 'pointer',
                fontFamily: "'Archivo Black', sans-serif", fontSize: 14,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>
                <UserPlus size={15} />
                {creating ? 'Creating...' : 'Create Admin Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;