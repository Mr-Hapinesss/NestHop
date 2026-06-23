import React from 'react';
import { useSocket } from '../../context/SocketContext';

interface OnlineIndicatorProps {
  userId: string;
  showLabel?: boolean;
}

const OnlineIndicator: React.FC<OnlineIndicatorProps> = ({ userId, showLabel = false }) => {
  const { onlineUsers } = useSocket();
  const isOnline = onlineUsers.has(userId);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <div style={{
        width: 8, height: 8, borderRadius: '50%',
        background: isOnline ? '#22c55e' : '#9ca3af',
        boxShadow: isOnline ? '0 0 0 2px #dcfce7' : undefined,
        transition: 'all 0.3s',
      }} />
      {showLabel && (
        <span style={{
          fontFamily: "'Neuton', serif", fontSize: 12,
          color: isOnline ? '#22c55e' : 'var(--text-muted)',
        }}>
          {isOnline ? 'Online' : 'Offline'}
        </span>
      )}
    </div>
  );
};

export default OnlineIndicator;