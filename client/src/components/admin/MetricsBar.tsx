import React from 'react';
import { Users, Building2, Ticket, UserCheck } from 'lucide-react';
import type { AdminMetrics } from '../../types';

const MetricsBar: React.FC<{ metrics: AdminMetrics; loading: boolean }> = ({ metrics, loading }) => {
  const cards = [
    { label: 'Total Users', value: metrics.totalUsers, icon: Users, color: '#4F252E' },
    { label: 'Landlords', value: metrics.totalLandlords, icon: UserCheck, color: '#c4902a' },
    { label: 'Listings', value: metrics.totalListings, icon: Building2, color: '#0ea5e9' },
    { label: 'Open Tickets', value: metrics.openTickets, icon: Ticket, color: '#ef4444' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 28 }}>
      {cards.map(({ label, value, icon: Icon, color }) => (
        <div key={label} style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 16, padding: '20px 24px',
          display: 'flex', alignItems: 'center', gap: 16,
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: `${color}18`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Icon size={22} color={color} />
          </div>
          <div>
            {loading ? (
              <div style={{ width: 48, height: 28, borderRadius: 6, background: 'var(--bg-secondary)', animation: 'pulse-soft 1.5s ease infinite' }} />
            ) : (
              <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: 26, color: 'var(--text-primary)', lineHeight: 1 }}>
                {value.toLocaleString()}
              </div>
            )}
            <div style={{ fontFamily: "'Neuton', serif", fontSize: 13, color: 'var(--text-muted)', marginTop: 3 }}>
              {label}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MetricsBar;