import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import Logo from '../components/ui/Logo';
import PhoneEmailInput from '../components/auth/PhoneEmailInput';
import { authService } from '../services/auth.service';
import { useAuth } from '../context/AuthContext';
import { detectContactType } from '../utils/helpers';
import { toast } from '../components/ui/Toast';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [contact, setContact]   = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);

  const contactType = detectContactType(contact);

  const handleLogin = async () => {
    if (!contactType) { toast.error('Enter a valid email or phone'); return; }
    if (!password)    { toast.error('Enter your password'); return; }
    setLoading(true);
    try {
      const res = await authService.login(contact, contactType, password);
      if (res.success) {
        login(res.data.token, res.data.user);
        toast.success(`Welcome back, ${res.data.user.name.split(' ')[0]}!`);
        navigate('/dashboard');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#f9f5f0' }}>
      {/* left brand panel*/}
      <div style={{
        flex: 1, background: '#4F252E',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: 48,
      }}>
        <Logo variant="light" size="lg" showTagline />
        <p style={{ marginTop: 36, fontFamily: "'Neuton', serif", fontSize: 16, color: 'rgba(255,247,197,0.65)', textAlign: 'center', maxWidth: 280, lineHeight: 1.7 }}>
          Your next home is one search away.
        </p>
      </div>

      {/* right form panel*/}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 24px' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>

          <div style={{ marginBottom: 32 }}>
            <div style={{ marginBottom: 20 }}><Logo size="sm" /></div>
            <h1 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: 26, color: '#1a1a1a', marginBottom: 6 }}>
              Sign in
            </h1>
            <p style={{ fontFamily: "'Neuton', serif", fontSize: 15, color: '#6b7280' }}>
              Don't have an account?{' '}
              <Link to="/signup" style={{ color: '#4F252E', fontWeight: 700, textDecoration: 'none' }}>Sign up</Link>
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={lbl}>Email or Phone</label>
              <PhoneEmailInput value={contact} onChange={setContact} onEnter={handleLogin} />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={lbl}>Password</label>
                <Link to="/forgot-password" style={{ fontFamily: "'Neuton', serif", fontSize: 13, color: '#4F252E', textDecoration: 'none' }}>
                  Forgot password?
                </Link>
              </div>
              <div style={{
                display: 'flex', alignItems: 'center',
                border: '1.5px solid #d1d5db', borderRadius: 12, background: '#fff',
              }}>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password} onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  placeholder="Your password"
                  style={{ flex: 1, padding: '12px 14px', border: 'none', outline: 'none', fontFamily: "'Neuton', serif", fontSize: 15, background: 'transparent', color: '#1a1a1a' }}
                />
                <button type="button" onClick={() => setShowPw(p => !p)} style={{ padding: '0 14px', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex' }}>
                  {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <button onClick={handleLogin} disabled={loading || !contactType || !password} style={submitBtn(loading || !contactType || !password)}>
              {loading ? 'Signing in...' : 'Sign In'}{!loading && <ArrowRight size={16} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const lbl: React.CSSProperties = {
  display: 'block', fontFamily: "'Neuton', serif",
  fontSize: 13, color: '#6b7280', marginBottom: 6,
};

const submitBtn = (disabled: boolean): React.CSSProperties => ({
  width: '100%', padding: '14px', borderRadius: 12, border: 'none',
  background: disabled ? '#e5e7eb' : '#4F252E',
  color: disabled ? '#9ca3af' : '#FFF7C5',
  fontFamily: "'Archivo Black', sans-serif", fontSize: 15,
  cursor: disabled ? 'not-allowed' : 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  transition: 'all 0.2s',
});

export default LoginPage;