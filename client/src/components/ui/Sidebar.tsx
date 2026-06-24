import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home, MessageCircle, PlusSquare, Shield,
  HelpCircle, Moon, Sun, Monitor,
  X, LogOut, Building2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Logo from './Logo';
import SupportForm from '../support/SupportForm';

interface Props { isOpen: boolean; onClose: () => void; }

const Sidebar: React.FC<Props> = ({ isOpen, onClose }) => {
  const { user, logout }               = useAuth();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [showSupport, setShowSupport] = useState(false);

  const isDark = resolvedTheme === 'dark';
  const bg      = isDark ? '#FFF7C5' : '#4F252E';
  const text    = isDark ? '#4F252E' : '#FFF7C5';
  const sub     = isDark ? 'rgba(79,37,46,0.5)'   : 'rgba(255,247,197,0.5)';
  const divider = isDark ? 'rgba(79,37,46,0.12)'  : 'rgba(255,247,197,0.12)';
  const hover   = isDark ? 'rgba(79,37,46,0.08)'  : 'rgba(255,247,197,0.1)';
  const active  = isDark ? 'rgba(79,37,46,0.14)'  : 'rgba(255,247,197,0.18)';
  const overlay = isDark ? 'rgba(79,37,46,0.12)'  : 'rgba(255,247,197,0.12)';

  const go = (path: string) => { navigate(path); onClose(); };
  const isActive = (path: string) => location.pathname === path.split('?')[0];

  {/*only shown when logged in*/}
  const navItems = [
    { icon: Home,          label: 'Discover Homes', path: '/dashboard',               roles: ['tenant', 'landlord', 'admin'] },
    { icon: Building2,     label: 'My Listings',    path: '/my-listings',             roles: ['landlord', 'admin'] },
    { icon: PlusSquare,    label: 'Add Listing',    path: '/my-listings?create=true', roles: ['landlord', 'admin'] },
    { icon: MessageCircle, label: 'Messages',       path: '/chat',                    roles: ['tenant', 'landlord', 'admin'] },
    { icon: Shield,        label: 'Admin Panel',    path: '/admin',                   roles: ['admin'] },
  ];

  const visible = user ? navItems.filter(i => i.roles.includes(user.role)) : [];

  const themeOpts = [
    { key: 'light'  as const, label: 'Light', Icon: Sun },
    { key: 'dark'   as const, label: 'Dark',  Icon: Moon },
    { key: 'system' as const, label: 'Auto',  Icon: Monitor },
  ];

  const navBtn = (path: string, icon: React.ElementType, label: string) => {
    const Icon = icon;
    const on   = isActive(path);
    return (
      <button key={path} onClick={() => go(path)} style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 11,
        padding: '11px 12px', borderRadius: 10, border: 'none',
        background: on ? active : 'transparent',
        color: on ? text : sub,
        cursor: 'pointer', fontFamily: "'Neuton', serif", fontSize: 14,
        textAlign: 'left', transition: 'all 0.15s', marginBottom: 2,
      }}
        onMouseEnter={e => { if (!on) { e.currentTarget.style.background = hover; e.currentTarget.style.color = text; } }}
        onMouseLeave={e => { if (!on) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = sub; } }}
      >
        <Icon size={17} />
        {label}
        {on && <div style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: text }} />}
      </button>
    );
  };

  return (
    <>
      {/*backdrop */}
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, zIndex: 40,
        background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
        opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? 'all' : 'none',
        transition: 'opacity 0.3s ease',
      }} />

      {/*drawer */}
      <aside style={{
        position: 'fixed', top: 0, left: 0, zIndex: 50,
        height: '100dvh', width: 300, background: bg,
        transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.4s cubic-bezier(0.16,1,0.3,1)',
        display: 'flex', flexDirection: 'column', overflowY: 'auto',
      }}>

        {/*header*/}
        <div style={{ padding: '22px 18px 18px', borderBottom: `1px solid ${divider}`, flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: user ? 18 : 0 }}>
            <Logo variant={isDark ? 'dark' : 'light'} size="sm" />
            <button onClick={onClose} style={{ background: overlay, border: 'none', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: text }}>
              <X size={16} />
            </button>
          </div>

          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
              <div style={{ width: 42, height: 42, borderRadius: '50%', background: overlay, border: `1.5px solid ${divider}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Archivo Black', sans-serif", fontSize: 15, color: text, flexShrink: 0 }}>
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: 14, color: text }}>{user.name}</div>
                <div style={{ fontFamily: "'Neuton', serif", fontSize: 11, color: sub, textTransform: 'capitalize' }}>{user.role}</div>
              </div>
            </div>
          )}
        </div>

        {/*nav — only when logged in*/}
        {user && visible.length > 0 && (
          <nav style={{ padding: '12px 10px' }}>
            <div style={{ fontFamily: "'Neuton', serif", fontSize: 10, color: sub, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '0 8px 8px' }}>
              Navigation
            </div>
            {visible.map(item => navBtn(item.path, item.icon, item.label))}
          </nav>
        )}

        <div style={{ flex: 1 }} />

        {/*theme picker — always visible */}
        <div style={{ padding: '14px 10px', borderTop: `1px solid ${divider}` }}>
          <div style={{ fontFamily: "'Neuton', serif", fontSize: 10, color: sub, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '0 8px 8px' }}>
            Appearance
          </div>
          <div style={{ display: 'flex', gap: 6, padding: '0 8px' }}>
            {themeOpts.map(({ key, label, Icon }) => (
              <button key={key} onClick={() => setTheme(key)} style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                padding: '9px 4px', borderRadius: 10,
                border: `1.5px solid ${theme === key ? text : divider}`,
                background: theme === key ? overlay : 'transparent',
                color: text, cursor: 'pointer', transition: 'all 0.15s',
              }}>
                <Icon size={15} />
                <span style={{ fontSize: 10, fontFamily: "'Neuton', serif" }}>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/*support — always visible*/}
        <div style={{ padding: '0 10px 14px', borderTop: `1px solid ${divider}`, paddingTop: 14 }}>
          <div style={{ fontFamily: "'Neuton', serif", fontSize: 10, color: sub, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '0 8px 8px' }}>
            Help
          </div>
          <button onClick={() => setShowSupport(p => !p)} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 11,
            padding: '11px 12px', borderRadius: 10, border: 'none',
            background: showSupport ? active : 'transparent',
            color: showSupport ? text : sub,
            cursor: 'pointer', fontFamily: "'Neuton', serif", fontSize: 14, textAlign: 'left',
            transition: 'all 0.15s',
          }}>
            <HelpCircle size={17} /> Contact Support
          </button>
          {showSupport && (
            <div style={{ margin: '8px 0 0' }}>
              <SupportForm
                compact
                onSuccess={() => setShowSupport(false)}
                compactColors={{ text, border: divider, input: overlay, bg: 'transparent', btn: text, btnText: bg }}
              />
            </div>
          )}
        </div>

        {/*/ sign out — only when logged in*/}
        {user && (
          <div style={{ padding: '0 10px 24px', flexShrink: 0 }}>
            <button
              onClick={() => { logout(); onClose(); navigate('/'); }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 11,
                padding: '11px 12px', borderRadius: 10,
                border: `1px solid ${divider}`, background: 'transparent',
                color: sub, cursor: 'pointer', fontFamily: "'Neuton', serif",
                fontSize: 14, textAlign: 'left', transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = text; e.currentTarget.style.borderColor = text; }}
              onMouseLeave={e => { e.currentTarget.style.color = sub; e.currentTarget.style.borderColor = divider; }}
            >
              <LogOut size={17} /> Sign Out
            </button>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;