import React, { useState } from 'react';
import { Users, MoreVertical, Shield, User, Crown, UserX } from 'lucide-react';

export const ParticipantList = ({
  participants = [],
  currentUserId,
  myRole,
  onAssignRole,
  onRemoveParticipant,
  onTransferHost,
  onClose
}) => {
  const [activeMenuUserId, setActiveMenuUserId] = useState(null);

  const isHost = myRole === 'host';

  const formatRoleName = (role) => {
    if (role === 'host') return 'Host';
    if (role === 'moderator') return 'Moderator';
    return 'Participant';
  };

  const sortedParticipants = [...participants].sort((a, b) => {
    const weights = { host: 1, moderator: 2, participant: 3 };
    return (weights[a.role] || 9) - (weights[b.role] || 9);
  });

  return (
    <div className="solid-card" style={{ padding: '14px', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: '10px',
        borderBottom: '1px solid var(--border-card)',
        marginBottom: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users size={18} color="var(--primary)" />
          <h3 style={{ fontSize: '0.95rem', fontWeight: '700' }}>Participants</h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            backgroundColor: '#eeef2',
            color: 'var(--primary)',
            fontSize: '0.75rem',
            fontWeight: '700',
            padding: '2px 8px',
            borderRadius: 'var(--radius-full)'
          }}>
            {participants.length}
          </span>
          {onClose && (
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: 'var(--text-muted)' }}>
              ✕
            </button>
          )}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', paddingRight: '2px' }}>
        {sortedParticipants.map((p) => {
          const isMe = p.userId === currentUserId;
          const showActions = isHost && !isMe;

          return (
            <div
              key={p.socketId || p.userId}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                backgroundColor: isMe ? '#f8fafc' : '#ffffff',
                border: '1px solid var(--border-card)',
                borderRadius: 'var(--radius-sm)',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-main)' }}>
                  {p.username} {isMe && '(You)'}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {formatRoleName(p.role)}
                </span>
              </div>

              {showActions && (
                <div style={{ position: 'relative' }}>
                  <button
                    className="btn-secondary"
                    onClick={() => setActiveMenuUserId(activeMenuUserId === p.userId ? null : p.userId)}
                    style={{ padding: '4px 8px', borderRadius: '4px' }}
                    title="Actions"
                  >
                    <MoreVertical size={16} />
                  </button>

                  {activeMenuUserId === p.userId && (
                    <div
                      className="solid-card"
                      style={{
                        position: 'absolute',
                        right: 0,
                        top: '100%',
                        marginTop: '4px',
                        zIndex: 100,
                        width: '180px',
                        padding: '6px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        backgroundColor: '#ffffff'
                      }}
                    >
                      {p.role === 'participant' ? (
                        <button
                          className="btn-secondary"
                          onClick={() => {
                            onAssignRole(p.userId, 'moderator');
                            setActiveMenuUserId(null);
                          }}
                          style={{ justifyContent: 'flex-start', fontSize: '0.8rem', width: '100%' }}
                        >
                          <Shield size={14} color="#3b82f6" /> Make Moderator
                        </button>
                      ) : (
                        <button
                          className="btn-secondary"
                          onClick={() => {
                            onAssignRole(p.userId, 'participant');
                            setActiveMenuUserId(null);
                          }}
                          style={{ justifyContent: 'flex-start', fontSize: '0.8rem', width: '100%' }}
                        >
                          <User size={14} /> Make Participant
                        </button>
                      )}

                      <button
                        className="btn-secondary"
                        onClick={() => {
                          onTransferHost(p.userId);
                          setActiveMenuUserId(null);
                        }}
                        style={{ justifyContent: 'flex-start', fontSize: '0.8rem', width: '100%', color: '#ef4444' }}
                      >
                        <Crown size={14} /> Transfer Host
                      </button>

                      <button
                        className="btn-secondary"
                        onClick={() => {
                          onRemoveParticipant(p.userId);
                          setActiveMenuUserId(null);
                        }}
                        style={{ justifyContent: 'flex-start', fontSize: '0.8rem', width: '100%', color: '#ef4444' }}
                      >
                        <UserX size={14} /> Remove User
                      </button>
                    </div>
                  )}
                </div>
              )}

            </div>
          );
        })}
      </div>

    </div>
  );
};
