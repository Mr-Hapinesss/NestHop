import React, { useState } from 'react';
import { Send } from 'lucide-react';
import api from '../../services/api';
import { toast } from '../ui/Toast';

interface CompactColors {
  text: string; border: string; input: string; bg: string; btn: string; btnText: string;
}

interface SupportFormProps {
  onSuccess?: () => void;
  compact?: boolean;
  compactColors?: CompactColors;
}

const SupportForm: React.FC<SupportFormProps> = ({ onSuccess, compact = false, compactColors }) => {
  const [contact, setContact] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const cc = compactColors;
  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px', borderRadius: 8,
    border: `1.5px solid ${cc?.border ?? 'var(--border-color)'}`,
    background: cc?.input ?? 'var(--bg-secondary)',
    color: cc?.text ?? 'var(--text-primary)',
    fontFamily: "'Neuton', serif", fontSize: 13, outline: 'none',
  };

  const handleSubmit = async () => {
    if (!contact.trim() || !message.trim()) { toast.error('Fill in all fields'); return; }
    setLoading(true);
    try {
      await api.post('/support', { contact, message });
      setDone(true);
      toast.success('Message sent! We\'ll get back to you soon.');
      if (onSuccess) setTimeout(onSuccess, 1800);
    } catch {
      toast.error('Failed to send. Try again.');
    } finally {
      setLoading(false);
    }
  };

  if (done) return (
    <div style={{ textAlign: 'center', padding: 16 }}>
      <div style={{ fontSize: 28, marginBottom: 6 }}>✅</div>
      <p style={{ fontFamily: "'Neuton', serif", fontSize: 13, color: cc?.text ?? 'var(--text-secondary)' }}>
        Request received!
      </p>
    </div>
  );

  return (
    <div style={{ background: cc?.bg ?? (compact ? 'transparent' : 'var(--bg-card)'), borderRadius: compact ? 0 : 16, padding: compact ? 0 : 24 }}>
      {!compact && (
        <div style={{ marginBottom: 18 }}>
          <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 17, color: 'var(--text-primary)', marginBottom: 4 }}>Contact Support</h3>
          <p style={{ fontFamily: "'Neuton', serif", fontSize: 13, color: 'var(--text-secondary)' }}>We typically respond within 24 hours.</p>
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <input type="text" value={contact} onChange={e => setContact(e.target.value)} placeholder="Email or phone" style={inputStyle} />
        <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Describe your issue..." rows={compact ? 3 : 5} style={{ ...inputStyle, resize: 'vertical' }} />
        <button onClick={handleSubmit} disabled={loading} style={{
          padding: '10px', borderRadius: 8, border: 'none',
          background: cc?.btn ?? '#4F252E',
          color: cc?.btnText ?? '#FFF7C5',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontFamily: "'Archivo Black', sans-serif", fontSize: 13,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
          opacity: loading ? 0.7 : 1,
        }}>
          <Send size={13} />
          {loading ? 'Sending...' : 'Send Message'}
        </button>
      </div>
    </div>
  );
};

export default SupportForm;