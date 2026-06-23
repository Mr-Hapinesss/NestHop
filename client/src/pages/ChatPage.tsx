import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Menu, MessageCircle } from 'lucide-react';
import { chatService } from '../services/chat.service';
import ConversationList from '../components/chat/ConversationList';
import ChatWindow from '../components/chat/ChatWindow';
import Logo from '../components/ui/Logo';
import Sidebar from '../components/ui/Sidebar';
import type { Conversation } from '../types';

const ChatPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [active, setActive] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showList, setShowList] = useState(true);

  useEffect(() => {
    chatService.getConversations()
      .then(res => {
        if (res.success) {
          setConversations(res.data);
          const convId = searchParams.get('conv');
          if (convId) {
            const found = res.data.find(c => c._id === convId);
            if (found) { setActive(found); setShowList(false); }
          }
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = (conv: Conversation) => {
    setActive(conv);
    setShowList(false);
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <header style={{
        background: 'var(--bg-primary)',
        borderBottom: '1px solid var(--border-color)',
        padding: '0 24px', height: 64, flexShrink: 0,
        display: 'flex', alignItems: 'center', gap: 16,
        zIndex: 30,
      }}>
        <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', padding: 6 }}>
          <Menu size={22} />
        </button>
        <Logo size="sm" />
        <div style={{ flex: 1 }} />
        <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: 15, color: 'var(--text-primary)' }}>
          Messages
        </div>
      </header>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Conversation list */}
        <div style={{
          width: 320, flexShrink: 0,
          borderRight: '1px solid var(--border-color)',
          background: 'var(--bg-card)',
          display: window.innerWidth < 768 && !showList ? 'none' : 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          <div style={{ padding: '16px 16px 8px', borderBottom: '1px solid var(--border-color)' }}>
            <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
              Conversations
            </h2>
          </div>
          {loading ? (
            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} style={{ height: 60, borderRadius: 10, background: 'var(--bg-secondary)', animation: 'pulse-soft 1.5s ease infinite' }} />
              ))}
            </div>
          ) : (
            <ConversationList
              conversations={conversations}
              activeId={active?._id ?? ''}
              onSelect={handleSelect}
            />
          )}
        </div>

        {/* Chat window */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {active ? (
            <ChatWindow
              conversation={active}
              {...(window.innerWidth < 768 && { onBack: () => setShowList(true) })}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12 }}>
              <MessageCircle size={48} style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
              <p style={{ fontFamily: "'Neuton', serif", fontSize: 16, color: 'var(--text-muted)' }}>
                Select a conversation to start chatting
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;