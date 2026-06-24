import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, CheckCircle } from 'lucide-react';
import Logo from '../components/ui/Logo';
import PhoneEmailInput from '../components/auth/PhoneEmailInput';
import OTPInput from '../components/auth/OTPInput';
import { authService } from '../services/auth.service';
import { useAuth } from '../context/AuthContext';
import { detectContactType } from '../utils/helpers';
import { toast } from '../components/ui/Toast';

type Step = 'form' | 'otp';

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [step, setStep]           = useState<Step>('form');
  const [contact, setContact]     = useState('');
  const [name, setName]           = useState('');
  const [role, setRole]           = useState<'tenant' | 'landlord'>('tenant');
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [showPw, setShowPw]       = useState(false);
  const [showCf, setShowCf]       = useState(false);
  const [otp, setOtp]             = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError]   = useState(false);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [loading, setLoading]     = useState(false);
  const [resend, setResend]       = useState(0);

  const contactType = detectContactType(contact);

  useEffect(() => {
    if (resend <= 0) return;
    const t = setTimeout(() => setResend(p => p - 1), 1000);
    return () => clearTimeout(t);
  }, [resend]);

  const pwStrength = (pw: string) => {
    if (!pw) return { score: 0, label: '', color: '' };
    let s = 0;
    if (pw.length >= 8) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    const map = [
      { label: '', color: '' },
      { label: 'Weak', color: '#ef4444' },
      { label: 'Fair', color: '#f59e0b' },
      { label: 'Good', color: '#3b82f6' },
      { label: 'Strong', color: '#22c55e' },
    ];
    return { score: s, ...map[s] };
  };

  const strength = pwStrength(password);

  const handleSignup = async () => {
    if (!name.trim())            { toast.error('Enter your name'); return; }
    if (!contactType)            { toast.error('Enter a valid email or phone'); return; }
    if (password.length < 6)    { toast.error('Password must be at least 6 characters'); return; }
    if (password !== confirm)    { toast.error('Passwords do not match'); return; }

    setLoading(true);
    try {
      const res = await authService.signup({ name: name.trim(), contact, contactType, password, role });
      if (res.success) {
        setExpiresAt(res.data.expiresAt);
        setResend(120);
        setStep('otp');
        toast.success('Verification code sent!');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (code?: string) => {
    const val = code || otp.join('');
    if (val.length !== 6) return;
    setLoading(true);
    setOtpError(false);
    try {
      const res = await authService.verifySignup(contact, val);
      if (res.success) {
        login(res.data.token, res.data.user);
        toast.success('Account created! Welcome 🎉');
        navigate('/dashboard');
      }
    } catch (err: any) {
      setOtpError(true);
      setOtp(['', '', '', '', '', '']);
      toast.error(err.response?.data?.message || 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resend > 0) return;
    setLoading(true);
    try {
      const res = await authService.signup({ name, contact, contactType: contactType!, password, role });
      if (res.success) {
        setResend(120);
        setOtp(['', '', '', '', '', '']);
        toast.success('New code sent!');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to resend');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#f9f5f0' }}>
      {/* left brand panel */}
      <div style={{
        flex: 1, background: '#4F252E',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: 48,
      }}>
        <Logo variant="light" size="lg" showTagline />
        <div style={{ marginTop: 40, maxWidth: 300, textAlign: 'center' }}>
          <p style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 18, color: 'rgba(255,247,197,0.8)', lineHeight: 1.7 }}>
            "Join thousands of Kenyans who found their perfect home through NestHop."
          </p>
          <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {['Verified landlords only', 'Real-time chat', 'Exact GPS locations'].map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <CheckCircle size={15} color="rgba(255,247,197,0.7)" />
                <span style={{ fontFamily: "'Neuton', serif", fontSize: 14, color: 'rgba(255,247,197,0.7)' }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* right form panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 24px', overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>

          <div style={{ marginBottom: 28 }}>
            <div style={{ marginBottom: 20 }}><Logo size="sm" /></div>
            <h1 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: 26, color: '#1a1a1a', marginBottom: 6 }}>
              {step === 'form' ? 'Create your account' : 'Verify your contact'}
            </h1>
            <p style={{ fontFamily: "'Neuton', serif", fontSize: 15, color: '#6b7280' }}>
              {step === 'form' ? (
                <>Already have an account?{' '}
                  <Link to="/login" style={{ color: '#4F252E', fontWeight: 700, textDecoration: 'none' }}>Sign in</Link>
                </>
              ) : `We sent a 6-digit code to ${contact}. Enter it below.`}
            </p>
          </div>

          {step === 'form' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Field label="Full Name">
                <input
                  value={name} onChange={e => setName(e.target.value)}
                  placeholder="Jane Mwangi" style={inp}
                  onFocus={e => { e.target.style.borderColor = '#4F252E'; }}
                  onBlur={e => { e.target.style.borderColor = '#d1d5db'; }}
                />
              </Field>

              <Field label="I am a...">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {(['tenant', 'landlord'] as const).map(r => (
                    <button key={r} onClick={() => setRole(r)} style={{
                      padding: '11px', borderRadius: 10,
                      border: `2px solid ${role === r ? '#4F252E' : '#e5e7eb'}`,
                      background: role === r ? '#4F252E0a' : '#fff',
                      color: role === r ? '#4F252E' : '#6b7280',
                      fontFamily: "'Neuton', serif", fontSize: 14,
                      cursor: 'pointer', transition: 'all 0.15s',
                      fontWeight: role === r ? 700 : 400,
                    }}>
                      {r === 'tenant' ? ' Tenant' : 'Landlord'}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Email or Phone">
                <PhoneEmailInput value={contact} onChange={setContact} onEnter={handleSignup} />
              </Field>

              <Field label="Password">
                <PwInput value={password} onChange={setPassword} show={showPw} onToggle={() => setShowPw(p => !p)} placeholder="Min. 6 characters" />
                {password && (
                  <div style={{ marginTop: 6 }}>
                    <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} style={{
                          flex: 1, height: 3, borderRadius: 99,
                          background: i <= strength.score ? strength.color : '#e5e7eb',
                          transition: 'background 0.2s',
                        }} />
                      ))}
                    </div>
                    {strength.label && (
                      <span style={{ fontFamily: "'Neuton', serif", fontSize: 12, color: strength.color }}>
                        {strength.label} password
                      </span>
                    )}
                  </div>
                )}
              </Field>

              <Field label="Confirm Password">
                <PwInput
                  value={confirm} onChange={setConfirm}
                  show={showCf} onToggle={() => setShowCf(p => !p)}
                  placeholder="Repeat password"
                  error={confirm.length > 0 && confirm !== password}
                />
                {confirm && confirm !== password && (
                  <p style={{ marginTop: 5, fontFamily: "'Neuton', serif", fontSize: 12, color: '#ef4444' }}>
                    Passwords do not match
                  </p>
                )}
              </Field>

              <button onClick={handleSignup} disabled={loading} style={submitBtn(loading)}>
                {loading ? 'Creating account...' : 'Create Account'}{!loading && <ArrowRight size={16} />}
              </button>
            </div>
          )}

          {step === 'otp' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <OTPInput value={otp} onChange={setOtp} onComplete={handleVerify} disabled={loading} error={otpError} />
              {expiresAt && (
                <p style={{ textAlign: 'center', fontFamily: "'Neuton', serif", fontSize: 12, color: '#9ca3af' }}>
                  Expires in {Math.max(0, Math.floor((expiresAt - Date.now()) / 60000))} min
                </p>
              )}
              <button onClick={() => handleVerify()} disabled={loading || otp.some(d => !d)} style={submitBtn(loading || otp.some(d => !d))}>
                {loading ? 'Verifying...' : 'Verify & Continue'}{!loading && <CheckCircle size={16} />}
              </button>
              <button onClick={handleResend} disabled={resend > 0 || loading} style={resendBtn(resend > 0)}>
                {resend > 0 ? `Resend in ${resend}s` : 'Resend code'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <label style={{ display: 'block', fontFamily: "'Neuton', serif", fontSize: 13, color: '#6b7280', marginBottom: 6 }}>
      {label}
    </label>
    {children}
  </div>
);

const PwInput: React.FC<{
  value: string; onChange: (v: string) => void;
  show: boolean; onToggle: () => void;
  placeholder?: string; error?: boolean;
}> = ({ value, onChange, show, onToggle, placeholder, error }) => (
  <div style={{
    display: 'flex', alignItems: 'center',
    border: `1.5px solid ${error ? '#ef4444' : '#d1d5db'}`,
    borderRadius: 12, background: '#fff',
  }}>
    <input
      type={show ? 'text' : 'password'}
      value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{ flex: 1, padding: '12px 14px', border: 'none', outline: 'none', fontFamily: "'Neuton', serif", fontSize: 15, background: 'transparent', color: '#1a1a1a' }}
    />
    <button type="button" onClick={onToggle} style={{ padding: '0 14px', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex' }}>
      {show ? <EyeOff size={17} /> : <Eye size={17} />}
    </button>
  </div>
);

const inp: React.CSSProperties = {
  width: '100%', padding: '12px 14px', borderRadius: 12,
  border: '1.5px solid #d1d5db', outline: 'none',
  fontFamily: "'Neuton', serif", fontSize: 15,
  background: '#fff', color: '#1a1a1a',
  boxSizing: 'border-box', transition: 'border-color 0.2s',
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

const resendBtn = (disabled: boolean): React.CSSProperties => ({
  background: 'none', border: 'none',
  color: disabled ? '#9ca3af' : '#4F252E',
  fontFamily: "'Neuton', serif", fontSize: 13,
  cursor: disabled ? 'not-allowed' : 'pointer',
  textAlign: 'center',
});

export default SignupPage;