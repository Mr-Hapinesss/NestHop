import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, CheckCircle } from 'lucide-react';
import Logo from '../components/ui/Logo';
import PhoneEmailInput from '../components/auth/PhoneEmailInput';
import OTPInput from '../components/auth/OTPInput';
import { authService } from '../services/auth.service';
import { useAuth } from '../context/AuthContext';
import { detectContactType } from '../utils/helpers';
import { toast } from '../components/ui/Toast';

type Step = 'contact' | 'otp' | 'newpass' | 'done';

const ForgotPasswordPage: React.FC = () => {
  const navigate  = useNavigate();
  const { login } = useAuth();

  const [step, setStep]             = useState<Step>('contact');
  const [contact, setContact]       = useState('');
  const [otp, setOtp]               = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError]     = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [newPw, setNewPw]           = useState('');
  const [confirmPw, setConfirmPw]   = useState('');
  const [showPw, setShowPw]         = useState(false);
  const [showCf, setShowCf]         = useState(false);
  const [loading, setLoading]       = useState(false);
  const [resend, setResend]         = useState(0);

  const contactType = detectContactType(contact);

  useEffect(() => {
    if (resend <= 0) return;
    const t = setTimeout(() => setResend(p => p - 1), 1000);
    return () => clearTimeout(t);
  }, [resend]);

  const stepLabels = ['Send code', 'Verify', 'New password'];
  const stepIdx    = ['contact', 'otp', 'newpass', 'done'].indexOf(step);

  const handleSend = async () => {
    if (!contactType) { toast.error('Enter a valid email or phone'); return; }
    setLoading(true);
    try {
      await authService.forgotPassword(contact, contactType);
      setResend(120);
      setStep('otp');
      toast.success('Reset code sent!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send code');
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
      const res = await authService.verifyResetOTP(contact, val);
      if (res.success) {
        setResetToken(res.data.resetToken);
        setStep('newpass');
      }
    } catch (err: any) {
      setOtpError(true);
      setOtp(['', '', '', '', '', '']);
      toast.error(err.response?.data?.message || 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (newPw.length < 6)    { toast.error('Password must be at least 6 characters'); return; }
    if (newPw !== confirmPw)  { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      const res = await authService.resetPassword(resetToken, newPw);
      if (res.success) {
        login(res.data.token, res.data.user);
        setStep('done');
        setTimeout(() => navigate('/dashboard'), 1800);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resend > 0 || !contactType) return;
    setLoading(true);
    try {
      await authService.forgotPassword(contact, contactType);
      setResend(120);
      setOtp(['', '', '', '', '', '']);
      toast.success('New code sent!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f9f5f0', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 36 }}>
          <Logo size="sm" />
          <Link to="/login" style={{ fontFamily: "'Neuton', serif", fontSize: 13, color: '#6b7280', textDecoration: 'none' }}>
            ← Back to login
          </Link>
        </div>

        {/* progress steps*/}
        {step !== 'done' && (
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32 }}>
            {stepLabels.map((label, i) => (
              <React.Fragment key={label}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: i < stepIdx ? '#22c55e' : i === stepIdx ? '#4F252E' : '#e5e7eb',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    transition: 'all 0.3s',
                  }}>
                    {i < stepIdx
                      ? <CheckCircle size={14} color="#fff" />
                      : <span style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: 11, color: i === stepIdx ? '#FFF7C5' : '#9ca3af' }}>{i + 1}</span>
                    }
                  </div>
                  <span style={{ fontFamily: "'Neuton', serif", fontSize: 12, color: i <= stepIdx ? '#4F252E' : '#9ca3af', whiteSpace: 'nowrap' }}>
                    {label}
                  </span>
                </div>
                {i < stepLabels.length - 1 && (
                  <div style={{ flex: 1, height: 1, background: i < stepIdx ? '#4F252E' : '#e5e7eb', margin: '0 8px', transition: 'background 0.3s' }} />
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        <div style={{ background: '#fff', borderRadius: 20, padding: '32px 28px', boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}>

          {step === 'contact' && (
            <div>
              <h1 style={h1}>Reset your password</h1>
              <p style={sub}>Enter the email or phone linked to your account.</p>
              <div style={{ marginBottom: 20 }}>
                <label style={lbl}>Email or Phone</label>
                <PhoneEmailInput value={contact} onChange={setContact} onEnter={handleSend} />
              </div>
              <button onClick={handleSend} disabled={loading || !contactType} style={btn(loading || !contactType)}>
                {loading ? 'Sending...' : 'Send Reset Code'}{!loading && <ArrowRight size={16} />}
              </button>
            </div>
          )}

          {step === 'otp' && (
            <div>
              <h1 style={h1}>Enter reset code</h1>
              <p style={sub}>6-digit code sent to <strong>{contact}</strong>. Valid for 10 minutes.</p>
              <div style={{ marginBottom: 20 }}>
                <OTPInput value={otp} onChange={setOtp} onComplete={handleVerify} disabled={loading} error={otpError} />
              </div>
              <button onClick={() => handleVerify()} disabled={loading || otp.some(d => !d)} style={btn(loading || otp.some(d => !d))}>
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>
              <button onClick={handleResend} disabled={resend > 0} style={{ ...resendStyle, marginTop: 12, opacity: resend > 0 ? 0.5 : 1 }}>
                {resend > 0 ? `Resend in ${resend}s` : 'Resend code'}
              </button>
            </div>
          )}

          {step === 'newpass' && (
            <div>
              <h1 style={h1}>Set new password</h1>
              <p style={sub}>Choose a strong password you haven't used before.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={lbl}>New Password</label>
                  <PwField value={newPw} onChange={setNewPw} show={showPw} onToggle={() => setShowPw(p => !p)} placeholder="Min. 6 characters" />
                </div>
                <div>
                  <label style={lbl}>Confirm Password</label>
                  <PwField value={confirmPw} onChange={setConfirmPw} show={showCf} onToggle={() => setShowCf(p => !p)} placeholder="Repeat password" error={confirmPw.length > 0 && confirmPw !== newPw} />
                  {confirmPw && confirmPw !== newPw && (
                    <p style={{ marginTop: 5, fontFamily: "'Neuton', serif", fontSize: 12, color: '#ef4444' }}>Passwords do not match</p>
                  )}
                </div>
                <button onClick={handleReset} disabled={loading} style={btn(loading)}>
                  {loading ? 'Resetting...' : 'Reset Password'}{!loading && <CheckCircle size={16} />}
                </button>
              </div>
            </div>
          )}

          {step === 'done' && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#22c55e18', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <CheckCircle size={32} color="#22c55e" />
              </div>
              <h1 style={{ ...h1, textAlign: 'center' }}>Password reset!</h1>
              <p style={{ ...sub, textAlign: 'center' }}>You're now signed in. Taking you to your dashboard...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const PwField: React.FC<{ value: string; onChange: (v: string) => void; show: boolean; onToggle: () => void; placeholder?: string; error?: boolean }> = ({ value, onChange, show, onToggle, placeholder, error }) => (
  <div style={{ display: 'flex', alignItems: 'center', border: `1.5px solid ${error ? '#ef4444' : '#d1d5db'}`, borderRadius: 12, background: '#fff' }}>
    <input type={show ? 'text' : 'password'} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{ flex: 1, padding: '12px 14px', border: 'none', outline: 'none', fontFamily: "'Neuton', serif", fontSize: 15, background: 'transparent', color: '#1a1a1a' }} />
    <button type="button" onClick={onToggle} style={{ padding: '0 14px', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex' }}>
      {show ? <EyeOff size={17} /> : <Eye size={17} />}
    </button>
  </div>
);

const h1: React.CSSProperties         = { fontFamily: "'Archivo Black', sans-serif", fontSize: 22, color: '#1a1a1a', marginBottom: 8 };
const sub: React.CSSProperties        = { fontFamily: "'Neuton', serif", fontSize: 14, color: '#6b7280', lineHeight: 1.6, marginBottom: 22 };
const lbl: React.CSSProperties        = { display: 'block', fontFamily: "'Neuton', serif", fontSize: 13, color: '#6b7280', marginBottom: 6 };
const resendStyle: React.CSSProperties = { width: '100%', background: 'none', border: 'none', color: '#4F252E', fontFamily: "'Neuton', serif", fontSize: 13, cursor: 'pointer', textAlign: 'center' };

const btn = (disabled: boolean): React.CSSProperties => ({
  width: '100%', padding: '13px', borderRadius: 12, border: 'none',
  background: disabled ? '#e5e7eb' : '#4F252E',
  color: disabled ? '#9ca3af' : '#FFF7C5',
  fontFamily: "'Archivo Black', sans-serif", fontSize: 15,
  cursor: disabled ? 'not-allowed' : 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  transition: 'all 0.2s',
});

export default ForgotPasswordPage;