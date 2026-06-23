import React, { useState } from 'react';
import { Send } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface SupportFormProps {
  onSuccess?: () => void;
  compact?: boolean;
}

const SupportForm: React.FC<SupportFormProps> = ({ onSuccess, compact = false }) => {
  const [contact, setContact] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!contact.trim() || !message.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      await api.post('/support', { contact, message });
      setSubmitted(true);
      toast.success('Support request sent!');
      setTimeout(() => onSuccess?.(), 2000);
    } catch {
      toast.error('Failed to send. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const colors = compact
    ? { bg: 'transparent', text: '#FFF7C5', border: 'rgba(255,247,197,0.3)', input: 'rgba(255,247,197,0.1)' }
    : { bg: 'var(--bg-card)', text: 'var(--text-primary)', border: 'var(--border-color)', input: 'var(--bg-secondary)' };

  if (submitted) {
    return (
      <div style={{ textAlign: 'center', padding: compact ? 16 : 24 }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
        <p style={{ fontFamily: "'Neuton', serif", fontSize: 14, color: colors.text }}>
          Your message was received. We'll get back to you shortly.
        </p>
      </div>
    );
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px', borderRadius: 8,
    border: `1.5px solid ${colors.border}`,
    background: colors.input, color: colors.text,
    fontFamily: "'Neuton', serif", fontSize: 13, outline: 'none',
  };

  return (
    <div style={{ background: colors.bg, borderRadius: compact ? 8 : 16, padding: compact ? 0 : 24 }}>
      {!compact && (
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 18, color: 'var(--text-primary)', marginBottom: 4 }}>
            Contact Support
          </h3>
          <p style={{ fontFamily: "'Neuton', serif", fontSize: 14, color: 'var(--text-secondary)' }}>
            We typically respond within 24 hours.
          </p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <input
          type="text"
          value={contact}
          onChange={e => setContact(e.target.value)}
          placeholder="Email or phone"
          style={inputStyle}
        />
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Describe your issue..."
          rows={compact ? 3 : 5}
          style={{ ...inputStyle, resize: 'vertical' }}
        />
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            padding: '10px', borderRadius: 8,
            background: compact ? '#FFF7C5' : '#4F252E',
            color: compact ? '#4F252E' : '#FFF7C5',
            border: 'none', cursor: 'pointer',
            fontFamily: "'Archivo Black', sans-serif", fontSize: 13,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          <Send size={14} />
          {loading ? 'Sending...' : 'Send Message'}
        </button>
      </div>
    </div>
  );
};

export default SupportForm;