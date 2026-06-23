import React from 'react';
import type { Conversation } from '../../types';
import { useAuth } from '../../context/AuthContext';
import OnlineIndicator from './OnlineIndicator';
import { formatChatTime } from '../../utils/helpers';

interface ConversationListProps {
  conversations: Conversation[];
  activeId?: string;
  onSelect: (conv: Conversation) => void;
}

const ConversationList: React.FC<ConversationListProps> = ({ conversations, activeId, onSelect }) => {
  const { user } = useAuth();

  return (
    <div style={{ overflowY: 'auto', height: '100%' }}>
      {conversations.length === 0 && (
        <div style={{ padding: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>💬</div>
          <p style={{ fontFamily: "'Neuton', serif", color: 'var(--text-muted)', fontSize: 14 }}>
            No conversations yet
          </p>
        </div>
      )}
      {conversations.map(conv => {
        const other = conv.participants.find(p => p._id !== user?._id);
        const isActive = conv._id === activeId;

        return (
          <div
            key={conv._id}
            onClick={() => onSelect(conv)}
            style={{
              padding: '14px 16px',
              display: 'flex', alignItems: 'center', gap: 12,
              cursor: 'pointer',
              background: isActive ? 'rgba(79,37,46,0.08)' : 'transparent',
              borderLeft: isActive ? '3px solid #4F252E' : '3px solid transparent',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--bg-secondary)'; }}
            onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
          >
            {/* Avatar with online indicator */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                background: '#4F252E',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: "'Archivo Black', sans-serif", fontSize: 16, color: '#FFF7C5',
              }}>
                {other?.name?.charAt(0) || '?'}
              </div>
              {other && (
                <div style={{ position: 'absolute', bottom: 0, right: 0 }}>
                  <OnlineIndicator userId={other._id} />
                </div>
              )}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                <span style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {other?.name || 'Unknown'}
                </span>
                <span style={{ fontFamily: "'Neuton', serif", fontSize: 11, color: 'var(--text-muted)', flexShrink: 0, marginLeft: 8 }}>
                  {conv.lastMessage ? formatChatTime(conv.lastMessage.createdAt) : ''}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: "'Neuton', serif", fontSize: 13, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                  {conv.listing?.title || conv.lastMessage?.content || 'Start a conversation'}
                </span>
                {conv.unreadCount > 0 && (
                  <div style={{
                    width: 18, height: 18, borderRadius: '50%',
                    background: '#4F252E', color: '#FFF7C5',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: "'Archivo Black', sans-serif", fontSize: 10,
                    flexShrink: 0, marginLeft: 8,
                  }}>
                    {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ConversationList;