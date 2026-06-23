import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';
import type { SupportTicket } from '../../types';
import { formatDate } from '../../utils/helpers';
import { Ticket, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const statusConfig = {
  open: { color: '#ef4444', bg: '#ef444418', label: 'Open', icon: AlertCircle },
  in_progress: { color: '#f59e0b', bg: '#f59e0b18', label: 'In Progress', icon: Clock },
  resolved: { color: '#22c55e', bg: '#22c55e18', label: 'Resolved', icon: CheckCircle },
};

const SupportPanel: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [filter, setFilter] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await adminService.getTickets(filter || undefined);
      if (res.success) setTickets(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTickets(); }, [filter]);

  const updateStatus = async (id: string, status: SupportTicket['status']) => {
    try {
      const res = await adminService.updateTicketStatus(id, status);
      if (res.success) {
        setTickets(prev => prev.map(t => t._id === id ? res.data : t));
        toast.success('Ticket updated');
      }
    } catch {
      toast.error('Update failed');
    }
  };

  return (
    <div>
      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[['', 'All'], ['open', 'Open'], ['in_progress', 'In Progress'], ['resolved', 'Resolved']].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setFilter(val as string)}
            style={{
              padding: '8px 16px', borderRadius: 99,
              border: '1.5px solid',
              borderColor: filter === val ? '#4F252E' : 'var(--border-color)',
              background: filter === val ? '#4F252E' : 'transparent',
              color: filter === val ? '#FFF7C5' : 'var(--text-secondary)',
              cursor: 'pointer', fontFamily: "'Neuton', serif", fontSize: 13,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ height: 80, borderRadius: 12, background: 'var(--bg-secondary)', animation: 'pulse-soft 1.5s ease infinite' }} />
          ))}
        </div>
      ) : tickets.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Ticket size={40} style={{ color: 'var(--text-muted)', marginBottom: 12 }} />
          <p style={{ fontFamily: "'Neuton', serif", color: 'var(--text-muted)' }}>No tickets found</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {tickets.map(ticket => {
            const cfg = statusConfig[ticket.status];
            const Icon = cfg.icon;
            return (
              <div key={ticket._id} style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 12, padding: 20,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      background: cfg.bg, color: cfg.color,
                      padding: '3px 10px', borderRadius: 99,
                      fontFamily: "'Neuton', serif", fontSize: 12,
                      display: 'flex', alignItems: 'center', gap: 4,
                    }}>
                      <Icon size={11} /> {cfg.label}
                    </span>
                    <span style={{ fontFamily: "'Neuton', serif", fontSize: 12, color: 'var(--text-muted)' }}>
                      {formatDate(ticket.createdAt)}
                    </span>
                  </div>

                  {/* Status changer */}
                  <select
                    value={ticket.status}
                    onChange={e => updateStatus(ticket._id, e.target.value as SupportTicket['status'])}
                    style={{
                      padding: '4px 8px', borderRadius: 8,
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-secondary)', color: 'var(--text-primary)',
                      fontFamily: "'Neuton', serif", fontSize: 12, cursor: 'pointer',
                    }}
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>

                <div style={{ fontFamily: "'Neuton', serif", fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  <strong style={{ color: 'var(--text-primary)' }}>Contact:</strong> {ticket.contact}
                </div>
                <div style={{ fontFamily: "'Neuton', serif", fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.5 }}>
                  {ticket.message}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SupportPanel;