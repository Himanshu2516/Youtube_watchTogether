import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send } from 'lucide-react';

export const Chat = ({ messages = [], onSendMessage, currentUserId, onClose }) => {
  const [text, setText] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSendMessage(text);
    setText('');
  };

  return (
    <div className="solid-card" style={{ padding: '16px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: '12px',
        borderBottom: '1px solid var(--border-card)',
        marginBottom: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MessageSquare size={18} color="var(--accent-pink)" />
          <h3 style={{ fontSize: '1rem', fontWeight: '700' }}>Room Chat</h3>
        </div>
        {onClose && (
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: 'var(--text-muted)' }}>
            ✕
          </button>
        )}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '4px' }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', margin: 'auto' }}>
            No messages yet. Say hello! 👋
          </div>
        ) : (
          messages.map((msg) => {
            if (msg.isSystem) {
              return (
                <div
                  key={msg.id}
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    textAlign: 'center',
                    fontStyle: 'italic',
                    padding: '4px 0',
                    borderTop: '1px dashed var(--border-card)'
                  }}
                >
                  {msg.text}
                </div>
              );
            }

            const isMe = msg.userId === currentUserId;

            return (
              <div
                key={msg.id}
                style={{
                  alignSelf: isMe ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  backgroundColor: isMe ? 'var(--primary)' : '#f1f5f9',
                  color: isMe ? '#ffffff' : 'var(--text-main)',
                  padding: '8px 12px',
                  borderRadius: '12px',
                  borderBottomRightRadius: isMe ? '2px' : '12px',
                  borderBottomLeftRadius: isMe ? '12px' : '2px',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                {!isMe && (
                  <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--accent-cyan)', marginBottom: '2px' }}>
                    {msg.username}
                  </div>
                )}
                <div style={{ fontSize: '0.85rem', wordBreak: 'break-word' }}>
                  {msg.text}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
        <input
          type="text"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{
            flex: 1,
            padding: '8px 12px',
            backgroundColor: '#f8fafc',
            border: '1px solid var(--border-card)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-main)',
            fontSize: '0.85rem'
          }}
        />
        <button type="submit" className="btn-primary" style={{ padding: '8px 12px' }} title="Send Message">
          <Send size={16} />
        </button>
      </form>

    </div>
  );
};
