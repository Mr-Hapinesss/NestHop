import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, X, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastProps {
  toast: ToastMessage;
  onRemove: (id: string) => void;
}

const config = {
  success: { icon: CheckCircle, color: '#22c55e', bg: '#f0fdf4', border: '#bbf7d0' },
  error:   { icon: XCircle,     color: '#ef4444', bg: '#fef2f2', border: '#fecaca' },
  warning: { icon: AlertCircle, color: '#f59e0b', bg: '#fffbeb', border: '#fde68a' },
  info:    { icon: Info,        color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe' },
};

const Toast: React.FC<ToastProps> = ({ toast, onRemove }) => {
  const [visible, setVisible] = useState(false);
  const { icon: Icon, color, bg, border } = config[toast.type];

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onRemove(toast.id), 300);
    }, toast.duration ?? 4000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '12px 14px', borderRadius: 12,
      background: bg, border: `1px solid ${border}`,
      boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
      minWidth: 260, maxWidth: 360,
      transform: visible ? 'translateX(0)' : 'translateX(110%)',
      opacity: visible ? 1 : 0,
      transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
    }}>
      <Icon size={18} color={color} style={{ flexShrink: 0 }} />
      <span style={{
        flex: 1, fontFamily: "'Neuton', serif", fontSize: 14,
        color: '#1a1a1a', lineHeight: 1.4,
      }}>{toast.message}</span>
      <button
        onClick={() => onRemove(toast.id)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 2, display: 'flex' }}
      >
        <X size={14} />
      </button>
    </div>
  );
};

// Toast container — mount once in App
let _addToast: ((t: Omit<ToastMessage, 'id'>) => void) | null = null;

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    _addToast = (t) => {
      const id = Math.random().toString(36).slice(2);
      setToasts(prev => [...prev, { ...t, id }]);
    };
    return () => { _addToast = null; };
  }, []);

  const remove = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));

  return (
    <div style={{
      position: 'fixed', top: 20, right: 20, zIndex: 9999,
      display: 'flex', flexDirection: 'column', gap: 10,
      pointerEvents: 'none',
    }}>
      {toasts.map(t => (
        <div key={t.id} style={{ pointerEvents: 'all' }}>
          <Toast toast={t} onRemove={remove} />
        </div>
      ))}
    </div>
  );
};

// Imperative API — use anywhere
export const toast = {
  success: (message: string, duration?: number) => 
    _addToast?.({ type: 'success', message, ...(duration !== undefined ? { duration } : {}) }),
    
  error: (message: string, duration?: number) => 
    _addToast?.({ type: 'error', message, ...(duration !== undefined ? { duration } : {}) }),
    
  warning: (message: string, duration?: number) => 
    _addToast?.({ type: 'warning', message, ...(duration !== undefined ? { duration } : {}) }),
    
  info: (message: string, duration?: number) => 
    _addToast?.({ type: 'info', message, ...(duration !== undefined ? { duration } : {}) }),
};