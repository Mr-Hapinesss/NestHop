import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Home, Search, MessageCircle, PlusSquare, Shield,
  HelpCircle, Phone, Moon, Sun, Monitor, X, LogOut,
  Building2, Ticket
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Logo from './Logo';
import SupportForm from '../support/SupportForm';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [showSupport, setShowSupport] = useState(false);

  const go = (path: string) => {
    navigate(path);
    onClose();
  };

  const navItems = [
    { icon: Home, label: 'Discover Homes', path: '/dashboard', roles: ['tenant', 'landlord', 'admin'] },
    { icon: Building2, label: 'My Listings', path: '/my-listings', roles: ['landlord', 'admin'] },
    { icon: PlusSquare, label: 'Add Listing', path: '/my-listings?create=true', roles: ['landlord', 'admin'] },
    { icon: MessageCircle, label: 'Messages', path: '/chat', roles: ['tenant', 'landlord', 'admin'] },
    { icon: Shield, label: 'Admin Panel', path: '/admin', roles: ['admin'] },
  ];

  const visible = navItems.filter(i => !user || i.roles.includes(user.role));

  return (
    <>
      {/* Overlay */}
      <div
        className={`sidebar-overlay ${isOpen ? 'active' : ''}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <aside className={`sidebar-drawer ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,247,197,0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Logo variant="light" size="sm" />
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,247,197,0.15)',
                border: 'none',
                borderRadius: 8,
                padding: 8,
                color: '#FFF7C5',
                cursor: 'pointer',
              }}
            >
              <X size={18} />
            </button>
          </div>

          {user && (
            <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                background: 'rgba(255,247,197,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: "'Archivo Black', sans-serif", fontSize: 16, color: '#FFF7C5',
              }}>
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: 14, color: '#FFF7C5' }}>
                  {user.name}
                </div>
                <div style={{ fontFamily: "'Neuton', serif", fontSize: 12, color: 'rgba(255,247,197,0.6)', textTransform: 'capitalize' }}>
                  {user.role}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav style={{ padding: '16px 12px' }}>
          <div style={{ fontFamily: "'Neuton', serif", fontSize: 11, color: 'rgba(255,247,197,0.45)', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0 8px 8px' }}>
            Navigation
          </div>
          {visible.map(item => (
            <button
              key={item.path}
              onClick={() => go(item.path)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 12px', borderRadius: 10, border: 'none',
                background: 'transparent', color: '#FFF7C5', cursor: 'pointer',
                fontFamily: "'Neuton', serif", fontSize: 15, textAlign: 'left',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,247,197,0.12)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <item.icon size={18} style={{ opacity: 0.8 }} />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Theme */}
        <div style={{ padding: '0 12px 16px', borderTop: '1px solid rgba(255,247,197,0.1)', marginTop: 8, paddingTop: 16 }}>
          <div style={{ fontFamily: "'Neuton', serif", fontSize: 11, color: 'rgba(255,247,197,0.45)', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0 8px 8px' }}>
            Theme
          </div>
          <div style={{ display: 'flex', gap: 8, padding: '0 8px' }}>
            {([['light', Sun, 'Light'], ['dark', Moon, 'Dark'], ['system', Monitor, 'Auto']] as const).map(
              ([t, Icon, label]) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  style={{
                    flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                    padding: '10px 6px', borderRadius: 10, border: '1px solid',
                    borderColor: theme === t ? '#FFF7C5' : 'rgba(255,247,197,0.2)',
                    background: theme === t ? 'rgba(255,247,197,0.15)' : 'transparent',
                    color: '#FFF7C5', cursor: 'pointer', transition: 'all 0.2s',
                  }}
                >
                  <Icon size={16} />
                  <span style={{ fontSize: 10, fontFamily: "'Neuton', serif" }}>{label}</span>
                </button>
              )
            )}
          </div>
        </div>

        {/* Support */}
        <div style={{ padding: '0 12px 16px' }}>
          <div style={{ fontFamily: "'Neuton', serif", fontSize: 11, color: 'rgba(255,247,197,0.45)', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0 8px 8px' }}>
            Help & Support
          </div>
          <button
            onClick={() => setShowSupport(!showSupport)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 12px', borderRadius: 10, border: 'none',
              background: showSupport ? 'rgba(255,247,197,0.12)' : 'transparent',
              color: '#FFF7C5', cursor: 'pointer',
              fontFamily: "'Neuton', serif", fontSize: 15, textAlign: 'left',
            }}
          >
            <HelpCircle size={18} style={{ opacity: 0.8 }} />
            Contact Support
          </button>

          {showSupport && (
            <div style={{ marginTop: 8, padding: '0 8px' }}>
              <SupportForm onSuccess={() => setShowSupport(false)} compact />
            </div>
          )}
        </div>

        {/* Logout */}
        {user && (
          <div style={{ padding: '0 12px 24px', marginTop: 'auto' }}>
            <button
              onClick={() => { logout(); onClose(); navigate('/'); }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 12px', borderRadius: 10, border: '1px solid rgba(255,247,197,0.2)',
                background: 'transparent', color: 'rgba(255,247,197,0.7)', cursor: 'pointer',
                fontFamily: "'Neuton', serif", fontSize: 15, textAlign: 'left',
                transition: 'all 0.2s',
              }}
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;