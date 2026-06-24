import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search, MapPin, Shield, MessageCircle, Building2,
  ChevronRight, Star, Home, Menu, ArrowRight,
  CheckCircle, Zap, Lock,
} from 'lucide-react';
import Logo from '../components/ui/Logo';
import Sidebar from '../components/ui/Sidebar';
import ThemeToggle from '../components/ui/ThemeToggle';
import { useAuth } from '../context/AuthContext';

const Landing: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const go = (path: string) => {
    if (isAuthenticated) navigate(path);
    else navigate('/signup');
  };

  const features = [
    { icon: Search,        title: 'Smart Discovery',     desc: 'Filter by city, area, house type, and budget. No noise, no guesswork.' },
    { icon: MapPin,        title: 'Exact GPS Pins',      desc: 'Every listing has a precise Google Maps pin dropped by the landlord.' },
    { icon: MessageCircle, title: 'Real-Time Chat',      desc: 'Message landlords instantly. Full history and online indicators included.' },
    { icon: Shield,        title: 'OTP-Verified Accounts', desc: 'Every account is phone or email verified. Admins moderate all content.' },
    { icon: Lock,          title: 'Secure Sign-In',      desc: 'Sign up once with OTP. After that, just your password to get back in.' },
    { icon: Zap,           title: 'Instant Listings',    desc: 'Landlords publish in minutes — photos, GPS pin, notes, and amenities.' },
  ];

  const stats = [
    { number: '12,000+', label: 'Active Listings' },
    { number: '8 Cities', label: 'Across Kenya' },
    { number: '98%',      label: 'Tenant Satisfaction' },
    { number: '< 2 min',  label: 'Avg. Response Time' },
  ];

  const howItWorks = [
    { step: '01', title: 'Create your account',    desc: 'Sign up with email or phone. Verify once with OTP — then just your password every time after.' },
    { step: '02', title: 'Browse & filter',         desc: 'Search by location, type, and price. Every result has photos, a GPS pin, and landlord notes.' },
    { step: '03', title: 'Chat with the landlord', desc: 'Hit "Chat with Landlord" on any listing. Real-time messaging, no middlemen.' },
  ];

  const forWho = [
    {
      icon: Home, title: 'For Tenants', accent: '#4F252E',
      points: ['Browse verified listings', 'Filter by type, area & budget', 'Message landlords directly', 'View GPS location before visiting'],
      cta: 'Find a Home', path: '/dashboard',
    },
    {
      icon: Building2, title: 'For Landlords', accent: '#c4902a',
      points: ['Publish in under 2 minutes', 'Upload photos & pin location', 'Receive instant enquiries', 'Manage listings from one dashboard'],
      cta: 'List a Property', path: '/my-listings?create=true',
    },
  ];

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* navbar */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 30,
        background: 'var(--bg-primary)', borderBottom: '1px solid var(--border-color)',
        height: 64, display: 'flex', alignItems: 'center', padding: '0 24px', gap: 16,
      }}>
        <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', padding: 6, display: 'flex' }}>
          <Menu size={22} />
        </button>
        <Logo size="sm" />
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ThemeToggle />
          {isAuthenticated ? (
            <>
              <button onClick={() => navigate('/dashboard')} style={navGhost()}>Dashboard</button>
              <div onClick={() => navigate('/dashboard')} style={{ width: 34, height: 34, borderRadius: '50%', background: '#4F252E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Archivo Black', sans-serif", fontSize: 13, color: '#FFF7C5', cursor: 'pointer' }}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            </>
          ) : (
            <>
              <Link to="/login"  style={{ ...navGhost(), textDecoration: 'none' }}>Sign In</Link>
              <Link to="/signup" style={{ ...navSolid(), textDecoration: 'none' }}>Get Started</Link>
            </>
          )}
        </div>
      </nav>

     { /* hero */}
      <section style={{ padding: 'clamp(64px,10vw,112px) 24px', background: 'linear-gradient(160deg,#FFF7C5 0%,var(--bg-primary) 55%)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -120, right: -120, width: 440, height: 440, borderRadius: '50%', background: '#4F252E06', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', maxWidth: 740, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#4F252E18', padding: '6px 16px', borderRadius: 99, fontFamily: "'Neuton', serif", fontSize: 13, color: '#4F252E', marginBottom: 24 }}>
            <Star size={12} fill="#4F252E" /> Kenya's most trusted house finder
          </div>
          <h1 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: 'clamp(36px,7vw,74px)', color: 'var(--text-primary)', lineHeight: 1.05, marginBottom: 20, letterSpacing: '-0.02em' }}>
            Find your{' '}
            <span style={{ color: '#4F252E', fontStyle: 'italic', fontFamily: "'Libre Baskerville', serif" }}>perfect</span>
            {' '}nest.
          </h1>
          <p style={{ fontFamily: "'Neuton', serif", fontSize: 'clamp(16px,2.5vw,20px)', color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: 520, margin: '0 auto 40px' }}>
            Thousands of verified rental listings across Kenya. Filter, discover, and chat with landlords — free and fast.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => go('/dashboard')} style={{ padding: '15px 32px', borderRadius: 12, background: '#4F252E', color: '#FFF7C5', border: 'none', cursor: 'pointer', fontFamily: "'Archivo Black', sans-serif", fontSize: 16, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 8px 28px rgba(79,37,46,0.3)', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; }}
            >
              <Home size={18} /> Browse Listings <ChevronRight size={16} />
            </button>
            <button onClick={() => navigate(isAuthenticated ? '/my-listings?create=true' : '/signup')} style={{ padding: '15px 32px', borderRadius: 12, background: 'transparent', color: '#4F252E', border: '2px solid #4F252E', cursor: 'pointer', fontFamily: "'Archivo Black', sans-serif", fontSize: 16, display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#4F252E'; e.currentTarget.style.color = '#FFF7C5'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#4F252E'; }}
            >
              <Building2 size={18} /> List a Property
            </button>
          </div>

        
          <div style={{ marginTop: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex' }}>
              {['A','B','C','D','E'].map((l, i) => (
                <div key={l} style={{ width: 32, height: 32, borderRadius: '50%', background: `hsl(${i * 37 + 10},50%,45%)`, border: '2px solid var(--bg-primary)', marginLeft: i > 0 ? -10 : 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Archivo Black', sans-serif", fontSize: 11, color: '#fff' }}>
                  {l}
                </div>
              ))}
            </div>
            <span style={{ fontFamily: "'Neuton', serif", fontSize: 14, color: 'var(--text-secondary)' }}>
              <strong style={{ color: 'var(--text-primary)' }}>2,400+</strong> tenants found homes this month
            </span>
          </div>
        </div>
      </section>  

      {/* stats bar */}
      <section style={{ background: '#4F252E' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))' }}>
          {stats.map((s, i) => (
            <div key={i} style={{ textAlign: 'center', padding: '32px 20px', borderRight: i < stats.length - 1 ? '1px solid rgba(255,247,197,0.12)' : 'none' }}>
              <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: 32, color: '#FFF7C5', lineHeight: 1 }}>{s.number}</div>
              <div style={{ fontFamily: "'Neuton', serif", fontSize: 13, color: 'rgba(255,247,197,0.55)', marginTop: 6 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* for who */}
      <section style={{ padding: 'clamp(60px,8vw,100px) 24px', maxWidth: 1100, margin: '0 auto' }}>
        <SectionHead eyebrow="Who it's for" title="Built for both sides of the door" sub="Whether you're looking for a home or filling vacancies — NestHop has you covered." />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 24 }}>
          {forWho.map(({ icon: Icon, title, accent, points, cta, path }) => (
            <div key={title} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 20, padding: 32, transition: 'transform 0.2s,box-shadow 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 16px 48px ${accent}18`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
            >
              <div style={{ width: 52, height: 52, borderRadius: 14, background: `${accent}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                <Icon size={24} color={accent} />
              </div>
              <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 18 }}>{title}</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {points.map(p => (
                  <li key={p} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <CheckCircle size={15} color={accent} style={{ flexShrink: 0, marginTop: 2 }} />
                    <span style={{ fontFamily: "'Neuton', serif", fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{p}</span>
                  </li>
                ))}
              </ul>
              <button onClick={() => go(path)} style={{ padding: '12px 20px', borderRadius: 10, background: accent, color: '#FFF7C5', border: 'none', cursor: 'pointer', fontFamily: "'Archivo Black', sans-serif", fontSize: 14, display: 'flex', alignItems: 'center', gap: 6, width: '100%', justifyContent: 'center', transition: 'opacity 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
              >
                {cta} <ArrowRight size={15} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* features */}
      <section style={{ padding: 'clamp(60px,8vw,100px) 24px', background: 'var(--bg-secondary)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <SectionHead eyebrow="Features" title="Everything you need to find home" sub="NestHop simplifies the rental journey from first search to move-in." />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 20 }}>
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 18, padding: 26, transition: 'transform 0.2s,box-shadow 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 36px rgba(79,37,46,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
              >
                <div style={{ width: 48, height: 48, borderRadius: 12, background: '#4F252E12', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                  <Icon size={22} color="#4F252E" />
                </div>
                <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>{title}</h3>
                <p style={{ fontFamily: "'Neuton', serif", fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.65 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

     {/* how it works */}
      <section style={{ padding: 'clamp(60px,8vw,100px) 24px', maxWidth: 1100, margin: '0 auto' }}>
        <SectionHead eyebrow="How it works" title="Up and running in 3 steps" sub="No agents. No hidden fees. Just you, the landlord, and a direct line." />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 24 }}>
          {howItWorks.map(({ step, title, desc }) => (
            <div key={step} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 18, padding: '28px 24px' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#4F252E', color: '#FFF7C5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Archivo Black', sans-serif", fontSize: 16, marginBottom: 20 }}>
                {step}
              </div>
              <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>{title}</h3>
              <p style={{ fontFamily: "'Neuton', serif", fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.65 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* final cta */}
      <section style={{ padding: '0 24px clamp(60px,8vw,100px)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', borderRadius: 24, background: 'linear-gradient(135deg,#4F252E 0%,#6b3340 100%)', padding: 'clamp(48px,6vw,72px) 40px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,247,197,0.05)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative' }}>
            <h2 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: 'clamp(26px,4.5vw,44px)', color: '#FFF7C5', lineHeight: 1.1, marginBottom: 14 }}>
              Ready to find your nest?
            </h2>
            <p style={{ fontFamily: "'Neuton', serif", fontSize: 17, color: 'rgba(255,247,197,0.72)', maxWidth: 420, margin: '0 auto 36px', lineHeight: 1.6 }}>
              Join thousands of Kenyans who found their perfect home — free, fast, and verified.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => navigate(isAuthenticated ? '/dashboard' : '/signup')} style={{ padding: '15px 36px', borderRadius: 12, background: '#FFF7C5', color: '#4F252E', border: 'none', cursor: 'pointer', fontFamily: "'Archivo Black', sans-serif", fontSize: 16, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 8px 28px rgba(0,0,0,0.2)', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; }}
              >
                {isAuthenticated ? 'Go to Dashboard' : 'Create Free Account'} <ChevronRight size={18} />
              </button>
              {!isAuthenticated && (
                <button onClick={() => navigate('/login')} style={{ padding: '15px 36px', borderRadius: 12, background: 'transparent', color: '#FFF7C5', border: '2px solid rgba(255,247,197,0.4)', cursor: 'pointer', fontFamily: "'Archivo Black', sans-serif", fontSize: 16, transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#FFF7C5'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,247,197,0.4)'; }}
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/*footer*/}
      <footer style={{ borderTop: '1px solid var(--border-color)', padding: '28px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <Logo size="sm" showTagline />
          <p style={{ fontFamily: "'Neuton', serif", fontSize: 13, color: 'var(--text-muted)' }}>
            © {new Date().getFullYear()} NestHop. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

const SectionHead: React.FC<{ eyebrow: string; title: string; sub: string }> = ({ eyebrow, title, sub }) => (
  <div style={{ textAlign: 'center', marginBottom: 52 }}>
    <div style={{ display: 'inline-block', fontFamily: "'Neuton', serif", fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#4F252E', background: '#4F252E12', padding: '5px 14px', borderRadius: 99, marginBottom: 16 }}>
      {eyebrow}
    </div>
    <h2 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: 'clamp(26px,4.5vw,42px)', color: 'var(--text-primary)', lineHeight: 1.1, marginBottom: 14 }}>
      {title}
    </h2>
    <p style={{ fontFamily: "'Neuton', serif", fontSize: 17, color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto', lineHeight: 1.65 }}>
      {sub}
    </p>
  </div>
);

const navGhost = (): React.CSSProperties => ({
  padding: '8px 18px', borderRadius: 99,
  background: 'transparent', color: 'var(--text-primary)',
  border: '1.5px solid var(--border-color)', cursor: 'pointer',
  fontFamily: "'Archivo Black', sans-serif", fontSize: 13,
  textDecoration: 'none', display: 'inline-flex', alignItems: 'center',
});

const navSolid = (): React.CSSProperties => ({
  padding: '8px 18px', borderRadius: 99,
  background: '#4F252E', color: '#FFF7C5',
  border: 'none', cursor: 'pointer',
  fontFamily: "'Archivo Black', sans-serif", fontSize: 13,
  textDecoration: 'none', display: 'inline-flex', alignItems: 'center',
});

export default Landing;