import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: 99,
        padding: '6px 10px',
        cursor: 'pointer',
        color: 'var(--text-primary)',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 12,
        fontFamily: "'Neuton', serif",
        transition: 'all 0.2s',
      }}
      title="Toggle theme"
    >
      {resolvedTheme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
      {resolvedTheme === 'dark' ? 'Light' : 'Dark'}
    </button>
  );
};

export default ThemeToggle;