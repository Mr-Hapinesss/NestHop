import React, { useState, useEffect, useRef } from 'react';
import { X, ArrowRight, RefreshCw, CheckCircle, UserCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/auth.service';
import { detectContactType, HOUSE_TYPES } from '../../utils/helpers';
import PhoneEmailInput from './PhoneEmailInput';
import OTPInput from './OTPInput';
import { toast } from '../ui/Toast';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = 'contact' | 'name' | 'otp';

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login } = useAuth();
  const [step, setStep]       = useState<Step>('contact');
  const [contact, setContact] = useState('');
  const [name, setName]       = useState('');
  const [role, setRole]       = useState<'tenant' | 'landlord'>('tenant');
  const [isNew, setIsNew]     = useState(false);
  const [otp, setOtp]         = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  const contactType = detectContactType(contact);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setStep('contact'); setContact(''); setName('');
      setOtp(['', '', '', '', '', '']); setOtpError(false);
      setLoading(false); setResendTimer(0);
      clearInterval(timerRef.current);
    }
  }, [isOpen]);

  // Countdown
  useEffect(() => {
    if (resendTimer <= 0) return;
    timerRef.current = setInterval(() => {
      setResendTimer(p => { if (p <= 1) { clearInterval(timerRef.current); return 0; } return p - 1; });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [resendTimer]);

  const sendOTP = async (nm?: string, rl?: string) => {
    setLoading(true);
    try {
      const res = await authService.sendOTP(contact, contactType!, nm || name, rl || role);
      if (res.success) {
        setExpiresAt(res.data.expiresAt);
        setResendTimer(120);
        setStep('otp');
        toast.success('Verification code sent!');
      }
    } catch (err: any) {
      const msg: string = err.response?.data?.message || '';
      if (msg.toLowerCase().includes('name')) {
        setIsNew(true);
        setStep('name');
      } else {
        toast.error(msg || 'Failed to send code');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleContactNext = async () => {
    if (!contactType) { toast.error('Enter a valid email or phone number'); return; }
    await sendOTP();
  };

  const handleNameNext = async () => {
    if (!name.trim() || name.trim().length < 2) { toast.error('Enter your full name'); return; }
    await sendOTP(name, role);
  };

  const handleVerify = async (code?: string) => {
    const val = code || otp.join('');
    if (val.length !== 6) { toast.error('Enter the 6-digit code'); return; }
    setLoading(true);
    setOtpError(false);
    try {
      const res = await authService.verifyOTP(contact, val);
      if (res.success) {
        login(res.data.token, res.data.user);
        toast.success(`Welcome${res.data.user.name ? ', ' + res.data.user.name.split(' ')[0] : ''}! 🎉`);
        onClose();
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
    if (resendTimer > 0) return;
    setOtp(['', '', '', '', '', '']);
    setOtpError(false);
    await sendOTP();
  };

  if (!isOpen) return null;

  const titles: Record<Step, { h: string; sub: string }> = {
    contact: { h: 'Welcome to NestHop', sub: 'Enter your email or phone to continue' },
    name:    { h: 'Create your account', sub: 'Tell us a bit about yourself' },
    otp:     { h: 'Check your ' + (contactType === 'email' ? 'inbox' : 'messages'), sub: `We sent a 6-digit code to ${contact}` },
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)',
      padding: 20,
    }}>
      <div style={{
        background: '#fff', borderRadius: 20, padding: '36px 32px',
        width: '100%', maxWidth: 420, position: 'relative',
        boxShadow: '0 32px 80px rgba(0,0,0,0.2)',
        animation: 'fadeInUp 0.3s ease',
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: 14, right: 14,
          background: '#f3f4f6', border: 'none', borderRadius: 8,
          width: 30, height: 30, display: 'flex', alignItems: 'center',
          justifyContent: 'center', cursor: 'pointer', color: '#6b7280',
        }}>
          <X size={15} />
        </button>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: 22, color: '#4F252E', marginBottom: 6 }}>
            {titles[step].h}
          </div>
          <div style={{ fontFamily: "'Neuton', serif", fontSize: 14, color: '#6b7280', lineHeight: 1.5 }}>
            {titles[step].sub}
          </div>
          {isNew && step === 'otp' && (
            <div style={{ marginTop: 8, padding: '6px 12px', background: '#4F252E12', borderRadius: 8, fontFamily: "'Neuton', serif", fontSize: 12, color: '#4F252E' }}>
              ✨ First time? OTP verification is only needed once.
            </div>
          )}
        </div>

        {/* STEP: contact */}
        {step === 'contact' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <PhoneEmailInput
              value={contact}
              onChange={setContact}
              onEnter={handleContactNext}
              disabled={loading}
            />
            <button
              onClick={handleContactNext}
              disabled={loading || !contactType}
              style={btnStyle(!contactType || loading)}
            >
              {loading ? 'Checking...' : 'Continue'}
              {!loading && <ArrowRight size={16} />}
            </button>
            <p style={{ textAlign: 'center', fontFamily: "'Neuton', serif", fontSize: 12, color: '#9ca3af' }}>
              New users will be asked to verify once. Returning users sign in instantly.
            </p>
          </div>
        )}

        {/* STEP: name (new users only) */}
        {step === 'name' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={labelStyle}>Full Name</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', border: '1.5px solid #d1d5db', borderRadius: 12, background: '#fff' }}>
                <UserCircle size={17} color="#9ca3af" />
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleNameNext()}
                  placeholder="Jane Mwangi"
                  autoFocus
                  style={{ flex: 1, border: 'none', outline: 'none', fontFamily: "'Neuton', serif", fontSize: 15, background: 'transparent', color: '#1a1a1a' }}
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>I am a...</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {(['tenant', 'landlord'] as const).map(r => (
                  <button
                    key={r}
                    onClick={() => setRole(r)}
                    style={{
                      padding: '12px 10px', borderRadius: 10,
                      border: `2px solid ${role === r ? '#4F252E' : '#e5e7eb'}`,
                      background: role === r ? '#4F252E08' : '#fff',
                      color: role === r ? '#4F252E' : '#6b7280',
                      fontFamily: "'Neuton', serif", fontSize: 14,
                      textTransform: 'capitalize', cursor: 'pointer',
                      transition: 'all 0.15s',
                      fontWeight: role === r ? 700 : 400,
                    }}
                  >
                    {r === 'tenant' ? '🏠 Tenant' : '🏢 Landlord'}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={handleNameNext} disabled={loading || !name.trim()} style={btnStyle(!name.trim() || loading)}>
              {loading ? 'Sending code...' : 'Get Verification Code'}
              {!loading && <ArrowRight size={16} />}
            </button>
          </div>
        )}

        {/* STEP: OTP */}
        {step === 'otp' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <OTPInput
              value={otp}
              onChange={setOtp}
              onComplete={handleVerify}
              disabled={loading}
              error={otpError}
            />

            {expiresAt && (
              <p style={{ textAlign: 'center', fontFamily: "'Neuton', serif", fontSize: 12, color: '#9ca3af' }}>
                Code expires in {Math.max(0, Math.floor((expiresAt - Date.now()) / 60000))} min
              </p>
            )}

            <button
              onClick={() => handleVerify()}
              disabled={loading || otp.some(d => !d)}
              style={btnStyle(loading || otp.some(d => !d))}
            >
              {loading ? 'Verifying...' : 'Verify & Sign In'}
              {!loading && <CheckCircle size={16} />}
            </button>

            <button
              onClick={handleResend}
              disabled={resendTimer > 0 || loading}
              style={{
                background: 'none', border: 'none',
                color: resendTimer > 0 ? '#9ca3af' : '#4F252E',
                fontFamily: "'Neuton', serif", fontSize: 13,
                cursor: resendTimer > 0 ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
              }}
            >
              <RefreshCw size={13} />
              {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend code'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const btnStyle = (disabled: boolean): React.CSSProperties => ({
  width: '100%', padding: '14px', borderRadius: 12,
  background: disabled ? '#e5e7eb' : '#4F252E',
  color: disabled ? '#9ca3af' : '#FFF7C5',
  border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
  fontFamily: "'Archivo Black', sans-serif", fontSize: 15,
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  transition: 'all 0.2s',
});

const labelStyle: React.CSSProperties = {
  display: 'block', fontFamily: "'Neuton', serif",
  fontSize: 13, color: '#6b7280', marginBottom: 6,
};

export default AuthModal;