import React, { useState } from 'react';
import { Search, Ban, CheckCircle, AlertTriangle } from 'lucide-react';
import { adminService } from '../../services/admin.service';
import type { User } from '../../types';
import { formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';

const UserManagement: React.FC = () => {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await adminService.searchUsers(query);
      if (res.success) setUsers(res.data);
    } catch {
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleBan = async (user: User) => {
    const action = user.isBanned ? 'unban' : 'ban';
    if (!confirm(`${action === 'ban' ? 'Ban' : 'Unban'} ${user.name}?`)) return;
    try {
      const res = user.isBanned
        ? await adminService.unbanUser(user._id)
        : await adminService.banUser(user._id);
      if (res.success) {
        setUsers(prev => prev.map(u => u._id === user._id ? res.data : u));
        toast.success(`User ${action}ned successfully`);
      }
    } catch {
      toast.error('Action failed');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Search by email or phone number..."
            style={{
              width: '100%', padding: '12px 14px 12px 38px',
              borderRadius: 10, border: '1.5px solid var(--border-color)',
              background: 'var(--bg-secondary)', color: 'var(--text-primary)',
              fontFamily: "'Neuton', serif", fontSize: 14, outline: 'none',
            }}
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={loading}
          style={{
            padding: '12px 20px', borderRadius: 10,
            background: '#4F252E', color: '#FFF7C5',
            border: 'none', cursor: 'pointer',
            fontFamily: "'Archivo Black', sans-serif", fontSize: 14,
          }}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {searched && users.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontFamily: "'Neuton', serif" }}>
          No users found for "{query}"
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {users.map(user => (
          <div key={user._id} style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 12, padding: '16px 20px',
            display: 'flex', alignItems: 'center', gap: 16,
            opacity: user.isBanned ? 0.7 : 1,
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: user.isBanned ? '#ef444422' : '#4F252E22',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'Archivo Black', sans-serif", fontSize: 16,
              color: user.isBanned ? '#ef4444' : '#4F252E',
              flexShrink: 0,
            }}>
              {user.name?.charAt(0)}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                <span style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                  {user.name}
                </span>
                {user.isBanned && (
                  <span style={{
                    background: '#ef444422', color: '#ef4444',
                    padding: '2px 8px', borderRadius: 99,
                    fontFamily: "'Neuton', serif", fontSize: 11,
                  }}>
                    BANNED
                  </span>
                )}
                <span style={{
                  background: '#4F252E18', color: '#4F252E',
                  padding: '2px 8px', borderRadius: 99,
                  fontFamily: "'Neuton', serif", fontSize: 11, textTransform: 'capitalize',
                }}>
                  {user.role}
                </span>
              </div>
              <div style={{ fontFamily: "'Neuton', serif", fontSize: 13, color: 'var(--text-muted)' }}>
                {user.email || user.phone} • Joined {formatDate(user.createdAt)}
              </div>
            </div>

            <button
              onClick={() => handleBan(user)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 14px', borderRadius: 8,
                border: '1.5px solid',
                borderColor: user.isBanned ? '#22c55e' : '#ef4444',
                background: 'transparent',
                color: user.isBanned ? '#22c55e' : '#ef4444',
                cursor: 'pointer', fontFamily: "'Neuton', serif", fontSize: 13,
              }}
            >
              {user.isBanned ? <><CheckCircle size={14} /> Unban</> : <><Ban size={14} /> Ban</>}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserManagement;