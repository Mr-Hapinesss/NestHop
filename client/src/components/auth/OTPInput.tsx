import React, { useRef, useEffect } from 'react';

interface OTPInputProps {
  value: string[];
  onChange: (val: string[]) => void;
  onComplete?: (code: string) => void;
  disabled?: boolean;
  error?: boolean;
}

const OTPInput: React.FC<OTPInputProps> = ({ value, onChange, onComplete, disabled, error }) => {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => { refs.current[0]?.focus(); }, []);

  const handle = (i: number, raw: string) => {
    if (!/^\d*$/.test(raw)) return;
    const digit = raw.slice(-1);
    const next = [...value];
    next[i] = digit;
    onChange(next);
    if (digit && i < 5) refs.current[i + 1]?.focus();
    if (next.every(d => d) && next.join('').length === 6) onComplete?.(next.join(''));
  };

  const handleKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !value[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && i > 0) refs.current[i - 1]?.focus();
    if (e.key === 'ArrowRight' && i < 5) refs.current[i + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const next = [...value];
    pasted.split('').forEach((d, i) => { next[i] = d; });
    onChange(next);
    const focusIdx = Math.min(pasted.length, 5);
    refs.current[focusIdx]?.focus();
    if (pasted.length === 6) onComplete?.(pasted);
  };

  return (
    <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={el => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ''}
          onChange={e => handle(i, e.target.value)}
          onKeyDown={e => handleKey(i, e)}
          onPaste={handlePaste}
          disabled={disabled}
          style={{
            width: 46, height: 54,
            textAlign: 'center',
            fontFamily: "'Archivo Black', sans-serif",
            fontSize: 22,
            borderRadius: 10,
            border: `2px solid ${error ? '#ef4444' : value[i] ? '#4F252E' : '#d1d5db'}`,
            background: disabled ? '#f9fafb' : '#fff',
            color: '#1a1a1a',
            outline: 'none',
            transition: 'border-color 0.2s',
            cursor: disabled ? 'not-allowed' : 'text',
          }}
          onFocus={e => { if (!error) e.target.style.borderColor = '#4F252E'; }}
          onBlur={e => { if (!error && !value[i]) e.target.style.borderColor = '#d1d5db'; }}
        />
      ))}
    </div>
  );
};

export default OTPInput;