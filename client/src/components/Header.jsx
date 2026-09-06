import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, Check, LogOut, Users, MessageSquare } from 'lucide-react';

export const Header = ({
  roomId,
  myRole,
  username,
  participantCount = 0,
  unreadCount = 0,
  isParticipantsOpen = false,
  isChatOpen = false,
  onToggleParticipants,
  onToggleChat
}) => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    const roomUrl = window.location.href;
    navigator.clipboard.writeText(roomUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLeaveRoom = () => {
    navigate('/');
  };

  const formatRoleName = (role) => {
    if (role === 'host') return 'Host';
    if (role === 'moderator') return 'Moderator';
    return 'Participant';
  };

  return (
    <header className="solid-card" style={{ padding: '8px 16px', marginBottom: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <h1 style={{ fontSize: '1.15rem', fontWeight: '800', lineHeight: 1.1 }}>WatchTogether</h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            backgroundColor: '#f1f5f9',
            border: '1px solid #e2e8f0',
            borderRadius: 'var(--radius-sm)',
            padding: '4px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ROOM:</span>
            <strong style={{ letterSpacing: '0.05em', color: 'var(--primary)', fontFamily: 'monospace', fontSize: '0.85rem' }}>{roomId}</strong>
          </div>

          <button className="btn-secondary" onClick={handleCopyLink} style={{ fontSize: '0.8rem', padding: '4px 10px' }}>
            {copied ? <Check size={14} color="#059669" /> : <Copy size={14} />}
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          
          <button
            className="btn-secondary"
            onClick={onToggleParticipants}
            style={{
              position: 'relative',
              padding: '6px 10px',
              backgroundColor: isParticipantsOpen ? '#e0e7ff' : '#ffffff',
              borderColor: isParticipantsOpen ? 'var(--primary)' : 'var(--border-card)'
            }}
            title="Toggle Participants Panel"
          >
            <Users size={16} color="var(--primary)" />
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{participantCount}</span>
          </button>

          <button
            className="btn-secondary"
            onClick={onToggleChat}
            style={{
              position: 'relative',
              padding: '6px 10px',
              backgroundColor: isChatOpen ? '#e0e7ff' : '#ffffff',
              borderColor: isChatOpen ? 'var(--primary)' : 'var(--border-card)'
            }}
            title="Toggle Chat Panel"
          >
            <MessageSquare size={16} color="var(--accent-pink)" />
            {unreadCount > 0 && !isChatOpen && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                backgroundColor: '#ef4444',
                color: '#ffffff',
                fontSize: '0.65rem',
                fontWeight: '700',
                borderRadius: '50%',
                width: '16px',
                height: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginLeft: '4px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '600', lineHeight: 1.1 }}>{username}</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{formatRoleName(myRole)}</span>
          </div>

          <button
            className="btn-secondary"
            onClick={handleLeaveRoom}
            style={{
              borderColor: '#fca5a5',
              color: '#dc2626',
              padding: '6px 10px'
            }}
            title="Leave Room"
          >
            <LogOut size={14} />
          </button>

        </div>

      </div>
    </header>
  );
};
