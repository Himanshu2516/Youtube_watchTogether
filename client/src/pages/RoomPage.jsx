import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useRoom } from '../hooks/useRoom';
import { Header } from '../components/Header';
import { Player } from '../components/Player';
import { UrlInputForm } from '../components/UrlInputForm';
import { ParticipantList } from '../components/ParticipantList';
import { Chat } from '../components/Chat';
import { Toast } from '../components/Toast';
import { AlertTriangle, Home } from 'lucide-react';

export const RoomPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { serverError, clearServerError } = useSocket();

  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState('');
  const [duration, setDuration] = useState(0);

  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const prevMessagesLength = useRef(0);

  const [inputName, setInputName] = useState('');
  const [nameError, setNameError] = useState('');

  useEffect(() => {
    let storedUserId = localStorage.getItem('watchparty_userid');
    if (!storedUserId) {
      storedUserId = `usr_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      localStorage.setItem('watchparty_userid', storedUserId);
    }
    setUserId(storedUserId);

    let storedUsername = localStorage.getItem('watchparty_username');
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  const cleanRoomId = roomId ? String(roomId).replace(/\D/g, '') : '';

  const {
    participants,
    myRole,
    videoId,
    playState,
    currentTime,
    chatMessages,
    reactions,
    isKicked,
    actions
  } = useRoom(cleanRoomId, username, userId);

  useEffect(() => {
    if (chatMessages.length > prevMessagesLength.current) {
      const newCount = chatMessages.length - prevMessagesLength.current;
      if (!isChatOpen) {
        setUnreadCount(prev => prev + newCount);
      }
    }
    prevMessagesLength.current = chatMessages.length;
  }, [chatMessages, isChatOpen]);

  const handleToggleChat = () => {
    const nextState = !isChatOpen;
    setIsChatOpen(nextState);
    if (nextState) {
      setUnreadCount(0);
    }
  };

  const handleToggleParticipants = () => {
    setIsParticipantsOpen(prev => !prev);
  };

  const handleNameSubmit = (e) => {
    e.preventDefault();
    const trimmed = inputName.trim();
    if (!trimmed) {
      setNameError('Please enter a display name');
      return;
    }
    localStorage.setItem('watchparty_username', trimmed);
    setUsername(trimmed);
  };

  if (!cleanRoomId || cleanRoomId.length !== 10) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        backgroundColor: 'var(--bg-page)'
      }}>
        <div className="solid-card" style={{ padding: '32px', maxWidth: '420px', textAlign: 'center' }}>
          <AlertTriangle size={40} color="#ef4444" style={{ marginBottom: '12px' }} />
          <h2 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>Room Not Found</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '0.9rem' }}>
            The room link or code you entered is invalid.
          </p>
          <button className="btn-primary" onClick={() => navigate('/')} style={{ width: '100%' }}>
            <Home size={16} /> Return to Home
          </button>
        </div>
      </div>
    );
  }

  if (!username) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        backgroundColor: 'var(--bg-page)'
      }}>
        <div className="solid-card" style={{ padding: '32px', maxWidth: '420px', width: '100%' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '8px', textAlign: 'center' }}>
            Join Together
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px', textAlign: 'center' }}>
            Enter your name to join room #{cleanRoomId}
          </p>

          <form onSubmit={handleNameSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '8px', color: 'var(--text-main)' }}>
                Your Name
              </label>
              <input
                type="text"
                placeholder="Enter your name..."
                value={inputName}
                onChange={(e) => {
                  setInputName(e.target.value);
                  if (nameError) setNameError('');
                }}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  backgroundColor: '#f8fafc',
                  border: nameError ? '1px solid #ef4444' : '1px solid var(--border-card)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-main)',
                  fontSize: '1rem',
                  boxSizing: 'border-box'
                }}
              />
              {nameError && (
                <div style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '6px' }}>
                  {nameError}
                </div>
              )}
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '12px', fontSize: '1rem' }}>
              Join Room
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (isKicked) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        backgroundColor: 'var(--bg-page)'
      }}>
        <div className="solid-card" style={{ padding: '32px', maxWidth: '420px', textAlign: 'center' }}>
          <AlertTriangle size={40} color="#ef4444" style={{ marginBottom: '12px' }} />
          <h2 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>Removed from Room</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '0.9rem' }}>
            The room host has removed you from this watch party session.
          </p>
          <button className="btn-primary" onClick={() => navigate('/')} style={{ width: '100%' }}>
            <Home size={16} /> Return to Home
          </button>
        </div>
      </div>
    );
  }

  const isAnyPanelOpen = isParticipantsOpen || isChatOpen;

  return (
    <div style={{
      height: '100vh',
      maxHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      padding: '8px 14px',
      maxWidth: '1600px',
      margin: '0 auto',
      backgroundColor: 'var(--bg-page)',
      boxSizing: 'border-box',
      overflow: 'hidden'
    }}>
      
      <Header
        roomId={cleanRoomId}
        myRole={myRole}
        username={username}
        participantCount={participants.length}
        unreadCount={unreadCount}
        isParticipantsOpen={isParticipantsOpen}
        isChatOpen={isChatOpen}
        onToggleParticipants={handleToggleParticipants}
        onToggleChat={handleToggleChat}
      />

      <div style={{
        flex: 1,
        minHeight: 0,
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '12px',
        overflow: 'hidden'
      }} className={isAnyPanelOpen ? "room-grid-open" : "room-grid-closed"}>

        <style>{`
          @media (min-width: 1024px) {
            .room-grid-open {
              grid-template-columns: 1fr 320px !important;
            }
            .room-grid-closed {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>

        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
          <Player
            videoId={videoId}
            playState={playState}
            currentTime={currentTime}
            duration={duration}
            myRole={myRole}
            onPlay={actions.play}
            onPause={actions.pause}
            onSeek={actions.seek}
            onDurationChange={setDuration}
            onSendReaction={actions.sendReaction}
            reactions={reactions}
          />

          <UrlInputForm
            myRole={myRole}
            onChangeVideo={actions.changeVideo}
          />
        </div>

        {isAnyPanelOpen && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', height: '100%', minHeight: 0, overflow: 'hidden' }}>
            
            {isParticipantsOpen && (
              <div style={{ flex: isChatOpen ? 1 : 1, minHeight: 0, overflow: 'hidden' }}>
                <ParticipantList
                  participants={participants}
                  currentUserId={userId}
                  myRole={myRole}
                  onAssignRole={actions.assignRole}
                  onRemoveParticipant={actions.removeParticipant}
                  onTransferHost={actions.transferHost}
                  onClose={() => setIsParticipantsOpen(false)}
                />
              </div>
            )}

            {isChatOpen && (
              <div style={{ flex: isParticipantsOpen ? 1.2 : 1, minHeight: 0, overflow: 'hidden' }}>
                <Chat
                  messages={chatMessages}
                  onSendMessage={actions.sendMessage}
                  currentUserId={userId}
                  onClose={() => setIsChatOpen(false)}
                />
              </div>
            )}

          </div>
        )}

      </div>

      <Toast message={serverError} onClose={clearServerError} />

    </div>
  );
};
