import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, ArrowLeft, Home } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { chatService } from '../../services/chat.service';
import MessageBubble from './MessageBubble';
import OnlineIndicator from './OnlineIndicator';
import type { Conversation, Message } from '../../types';

interface ChatWindowProps {
  conversation: Conversation;
  onBack?: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ conversation, onBack }) => {
  const { socket } = useSocket();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isTypingRef = useRef(false);
  const typingTimeout = useRef<ReturnType<typeof setTimeout>>();

  const other = conversation.participants.find(p => p._id !== user?._id);

  const loadMessages = useCallback(async (p = 1) => {
    try {
      const res = await chatService.getMessages(conversation._id, p);
      if (res.success) {
        if (p === 1) {
          setMessages(res.data.messages);
          setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'instant' }), 50);
        } else {
          setMessages(prev => [...res.data.messages, ...prev]);
        }
        setHasMore(res.data.hasMore);
      }
    } finally {
      setLoading(false);
    }
  }, [conversation._id]);

  useEffect(() => {
    setLoading(true);
    setPage(1);
    loadMessages(1);
    chatService.markRead(conversation._id);
  }, [conversation._id, loadMessages]);

  useEffect(() => {
    if (!socket) return;
    socket.emit('chat:join', conversation._id);

    const handleNew = (msg: Message) => {
      if (msg.conversationId === conversation._id) {
        setMessages(prev => [...prev, msg]);
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
        chatService.markRead(conversation._id);
      }
    };

    socket.on('chat:message', handleNew);
    return () => {
      socket.off('chat:message', handleNew);
      socket.emit('chat:leave', conversation._id);
    };
  }, [socket, conversation._id]);

  const handleSend = async () => {
    const content = input.trim();
    if (!content || sending) return;
    setInput('');
    setSending(true);
    try {
      socket?.emit('chat:send', {
        conversationId: conversation._id,
        content,
        recipientId: other?._id,
      });
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleTyping = () => {
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      socket?.emit('chat:typing', { conversationId: conversation._id, isTyping: true });
    }
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      isTypingRef.current = false;
      socket?.emit('chat:typing', { conversationId: conversation._id, isTyping: false });
    }, 1500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex', alignItems: 'center', gap: 12,
        flexShrink: 0,
      }}>
        {onBack && (
          <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', padding: 4 }}>
            <ArrowLeft size={20} />
          </button>
        )}

        <div style={{ position: 'relative' }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            background: '#4F252E',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Archivo Black', sans-serif", fontSize: 15, color: '#FFF7C5',
          }}>
            {other?.name?.charAt(0)}
          </div>
          {other && <div style={{ position: 'absolute', bottom: 0, right: 0 }}><OnlineIndicator userId={other._id} /></div>}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
            {other?.name}
          </div>
          {other && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <OnlineIndicator userId={other._id} showLabel />
            </div>
          )}
        </div>

        {conversation.listing && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'var(--bg-secondary)',
            padding: '6px 10px', borderRadius: 8,
            fontFamily: "'Neuton', serif", fontSize: 12, color: 'var(--text-secondary)',
            maxWidth: 180, overflow: 'hidden',
          }}>
            <Home size={12} style={{ flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {conversation.listing.title}
            </span>
          </div>
        )}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
        {hasMore && (
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <button
              onClick={() => { const next = page + 1; setPage(next); loadMessages(next); }}
              style={{ fontFamily: "'Neuton', serif", fontSize: 13, color: '#4F252E', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Load older messages
            </button>
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{
                height: 40, width: `${40 + Math.random() * 40}%`,
                borderRadius: 12, background: 'var(--bg-secondary)',
                alignSelf: i % 2 === 0 ? 'flex-start' : 'flex-end',
                animation: 'pulse-soft 1.5s ease infinite',
              }} />
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>👋</div>
            <p style={{ fontFamily: "'Neuton', serif", color: 'var(--text-muted)', fontSize: 14 }}>
              Start the conversation about {conversation.listing?.title}
            </p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <MessageBubble
              key={msg._id}
              message={msg}
              showAvatar={i === 0 || messages[i - 1]?.sender._id !== msg.sender._id}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '12px 16px',
        background: 'var(--bg-card)',
        borderTop: '1px solid var(--border-color)',
        display: 'flex', gap: 10, alignItems: 'center',
        flexShrink: 0,
      }}>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => { setInput(e.target.value); handleTyping(); }}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder="Type a message..."
          style={{
            flex: 1, padding: '12px 16px', borderRadius: 24,
            border: '1.5px solid var(--border-color)',
            background: 'var(--bg-secondary)', color: 'var(--text-primary)',
            fontFamily: "'Neuton', serif", fontSize: 14, outline: 'none',
          }}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || sending}
          style={{
            width: 44, height: 44, borderRadius: '50%',
            background: input.trim() ? '#4F252E' : 'var(--border-color)',
            border: 'none', cursor: input.trim() ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s', color: '#FFF7C5',
          }}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;