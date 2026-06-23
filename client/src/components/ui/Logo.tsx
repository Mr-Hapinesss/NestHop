import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'light' | 'dark';
  showTagline?: boolean;
}

const Logo: React.FC<LogoProps> = ({ size = 'md', variant = 'default', showTagline = false }) => {
  const sizes = {
    sm: { bird: 24, text: 18, tag: 10 },
    md: { bird: 36, text: 26, tag: 12 },
    lg: { bird: 52, text: 38, tag: 14 },
  };
  const s = sizes[size];

  const primary = variant === 'light' ? '#FFF7C5' : '#4F252E';
  const accent = variant === 'light' ? '#4F252E' : '#FFF7C5';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {/* Bird SVG */}
      <svg
        width={s.bird}
        height={s.bird}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Nest base */}
        <ellipse cx="24" cy="38" rx="18" ry="5" fill={primary} opacity="0.15" />
        {/* Nest twigs */}
        <path d="M8 38 Q16 32 24 34 Q32 32 40 38" stroke={primary} strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M10 36 Q18 30 24 32 Q30 30 38 36" stroke={primary} strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6" />
        {/* Nest bowl */}
        <path d="M12 37 Q24 44 36 37" stroke={primary} strokeWidth="2.5" strokeLinecap="round" fill="none" />
        {/* Bird body */}
        <ellipse cx="24" cy="24" rx="8" ry="6" fill={primary} />
        {/* Bird head */}
        <circle cx="31" cy="20" r="5" fill={primary} />
        {/* Eye */}
        <circle cx="33" cy="19" r="1.2" fill={accent} />
        <circle cx="33.4" cy="18.6" r="0.4" fill={primary} />
        {/* Beak */}
        <path d="M36 20 L39 19 L36 21 Z" fill={accent} />
        {/* Wing */}
        <path d="M17 23 Q20 17 27 20" stroke={accent} strokeWidth="2" strokeLinecap="round" fill="none" />
        {/* Tail */}
        <path d="M16 25 L10 22 M16 26 L10 28" stroke={primary} strokeWidth="2" strokeLinecap="round" />
        {/* Egg in nest */}
        <ellipse cx="24" cy="36" rx="4" ry="3" fill={accent} opacity="0.8" />
        <ellipse cx="21" cy="36" rx="3" ry="2.5" fill={accent} opacity="0.6" />
      </svg>

      {/* Wordmark */}
      <div>
        <div
          style={{
            fontFamily: "'Archivo Black', sans-serif",
            fontSize: s.text,
            color: primary,
            lineHeight: 1,
            letterSpacing: '-0.02em',
          }}
        >
          Nest<span style={{ color: accent === '#FFF7C5' ? '#c4902a' : '#4F252E' }}>Hop</span>
        </div>
        {showTagline && (
          <div
            style={{
              fontFamily: "'Neuton', serif",
              fontSize: s.tag,
              color: primary,
              opacity: 0.6,
              marginTop: 2,
              letterSpacing: '0.05em',
            }}
          >
            Find your perfect nest
          </div>
        )}
      </div>
    </div>
  );
};

export default Logo;