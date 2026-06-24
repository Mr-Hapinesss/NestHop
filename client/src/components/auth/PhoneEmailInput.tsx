import React, { useState } from 'react';
import { Mail, Phone, AlertCircle } from 'lucide-react';
import { detectContactType } from '../../utils/helpers';

interface PhoneEmailInputProps {
  value: string;
  onChange: (val: string) => void;
  onEnter?: () => void;
  disabled?: boolean;
  placeholder?: string;
}

const PhoneEmailInput: React.FC<PhoneEmailInputProps> = ({
  value, onChange, onEnter, disabled, placeholder = 'Email or phone number',
}) => {
  const [focused, setFocused] = useState(false);
  const detected = value ? detectContactType(value) : null;
  const isInvalid = value.length > 4 && !detected;

  const Icon = detected === 'email' ? Mail : detected === 'phone' ? Phone : Mail;

  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '12px 14px',
        border: `1.5px solid ${isInvalid ? '#ef4444' : focused ? '#4F252E' : '#d1d5db'}`,
        borderRadius: 12,
        background: disabled ? '#f9fafb' : '#fff',
        transition: 'border-color 0.2s',
      }}>
        <Icon size={17} color={detected ? '#4F252E' : '#9ca3af'} style={{ flexShrink: 0 }} />
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && onEnter?.()}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={disabled}
          placeholder={placeholder}
          style={{
            flex: 1, border: 'none', outline: 'none',
            fontFamily: "'Neuton', serif", fontSize: 15,
            background: 'transparent', color: '#1a1a1a',
          }}
          autoComplete="on"
          autoFocus
        />
        {detected && (
          <span style={{
            fontSize: 11, fontFamily: "'Neuton', serif",
            color: '#4F252E', background: '#4F252E12',
            padding: '2px 8px', borderRadius: 99,
            textTransform: 'capitalize', flexShrink: 0,
          }}>
            {detected}
          </span>
        )}
      </div>
      {isInvalid && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
          <AlertCircle size={12} color="#ef4444" />
          <span style={{ fontSize: 12, color: '#ef4444', fontFamily: "'Neuton', serif" }}>
            Enter a valid email or Kenyan phone (+2547...)
          </span>
        </div>
      )}
    </div>
  );
};

export default PhoneEmailInput;