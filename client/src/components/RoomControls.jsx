import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, RotateCw, Lock, Unlock, Maximize, Minimize } from 'lucide-react';

export const RoomControls = ({
  playState,
  currentTime,
  duration = 0,
  myRole,
  onPlay,
  onPause,
  onSeek,
  isFullscreen = false,
  onToggleFullscreen
}) => {
  const [seekValue, setSeekValue] = useState(currentTime || 0);
  const [isSeeking, setIsSeeking] = useState(false);

  const canControl = myRole === 'host' || myRole === 'moderator';

  useEffect(() => {
    if (!isSeeking) {
      setSeekValue(currentTime || 0);
    }
  }, [currentTime, isSeeking]);

  const handleSeekChange = (e) => {
    setSeekValue(parseFloat(e.target.value));
  };

  const handleSeekCommit = () => {
    setIsSeeking(false);
    onSeek(seekValue);
  };

  const formatTime = (seconds) => {
    const total = Math.floor(seconds || 0);
    const hrs = Math.floor(total / 3600);
    const mins = Math.floor((total % 3600) / 60);
    const secs = total % 60;
    const hh = String(hrs).padStart(2, '0');
    const mm = String(mins).padStart(2, '0');
    const ss = String(secs).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  };

  const maxSeek = duration > 0 ? duration : 100;

  return (
    <div
      style={{
        padding: '12px 16px 8px 16px',
        background: 'linear-gradient(to top, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.5) 70%, transparent 100%)',
        color: '#ffffff',
        width: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px'
      }}>
        <button
          onClick={() => onSeek(Math.max(0, currentTime - 10))}
          disabled={!canControl}
          title="Rewind 10 seconds"
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            color: '#ffffff',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: canControl ? 'pointer' : 'not-allowed',
            opacity: canControl ? 1 : 0.5
          }}
        >
          <RotateCcw size={16} />
        </button>

        {playState === 'playing' ? (
          <button
            onClick={onPause}
            disabled={!canControl}
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary)',
              color: '#ffffff',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: canControl ? 'pointer' : 'not-allowed',
              opacity: canControl ? 1 : 0.5
            }}
            title="Pause"
          >
            <Pause size={20} />
          </button>
        ) : (
          <button
            onClick={onPlay}
            disabled={!canControl}
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              backgroundColor: '#059669',
              color: '#ffffff',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: canControl ? 'pointer' : 'not-allowed',
              opacity: canControl ? 1 : 0.5
            }}
            title="Play"
          >
            <Play size={20} style={{ marginLeft: '2px' }} />
          </button>
        )}

        <button
          onClick={() => onSeek(currentTime + 10)}
          disabled={!canControl}
          title="Forward 10 seconds"
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            color: '#ffffff',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: canControl ? 'pointer' : 'not-allowed',
            opacity: canControl ? 1 : 0.5
          }}
        >
          <RotateCw size={16} />
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{
          fontSize: '0.75rem',
          color: '#cbd5e1',
          fontFamily: 'monospace',
          minWidth: '65px',
          textAlign: 'right'
        }}>
          {formatTime(seekValue)}
        </span>
        
        <input
          type="range"
          min="0"
          max={maxSeek}
          step="0.5"
          value={seekValue}
          onChange={handleSeekChange}
          onMouseDown={() => setIsSeeking(true)}
          onMouseUp={handleSeekCommit}
          onTouchStart={() => setIsSeeking(true)}
          onTouchEnd={handleSeekCommit}
          disabled={!canControl}
          style={{
            flex: 1,
            accentColor: 'var(--primary)',
            cursor: canControl ? 'pointer' : 'not-allowed',
            opacity: canControl ? 1 : 0.6
          }}
        />
        
        <span style={{
          fontSize: '0.75rem',
          color: '#cbd5e1',
          fontFamily: 'monospace',
          minWidth: '65px'
        }}>
          {formatTime(duration)}
        </span>

        {onToggleFullscreen && (
          <button
            onClick={onToggleFullscreen}
            style={{
              background: 'none',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </button>
        )}
      </div>

    </div>
  );
};
