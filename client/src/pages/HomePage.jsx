import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, LogIn, Tv } from 'lucide-react';

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
    <div className="home-container">
      <style>{`
        .home-container {
          min-height: 100vh;
          width: 100%;
          display: flex;
          flex-direction: column-reverse;
          background-color: var(--bg-page);
        }

        @media (min-width: 768px) {
          .home-container {
            flex-direction: row;
            height: 100vh;
            overflow: hidden;
          }
        }

        .home-left-col {
          flex: 0 0 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px 20px;
          background-color: #f8fafc;
        }

        @media (min-width: 768px) {
          .home-left-col {
            flex: 0 0 45%;
            padding: 40px;
            overflow-y: auto;
          }
        }

        .home-right-col {
          flex: 0 0 100%;
          background: linear-gradient(135deg, #4f46e5 0%, #3730a3 50%, #1e1b4b 100%);
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 48px 32px;
          position: relative;
          overflow: hidden;
          color: #ffffff;
        }

        @media (min-width: 768px) {
          .home-right-col {
            flex: 0 0 55%;
            padding: 64px 56px;
          }
        }

        .hero-title {
          font-size: 2.75rem;
          font-weight: 800;
          color: #ffffff;
          line-height: 1.15;
          letter-spacing: -0.02em;
          margin-bottom: 20px;
        }

        @media (min-width: 768px) {
          .hero-title {
            font-size: 4rem;
          }
        }

        .hero-desc {
          font-size: 1.1rem;
          color: #e2e8f0;
          line-height: 1.65;
          max-width: 520px;
          opacity: 0.95;
          font-weight: 400;
        }

        @media (min-width: 768px) {
          .hero-desc {
            font-size: 1.3rem;
          }
        }

        .hero-bg-glow {
          position: absolute;
          width: 450px;
          height: 450px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(219, 39, 119, 0.3) 0%, rgba(79, 70, 229, 0) 70%);
          filter: blur(50px);
          top: -100px;
          right: -100px;
          pointer-events: none;
        }

        .hero-bg-glow-2 {
          position: absolute;
          width: 350px;
          height: 350px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(2, 132, 199, 0.25) 0%, rgba(79, 70, 229, 0) 70%);
          filter: blur(40px);
          bottom: -50px;
          left: -50px;
          pointer-events: none;
        }

        .hero-watermark-icon {
          position: absolute;
          right: 40px;
          bottom: 40px;
          opacity: 0.06;
          pointer-events: none;
          color: #ffffff;
        }

        .form-card-container {
          width: 100%;
          max-width: 420px;
        }
      `}</style>

      <div className="home-left-col">
        <div className="form-card-container">
          <div className="solid-card" style={{ padding: '32px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.06), 0 8px 10px -6px rgba(0, 0, 0, 0.04)', borderRadius: '16px' }}>
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

      <div className="home-right-col">
        <div className="hero-bg-glow" />
        <div className="hero-bg-glow-2" />
        <Tv size={180} className="hero-watermark-icon" />

        <div style={{ position: 'relative', zIndex: 10, maxWidth: '580px' }}>
          <h1 className="hero-title">Watch. Connect. Enjoy.</h1>
          <p className="hero-desc">
            Watch YouTube videos together with friends,<br />
            perfectly synced in real time.
          </p>
        </div>
      </div>
    </div>
  );
};
