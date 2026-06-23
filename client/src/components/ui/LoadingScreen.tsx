import React, { useEffect, useState } from 'react';
import Logo from './Logo';

interface LoadingScreenProps {
  onComplete: () => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const messages = [
      'Scouting neighbourhoods...',
      'Gathering listings...',
      'Building your nest...',
      'Almost ready...',
    ];

    let current = 0;
    const interval = setInterval(() => {
      current += Math.random() * 18 + 4;
      if (current >= 100) {
        current = 100;
        clearInterval(interval);
        setTimeout(onComplete, 500);
      }
      setProgress(Math.min(current, 100));
      setPhase(Math.floor((current / 100) * messages.length));
    }, 180);

    return () => clearInterval(interval);
  }, [onComplete]);

  const messages = [
    'Scouting neighbourhoods...',
    'Gathering listings...',
    'Building your nest...',
    'Almost ready...',
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#FFF7C5',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        gap: 32,
      }}
    >
      {/* Animated Bird SVG */}
      <div style={{ position: 'relative', width: 200, height: 200 }}>
        <svg
          viewBox="0 0 200 200"
          width="200"
          height="200"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Sky background circle */}
          <circle cx="100" cy="100" r="90" fill="#4F252E" opacity="0.06" />

          {/* Branch */}
          <path d="M20 140 Q100 120 180 140" stroke="#4F252E" strokeWidth="4" strokeLinecap="round" fill="none" />

          {/* Nest */}
          <g style={{ transformOrigin: '100px 145px', animation: 'nestBuild 1s ease 0.5s both' }}>
            <path d="M65 145 Q100 160 135 145" stroke="#4F252E" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M68 142 Q100 155 132 142" stroke="#4F252E" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.7" />
            <path d="M72 139 Q100 150 128 139" stroke="#4F252E" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.5" />
            {/* Eggs */}
            <ellipse cx="90" cy="150" rx="8" ry="6" fill="#FFF7C5" stroke="#4F252E" strokeWidth="1.5" />
            <ellipse cx="108" cy="151" rx="7" ry="5.5" fill="#FFF7C5" stroke="#4F252E" strokeWidth="1.5" />
            <ellipse cx="99" cy="153" rx="6" ry="5" fill="#FFF7C5" stroke="#4F252E" strokeWidth="1.5" />
          </g>

          {/* Bird body - bobbing */}
          <g
            style={{
              transformOrigin: '100px 95px',
              animation: 'birdBob 1.8s ease-in-out infinite',
            }}
          >
            {/* Body */}
            <ellipse cx="100" cy="105" rx="22" ry="16" fill="#4F252E" />
            {/* Head */}
            <circle cx="118" cy="92" r="14" fill="#4F252E" />
            {/* Eye */}
            <circle cx="123" cy="89" r="3.5" fill="#FFF7C5" />
            <circle cx="124" cy="88.2" r="1.2" fill="#4F252E" />
            {/* Beak */}
            <path d="M130 91 L140 88 L130 95 Z" fill="#c4902a" />
            {/* Left wing */}
            <g style={{ transformOrigin: '88px 100px', animation: 'wingFlap 0.5s ease-in-out infinite' }}>
              <path d="M90 100 Q75 88 62 95 Q70 108 90 108 Z" fill="#4F252E" opacity="0.85" />
            </g>
            {/* Breast highlight */}
            <ellipse cx="104" cy="108" rx="12" ry="9" fill="#6b3340" opacity="0.5" />
            {/* Tail feathers */}
            <path d="M80 112 L60 106 M80 114 L60 118 M80 116 L62 128" stroke="#4F252E" strokeWidth="3" strokeLinecap="round" />
            {/* Feet */}
            <path d="M92 119 L88 128 M88 128 L83 132 M88 128 L92 132" stroke="#4F252E" strokeWidth="2" strokeLinecap="round" />
            <path d="M108 120 L104 129 M104 129 L99 133 M104 129 L108 133" stroke="#4F252E" strokeWidth="2" strokeLinecap="round" />
          </g>

          {/* Floating twigs being carried */}
          <g style={{ animation: 'fadeInUp 1s ease 0.3s both' }}>
            <path d="M140 70 L155 58" stroke="#4F252E" strokeWidth="2.5" strokeLinecap="round" opacity="0.4" />
            <path d="M148 62 L162 55" stroke="#4F252E" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
          </g>
        </svg>
      </div>

      {/* Logo */}
      <Logo size="lg" />

      {/* Loading section */}
      <div style={{ width: 280, textAlign: 'center' }}>
        <p
          style={{
            fontFamily: "'Neuton', serif",
            fontSize: 14,
            color: '#4F252E',
            opacity: 0.7,
            marginBottom: 12,
            minHeight: 20,
          }}
        >
          {messages[Math.min(phase, messages.length - 1)]}
        </p>

        {/* Progress bar track */}
        <div
          style={{
            width: '100%',
            height: 6,
            background: 'rgba(79, 37, 46, 0.15)',
            borderRadius: 99,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #4F252E, #c4902a)',
              borderRadius: 99,
              transition: 'width 0.2s ease',
            }}
          />
        </div>

        <p
          style={{
            fontFamily: "'Archivo Black', sans-serif",
            fontSize: 11,
            color: '#4F252E',
            opacity: 0.4,
            marginTop: 8,
          }}
        >
          {Math.round(progress)}%
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;