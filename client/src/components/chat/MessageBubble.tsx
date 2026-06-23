import React from 'react';
import type { Message } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/helpers';

const MessageBubble: React.FC<{ message: Message; showAvatar?: boolean }> = ({ message, showAvatar = true }) => {
  const { user } = useAuth();
  const isSent = message.sender._id === user?._id;

  return (
    <div style={{
      display: 'flex',
      justifyContent: isSent ? 'flex-end' : 'flex-start',
      alignItems: 'flex-end',
      gap: 8,
      marginBottom: 8,
    }}>
      {!isSent && showAvatar && (
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          background: '#4F252E22',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Archivo Black', sans-serif", fontSize: 11, color: '#4F252E',
          flexShrink: 0,
        }}>
          {message.sender.name?.charAt(0)}
        </div>
      )}

      <div style={{ maxWidth: '70%' }}>
        {!isSent && showAvatar && (
          <div style={{ fontFamily: "'Neuton', serif", fontSize: 11, color: 'var(--text-muted)', marginBottom: 3, paddingLeft: 4 }}>
            {message.sender.name}
          </div>
        )}
        <div className={isSent ? 'msg-sent' : 'msg-received'} style={{ padding: '10px 14px', fontSize: 14, fontFamily: "'Neuton', serif", lineHeight: 1.5 }}>
          {message.content}
        </div>
        <div style={{
          fontFamily: "'Neuton', serif", fontSize: 10,
          color: 'var(--text-muted)', marginTop: 3,
          textAlign: isSent ? 'right' : 'left',
          paddingLeft: isSent ? 0 : 4,
        }}>
          {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          {isSent && <span style={{ marginLeft: 4 }}>{message.read ? '✓✓' : '✓'}</span>}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;