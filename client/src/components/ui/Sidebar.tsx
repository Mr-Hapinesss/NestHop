import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home, MessageCircle, PlusSquare, Shield,
  HelpCircle, Moon, Sun, Monitor,
  X, LogOut, Building2, AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Logo from './Logo';
import SupportForm from '../support/SupportForm';

interface Props { isOpen: boolean; onClose: () => void; }

const Sidebar: React.FC<Props> = ({ isOpen, onClose }) => {
  const { user, logout }                   = useAuth();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [showSupport, setShowSupport] = useState(false);
  const [showSignOut, setShowSignOut] = useState(false);

  const isDark  = resolvedTheme === 'dark';
  const bg      = isDark ? '#FFF7C5' : '#4F252E';
  const text    = isDark ? '#4F252E' : '#FFF7C5';
  const sub     = isDark ? 'rgba(79,37,46,0.5)'  : 'rgba(255,247,197,0.5)';
  const divider = isDark ? 'rgba(79,37,46,0.12)' : 'rgba(255,247,197,0.12)';
  const hover   = isDark ? 'rgba(79,37,46,0.08)' : 'rgba(255,247,197,0.1)';
  const active  = isDark ? 'rgba(79,37,46,0.14)' : 'rgba(255,247,197,0.18)';
  const overlay = isDark ? 'rgba(79,37,46,0.12)' : 'rgba(255,247,197,0.12)';

  /* logo wordmark accent — always visible regardless of sidebar bg */
  const hopColor = isDark ? '#4F252E' : '#c4902a';

  const go       = (path: string) => { navigate(path); onClose(); };
  const isActive = (path: string) => location.pathname === path.split('?')[0];

  /* role-based nav map */
  const allNav = [
    {
      icon: Home,
      label: 'Discover Homes',
      path: '/dashboard',
      roles: ['tenant', 'landlord', 'admin'],
    },
    {
      icon: MessageCircle,
      label: 'Messages',
      path: '/chat',
      roles: ['tenant', 'landlord', 'admin'],
    },
    {
      icon: Building2,
      label: 'My Listings',
      path: '/my-listings',
      roles: ['landlord', 'admin'],
    },
    {
      icon: PlusSquare,
      label: 'Add Listing',
      path: '/my-listings?create=true',
      roles: ['landlord', 'admin'],
    },
    {
      icon: Shield,
      label: 'Admin Panel',
      path: '/admin',
      roles: ['admin'],
    },
  ];

  const visible = user
    ? allNav.filter(i => i.roles.includes(user.role))
    : [];

  const themeOpts = [
    { key: 'light'  as const, label: 'Light', Icon: Sun },
    { key: 'dark'   as const, label: 'Dark',  Icon: Moon },
    { key: 'system' as const, label: 'Auto',  Icon: Monitor },
  ];

  const handleSignOut = () => {
    logout();
    onClose();
    navigate('/');
  };

  const navBtn = (path: string, Icon: React.ElementType, label: string) => {
    const on = isActive(path);
    return (
      <button
        key={path}
        onClick={() => go(path)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 11,
          padding: '11px 12px', borderRadius: 10, border: 'none',
          background: on ? active : 'transparent',
          color: on ? text : sub,
          cursor: 'pointer', fontFamily: "'Neuton', serif", fontSize: 14,
          textAlign: 'left', transition: 'all 0.15s', marginBottom: 2,
        }}
        onMouseEnter={e => {
          if (!on) {
            e.currentTarget.style.background = hover;
            e.currentTarget.style.color = text;
          }
        }}
        onMouseLeave={e => {
          if (!on) {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = sub;
          }
        }}
      >
        <Icon size={17} />
        {label}
        {on && (
          <div style={{
            marginLeft: 'auto', width: 6, height: 6,
            borderRadius: '50%', background: text,
          }} />
        )}
      </button>
    );
  };

  return (
    <>
      {/* backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 40,
          background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'all' : 'none',
          transition: 'opacity 0.3s ease',
        }}
      />

      {/* drawer */}
      <aside style={{
        position: 'fixed', top: 0, left: 0, zIndex: 50,
        height: '100dvh', width: 300, background: bg,
        transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.4s cubic-bezier(0.16,1,0.3,1)',
        display: 'flex', flexDirection: 'column', overflowY: 'auto',
      }}>

        {/* header */}
        <div style={{
          padding: '22px 18px 18px',
          borderBottom: `1px solid ${divider}`,
          flexShrink: 0,
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', marginBottom: user ? 18 : 0,
          }}>
            {/* custom inline logo so Hop color is always visible */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="28" height="28" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <ellipse cx="24" cy="38" rx="18" ry="5" fill={text} opacity="0.12" />
                <path d="M8 38 Q16 32 24 34 Q32 32 40 38" stroke={text} strokeWidth="2.5" strokeLinecap="round" fill="none" />
                <path d="M10 36 Q18 30 24 32 Q30 30 38 36" stroke={text} strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6" />
                <path d="M12 37 Q24 44 36 37" stroke={text} strokeWidth="2.5" strokeLinecap="round" fill="none" />
                <ellipse cx="24" cy="24" rx="8" ry="6" fill={text} />
                <circle cx="31" cy="20" r="5" fill={text} />
                <circle cx="33" cy="19" r="1.2" fill={bg} />
                <circle cx="33.4" cy="18.6" r="0.4" fill={text} />
                <path d="M36 20 L39 19 L36 21 Z" fill={hopColor} />
                <path d="M17 23 Q20 17 27 20" stroke={bg} strokeWidth="2" strokeLinecap="round" fill="none" />
                <path d="M16 25 L10 22 M16 26 L10 28" stroke={text} strokeWidth="2" strokeLinecap="round" />
                <ellipse cx="24" cy="36" rx="4" ry="3" fill={hopColor} opacity="0.85" />
                <ellipse cx="21" cy="36" rx="3" ry="2.5" fill={hopColor} opacity="0.6" />
              </svg>
              <div style={{
                fontFamily: "'Archivo Black', sans-serif",
                fontSize: 20, lineHeight: 1, letterSpacing: '-0.02em',
              }}>
                <span style={{ color: text }}>Nest</span>
                <span style={{ color: hopColor }}>Hop</span>
              </div>
            </div>

            <button
              onClick={onClose}
              style={{
                background: overlay, border: 'none', borderRadius: 8,
                width: 32, height: 32, display: 'flex', alignItems: 'center',
                justifyContent: 'center', cursor: 'pointer', color: text,
              }}
            >
              <X size={16} />
            </button>
          </div>

          {/* user badge */}
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
              <div style={{
                width: 42, height: 42, borderRadius: '50%',
                background: overlay, border: `1.5px solid ${divider}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: "'Archivo Black', sans-serif", fontSize: 15,
                color: text, flexShrink: 0,
              }}>
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{
                  fontFamily: "'Archivo Black', sans-serif",
                  fontSize: 14, color: text,
                }}>
                  {user.name}
                </div>
                <div style={{
                  fontFamily: "'Neuton', serif", fontSize: 11,
                  color: sub, textTransform: 'capitalize',
                }}>
                  {user.role}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* role-filtered nav — only when logged in */}
        {user && visible.length > 0 && (
          <nav style={{ padding: '12px 10px' }}>
            <div style={{
              fontFamily: "'Neuton', serif", fontSize: 10, color: sub,
              letterSpacing: '0.12em', textTransform: 'uppercase',
              padding: '0 8px 8px',
            }}>
              Navigation
            </div>
            {visible.map(item => navBtn(item.path, item.icon, item.label))}
          </nav>
        )}

        <div style={{ flex: 1 }} />

        {/* theme picker — always visible */}
        <div style={{ padding: '14px 10px', borderTop: `1px solid ${divider}` }}>
          <div style={{
            fontFamily: "'Neuton', serif", fontSize: 10, color: sub,
            letterSpacing: '0.12em', textTransform: 'uppercase',
            padding: '0 8px 8px',
          }}>
            Appearance
          </div>
          <div style={{ display: 'flex', gap: 6, padding: '0 8px' }}>
            {themeOpts.map(({ key, label, Icon }) => (
              <button
                key={key}
                onClick={() => setTheme(key)}
                style={{
                  flex: 1, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: 5, padding: '9px 4px', borderRadius: 10,
                  border: `1.5px solid ${theme === key ? text : divider}`,
                  background: theme === key ? overlay : 'transparent',
                  color: text, cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                <Icon size={15} />
                <span style={{ fontSize: 10, fontFamily: "'Neuton', serif" }}>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* support — always visible */}
        <div style={{
          padding: '0 10px 14px',
          borderTop: `1px solid ${divider}`,
          paddingTop: 14,
        }}>
          <div style={{
            fontFamily: "'Neuton', serif", fontSize: 10, color: sub,
            letterSpacing: '0.12em', textTransform: 'uppercase',
            padding: '0 8px 8px',
          }}>
            Help
          </div>
          <button
            onClick={() => setShowSupport(p => !p)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 11,
              padding: '11px 12px', borderRadius: 10, border: 'none',
              background: showSupport ? active : 'transparent',
              color: showSupport ? text : sub,
              cursor: 'pointer', fontFamily: "'Neuton', serif",
              fontSize: 14, textAlign: 'left', transition: 'all 0.15s',
            }}
          >
            <HelpCircle size={17} /> Contact Support
          </button>
          {showSupport && (
            <div style={{ margin: '8px 0 0' }}>
              <SupportForm
                compact
                onSuccess={() => setShowSupport(false)}
                compactColors={{
                  text, border: divider, input: overlay,
                  bg: 'transparent', btn: text, btnText: bg,
                }}
              />
            </div>
          )}
        </div>

        {/* sign out — only when logged in */}
        {user && (
          <div style={{ padding: '0 10px 24px', flexShrink: 0 }}>
            {showSignOut ? (
              /* confirmation card */
              <div style={{
                borderRadius: 14, border: `1.5px solid ${divider}`,
                background: overlay, padding: '16px 14px',
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10,
                }}>
                  <AlertTriangle size={16} color={text} style={{ flexShrink: 0 }} />
                  <span style={{
                    fontFamily: "'Libre Baskerville', serif",
                    fontSize: 14, color: text, fontWeight: 700,
                  }}>
                    Sign out?
                  </span>
                </div>
                <p style={{
                  fontFamily: "'Neuton', serif", fontSize: 13,
                  color: sub, lineHeight: 1.5, marginBottom: 14,
                }}>
                  You'll need to sign in again to access your account.
                </p>
                <div style={{ display: 'flex', gap: 8 }}>
                  {/* cancel */}
                  <button
                    onClick={() => setShowSignOut(false)}
                    style={{
                      flex: 1, padding: '9px', borderRadius: 9,
                      border: `1.5px solid ${divider}`,
                      background: 'transparent', color: sub,
                      fontFamily: "'Neuton', serif", fontSize: 13,
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = text; e.currentTarget.style.borderColor = text; }}
                    onMouseLeave={e => { e.currentTarget.style.color = sub; e.currentTarget.style.borderColor = divider; }}
                  >
                    Cancel
                  </button>
                  {/* confirm */}
                  <button
                    onClick={handleSignOut}
                    style={{
                      flex: 1, padding: '9px', borderRadius: 9,
                      border: 'none', background: text, color: bg,
                      fontFamily: "'Archivo Black', sans-serif", fontSize: 13,
                      cursor: 'pointer', transition: 'opacity 0.15s',
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center', gap: 6,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                  >
                    <LogOut size={13} /> Yes, sign out
                  </button>
                </div>
              </div>
            ) : (
              /* sign out trigger */
              <button
                onClick={() => setShowSignOut(true)}
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
            )}
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;