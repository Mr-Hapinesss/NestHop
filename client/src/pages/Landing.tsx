import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Shield, MessageCircle, Building2, ChevronRight, Star, Home } from 'lucide-react';
import Logo from '../components/ui/Logo';
import AuthModal from '../components/auth/AuthModal';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ui/ThemeToggle';
import Sidebar from '../components/ui/Sidebar';
import { Menu } from 'lucide-react';

const Landing: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [authOpen, setAuthOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleCTA = (path: string) => {
    if (isAuthenticated) navigate(path);
    else setAuthOpen(true);
  };

  const features = [
    {
      icon: Search,
      title: 'Smart Discovery',
      desc: 'Filter by location, house type, and budget. Find exactly what you need without the noise.',
    },
    {
      icon: MapPin,
      title: 'Pinned Locations',
      desc: 'Every listing includes a precise Google Maps pin set by the landlord — no more vague directions.',
    },
    {
      icon: MessageCircle,
      title: 'Real-Time Chat',
      desc: 'Message landlords directly about a property. Instant responses, no middlemen.',
    },
    {
      icon: Shield,
      title: 'Verified Listings',
      desc: 'Every landlord profile is OTP-verified. Admin moderation keeps the platform clean.',
    },
  ];

  const stats = [
    { number: '12,000+', label: 'Listings Nationwide' },
    { number: '8 Cities', label: 'Covered Across Kenya' },
    { number: '98%', label: 'Tenant Satisfaction' },
  ];

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Navbar */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 30,
        background: 'var(--bg-primary)',
        borderBottom: '1px solid var(--border-color)',
        padding: '0 24px',
        display: 'flex', alignItems: 'center',
        height: 64,
      }}>
        <button
          onClick={() => setSidebarOpen(true)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', marginRight: 16, padding: 6 }}
        >
          <Menu size={22} />
        </button>
        <Logo size="sm" />
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <ThemeToggle />
          {isAuthenticated ? (
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                padding: '8px 20px', borderRadius: 99,
                background: '#4F252E', color: '#FFF7C5',
                border: 'none', cursor: 'pointer',
                fontFamily: "'Archivo Black', sans-serif", fontSize: 13,
              }}
            >
              Dashboard
            </button>
          ) : (
            <button
              onClick={() => setAuthOpen(true)}
              style={{
                padding: '8px 20px', borderRadius: 99,
                background: '#4F252E', color: '#FFF7C5',
                border: 'none', cursor: 'pointer',
                fontFamily: "'Archivo Black', sans-serif", fontSize: 13,
              }}
            >
              Sign In
            </button>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        padding: '80px 24px 100px',
        background: 'linear-gradient(160deg, #FFF7C5 0%, var(--bg-primary) 60%)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: '#4F252E08', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -80, width: 300, height: 300, borderRadius: '50%', background: '#4F252E05', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', maxWidth: 720, margin: '0 auto' }}>
          {/* Eyebrow */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: '#4F252E18', padding: '6px 16px', borderRadius: 99,
            fontFamily: "'Neuton', serif", fontSize: 13, color: '#4F252E',
            marginBottom: 24,
          }}>
            <Star size={12} fill="#4F252E" /> Kenya's Most Trusted House Finder
          </div>

          <h1 style={{
            fontFamily: "'Archivo Black', sans-serif",
            fontSize: 'clamp(36px, 7vw, 72px)',
            color: 'var(--text-primary)',
            lineHeight: 1.05,
            marginBottom: 20,
          }}>
            Find your <span style={{ color: '#4F252E', fontStyle: 'italic', fontFamily: "'Libre Baskerville', serif" }}>perfect</span> nest.
          </h1>

          <p style={{
            fontFamily: "'Neuton', serif",
            fontSize: 'clamp(16px, 2.5vw, 20px)',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            maxWidth: 520, margin: '0 auto 40px',
          }}>
            Thousands of verified rental listings across Kenya. Filter, discover, and chat with landlords — all in one place.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => handleCTA('/dashboard')}
              style={{
                padding: '16px 32px', borderRadius: 12,
                background: '#4F252E', color: '#FFF7C5',
                border: 'none', cursor: 'pointer',
                fontFamily: "'Archivo Black', sans-serif", fontSize: 16,
                display: 'flex', alignItems: 'center', gap: 8,
                transition: 'all 0.2s',
                boxShadow: '0 8px 24px rgba(79,37,46,0.3)',
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <Home size={18} /> Browse Listings <ChevronRight size={16} />
            </button>
            <button
              onClick={() => handleCTA('/my-listings?create=true')}
              style={{
                padding: '16px 32px', borderRadius: 12,
                background: 'transparent', color: '#4F252E',
                border: '2px solid #4F252E', cursor: 'pointer',
                fontFamily: "'Archivo Black', sans-serif", fontSize: 16,
                display: 'flex', alignItems: 'center', gap: 8,
              }}
            >
              <Building2 size={18} /> List Your Property
            </button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{
        background: '#4F252E', padding: '40px 24px',
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 0,
      }}>
        {stats.map((s, i) => (
          <div key={i} style={{
            textAlign: 'center', padding: '20px',
            borderRight: i < stats.length - 1 ? '1px solid rgba(255,247,197,0.2)' : 'none',
          }}>
            <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: 36, color: '#FFF7C5' }}>
              {s.number}
            </div>
            <div style={{ fontFamily: "'Neuton', serif", fontSize: 14, color: 'rgba(255,247,197,0.6)', marginTop: 4 }}>
              {s.label}
            </div>
          </div>
        ))}
      </section>

      {/* Features */}
      <section style={{ padding: '80px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <h2 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: 'clamp(28px, 5vw, 44px)', color: 'var(--text-primary)', marginBottom: 12 }}>
            Everything you need to find home
          </h2>
          <p style={{ fontFamily: "'Neuton', serif", fontSize: 16, color: 'var(--text-secondary)', maxWidth: 480, margin: '0 auto' }}>
            NestHop simplifies the rental journey from first search to signed agreement.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 20, padding: 28,
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(79,37,46,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
            >
              <div style={{
                width: 52, height: 52, borderRadius: 14,
                background: '#4F252E18',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 20,
              }}>
                <Icon size={24} color="#4F252E" />
              </div>
              <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>
                {title}
              </h3>
              <p style={{ fontFamily: "'Neuton', serif", fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section style={{
        margin: '0 24px 80px', borderRadius: 24,
        background: 'linear-gradient(135deg, #4F252E, #6b3340)',
        padding: '60px 40px', textAlign: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'url("data:image/svg+xml,...") center/cover', opacity: 0.05 }} />
        <h2 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: 'clamp(24px, 4vw, 40px)', color: '#FFF7C5', marginBottom: 12 }}>
          Ready to find your nest?
        </h2>
        <p style={{ fontFamily: "'Neuton', serif", fontSize: 16, color: 'rgba(255,247,197,0.75)', marginBottom: 32, maxWidth: 420, margin: '0 auto 32px' }}>
          Join thousands of Kenyans who found their perfect home on NestHop.
        </p>
        <button
          onClick={() => handleCTA('/dashboard')}
          style={{
            padding: '16px 40px', borderRadius: 12,
            background: '#FFF7C5', color: '#4F252E',
            border: 'none', cursor: 'pointer',
            fontFamily: "'Archivo Black', sans-serif", fontSize: 16,
            display: 'inline-flex', alignItems: 'center', gap: 8,
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          }}
        >
          Get Started Free <ChevronRight size={18} />
        </button>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-color)',
        padding: '32px 24px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: 16,
      }}>
        <Logo size="sm" />
        <p style={{ fontFamily: "'Neuton', serif", fontSize: 13, color: 'var(--text-muted)' }}>
          © 2025 NestHop. Made with ♥ in Kenya.
        </p>
      </footer>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
};

export default Landing;