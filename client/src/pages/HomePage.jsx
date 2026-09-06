import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, LogIn } from 'lucide-react';

export const HomePage = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [joinRoomId, setJoinRoomId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const savedName = localStorage.getItem('watchparty_username');
    if (savedName) {
      setUsername(savedName);
    } else {
      const randomName = `User_${Math.floor(1000 + Math.random() * 9000)}`;
      setUsername(randomName);
    }
  }, []);

  const saveUsername = (name) => {
    setUsername(name);
    localStorage.setItem('watchparty_username', name);
  };

  const handleCreateRoom = (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please enter a display name');
      return;
    }
    saveUsername(username.trim());

    const numericCode = Math.floor(1000000000 + Math.random() * 9000000000).toString();
    navigate(`/room/${numericCode}`);
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Please enter a display name');
      return;
    }
    if (!joinRoomId.trim()) {
      setError('Please enter a 10-digit Room Code');
      return;
    }
    saveUsername(username.trim());

    let cleanCode = joinRoomId.trim();
    if (cleanCode.includes('/room/')) {
      cleanCode = cleanCode.split('/room/')[1];
    }
    cleanCode = cleanCode.replace(/\D/g, '');

    if (cleanCode.length !== 10) {
      setError('Room ID must be exactly 10 numeric digits (e.g. 8492041237)');
      return;
    }

    navigate(`/room/${cleanCode}`);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      backgroundColor: 'var(--bg-page)'
    }}>
      <div style={{ maxWidth: '440px', width: '100%' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '800',
            color: 'var(--text-main)',
            marginBottom: '8px'
          }}>
            WatchTogether
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Watch YouTube videos together with your friends.
          </p>
        </div>

        <div className="solid-card" style={{ padding: '32px' }}>
          
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '8px', color: 'var(--text-main)' }}>
              Your name
            </label>
            <input
              type="text"
              placeholder="Enter your name..."
              value={username}
              onChange={(e) => saveUsername(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                backgroundColor: '#f8fafc',
                border: '1px solid var(--border-card)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-main)',
                fontSize: '1rem'
              }}
            />
          </div>

          {error && (
            <div style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '16px', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <button
            className="btn-primary"
            onClick={handleCreateRoom}
            style={{ width: '100%', padding: '14px', fontSize: '1rem', marginBottom: '20px' }}
          >
            <PlusCircle size={20} />
            Create Room
          </button>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '20px',
            color: 'var(--text-muted)',
            fontSize: '0.8rem'
          }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-card)' }} />
            OR
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-card)' }} />
          </div>

          <form onSubmit={handleJoinRoom} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input
              type="text"
              placeholder="Enter Room Code "
              value={joinRoomId}
              onChange={(e) => setJoinRoomId(e.target.value.replace(/\D/g, '').slice(0, 10))}
              maxLength={10}
              style={{
                width: '100%',
                padding: '12px 16px',
                backgroundColor: '#f8fafc',
                border: '1px solid var(--border-card)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-main)',
                fontSize: '0.95rem'
              }}
            />
            
            <button
              type="submit"
              className="btn-secondary"
              style={{ width: '100%', padding: '12px', fontSize: '0.95rem' }}
            >
              <LogIn size={18} />
              Join Room
            </button>
          </form>

        </div>

      </div>
    </div>
  );
};
