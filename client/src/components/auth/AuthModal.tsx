import React, { useState, useRef, useEffect } from 'react';
import { X, ArrowRight, RefreshCw, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/auth.service';
import { detectContactType, validateEmail, validatePhone } from '../../utils/helpers';
import toast from 'react-hot-toast';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = 'input' | 'name' | 'otp';

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login } = useAuth();
  const [step, setStep] = useState<Step>('input');
  const [contact, setContact] = useState('');
  const [name, setName] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  const [contactType, setContactType] = useState<'email' | 'phone' | null>(null);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (!isOpen) {
      setStep('input');
      setContact('');
      setName('');
      setOtp(['', '', '', '', '', '']);
      setResendTimer(0);
      clearInterval(timerRef.current);
    }
  }, [isOpen]);

  useEffect(() => {
    if (resendTimer > 0) {
      timerRef.current = setInterval(() => {
        setResendTimer(prev => {
          if (prev <= 1) { clearInterval(timerRef.current); return 0; }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [resendTimer]);

  const handleContactSubmit = async () => {
    const type = detectContactType(contact);
    if (!type) {
      toast.error('Enter a valid email or Kenyan phone number');
      return;
    }
    setContactType(type);
    setLoading(true);
    try {
      const res = await authService.sendOTP(contact, type);
      if (res.success) {
        setExpiresAt(res.data.expiresAt);
        setResendTimer(120);
        setStep('otp');
        toast.success('OTP sent!');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to send OTP';
      if (msg.includes('name') || msg.includes('new user')) {
        setIsNewUser(true);
        setStep('name');
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNameSubmit = async () => {
    if (!name.trim() || name.length < 2) {
      toast.error('Enter your full name');
      return;
    }
    setLoading(true);
    try {
      const res = await authService.sendOTP(contact, contactType!, name);
      if (res.success) {
        setExpiresAt(res.data.expiresAt);
        setResendTimer(120);
        setStep('otp');
        toast.success('OTP sent!');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
    if (newOtp.every(d => d) && newOtp.join('').length === 6) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleOTPKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (otpValue?: string) => {
    const code = otpValue || otp.join('');
    if (code.length !== 6) { toast.error('Enter the 6-digit code'); return; }
    setLoading(true);
    try {
      const res = await authService.verifyOTP(contact, code);
      if (res.success) {
        login(res.data.token, res.data.user);
        toast.success(`Welcome${res.data.user.name ? ', ' + res.data.user.name : ''}!`);
        onClose();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setLoading(true);
    try {
      const res = await authService.sendOTP(contact, contactType!, isNewUser ? name : undefined);
      if (res.success) {
        setResendTimer(120);
        setOtp(['', '', '', '', '', '']);
        toast.success('New OTP sent!');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to resend');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
      padding: 20,
    }}>
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: 20,
        padding: 36,
        width: '100%',
        maxWidth: 400,
        position: 'relative',
        boxShadow: '0 32px 80px rgba(0,0,0,0.3)',
        animation: 'fadeInUp 0.3s ease',
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 16, right: 16,
            background: 'var(--bg-secondary)', border: 'none',
            borderRadius: 8, padding: 6, cursor: 'pointer', color: 'var(--text-primary)',
          }}
        >
          <X size={16} />
        </button>

        {/* Logo */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: 22, color: '#4F252E', marginBottom: 4 }}>
            {step === 'input' ? 'Welcome to NestHop' :
             step === 'name' ? 'One last thing' : 'Verify your identity'}
          </div>
          <div style={{ fontFamily: "'Neuton', serif", fontSize: 14, color: 'var(--text-secondary)' }}>
            {step === 'input' ? 'Sign in or create an account to continue' :
             step === 'name' ? 'Tell us your name to get started' :
             `We sent a code to ${contact}`}
          </div>
        </div>

        {/* Input step */}
        {step === 'input' && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontFamily: "'Neuton', serif", fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Email or Phone Number
              </label>
              <input
                type="text"
                value={contact}
                onChange={e => setContact(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleContactSubmit()}
                placeholder="you@example.com or +254700..."
                style={{
                  width: '100%', padding: '12px 14px', borderRadius: 10,
                  border: '1.5px solid var(--border-color)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)', fontSize: 15,
                  fontFamily: "'Neuton', serif", outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => (e.target.style.borderColor = '#4F252E')}
                onBlur={e => (e.target.style.borderColor = 'var(--border-color)')}
                autoFocus
              />
            </div>
            <button
              onClick={handleContactSubmit}
              disabled={loading || !contact}
              style={{
                width: '100%', padding: '14px', borderRadius: 12,
                background: loading || !contact ? '#ccc' : '#4F252E',
                color: '#FFF7C5', border: 'none', cursor: loading || !contact ? 'not-allowed' : 'pointer',
                fontFamily: "'Archivo Black', sans-serif", fontSize: 15,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'all 0.2s',
              }}
            >
              {loading ? 'Sending...' : 'Continue'}
              {!loading && <ArrowRight size={16} />}
            </button>
          </div>
        )}

        {/* Name step */}
        {step === 'name' && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontFamily: "'Neuton', serif", fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Your Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleNameSubmit()}
                placeholder="Jane Mwangi"
                style={{
                  width: '100%', padding: '12px 14px', borderRadius: 10,
                  border: '1.5px solid var(--border-color)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)', fontSize: 15,
                  fontFamily: "'Neuton', serif", outline: 'none',
                }}
                onFocus={e => (e.target.style.borderColor = '#4F252E')}
                onBlur={e => (e.target.style.borderColor = 'var(--border-color)')}
                autoFocus
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontFamily: "'Neuton', serif", fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>
                I am a...
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {(['tenant', 'landlord'] as const).map(role => (
                  <button key={role} style={{
                    padding: '10px', borderRadius: 10,
                    border: '1.5px solid #4F252E',
                    background: 'transparent',
                    color: '#4F252E', cursor: 'pointer',
                    fontFamily: "'Neuton', serif", fontSize: 14, textTransform: 'capitalize',
                  }}>{role}</button>
                ))}
              </div>
            </div>

            <button
              onClick={handleNameSubmit}
              disabled={loading || !name.trim()}
              style={{
                width: '100%', padding: '14px', borderRadius: 12,
                background: loading || !name.trim() ? '#ccc' : '#4F252E',
                color: '#FFF7C5', border: 'none', cursor: 'pointer',
                fontFamily: "'Archivo Black', sans-serif", fontSize: 15,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              {loading ? 'Sending OTP...' : 'Get Verification Code'}
              {!loading && <ArrowRight size={16} />}
            </button>
          </div>
        )}

        {/* OTP step */}
        {step === 'otp' && (
          <div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 24 }}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={el => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleOTPChange(i, e.target.value)}
                  onKeyDown={e => handleOTPKeyDown(i, e)}
                  style={{
                    width: 48, height: 56, textAlign: 'center',
                    borderRadius: 12, border: '2px solid',
                    borderColor: digit ? '#4F252E' : 'var(--border-color)',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    fontFamily: "'Archivo Black', sans-serif", fontSize: 22,
                    outline: 'none', transition: 'border-color 0.2s',
                  }}
                  onFocus={e => (e.target.style.borderColor = '#4F252E')}
                  onBlur={e => (e.target.style.borderColor = digit ? '#4F252E' : 'var(--border-color)')}
                />
              ))}
            </div>

            {expiresAt && (
              <p style={{
                textAlign: 'center', fontFamily: "'Neuton', serif", fontSize: 12,
                color: 'var(--text-muted)', marginBottom: 16,
              }}>
                Code expires in {Math.max(0, Math.floor((expiresAt - Date.now()) / 60000))}m
              </p>
            )}

            <button
              onClick={() => handleVerify()}
              disabled={loading || otp.some(d => !d)}
              style={{
                width: '100%', padding: '14px', borderRadius: 12,
                background: loading || otp.some(d => !d) ? '#ccc' : '#4F252E',
                color: '#FFF7C5', border: 'none', cursor: 'pointer',
                fontFamily: "'Archivo Black', sans-serif", fontSize: 15,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                marginBottom: 12,
              }}
            >
              {loading ? 'Verifying...' : 'Verify Code'}
              {!loading && <CheckCircle size={16} />}
            </button>

            <button
              onClick={handleResend}
              disabled={resendTimer > 0 || loading}
              style={{
                width: '100%', padding: '10px', borderRadius: 10,
                background: 'transparent', border: 'none',
                color: resendTimer > 0 ? 'var(--text-muted)' : '#4F252E',
                cursor: resendTimer > 0 ? 'not-allowed' : 'pointer',
                fontFamily: "'Neuton', serif", fontSize: 13,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              <RefreshCw size={13} />
              {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthModal;