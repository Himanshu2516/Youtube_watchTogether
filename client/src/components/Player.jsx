import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { RoomControls } from './RoomControls';

const EMOJIS = ['❤️', '🔥', '🎉', '😂', '👏', '😮'];

export const Player = ({
  videoId,
  playState,
  currentTime,
  duration = 0,
  myRole,
  onPlay,
  onPause,
  onSeek,
  onStateChangeLocal,
  onDurationChange,
  onSendReaction,
  reactions = []
}) => {
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const isServerUpdate = useRef(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [isReactionsOpen, setIsReactionsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [displayTime, setDisplayTime] = useState(currentTime || 0);

  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const currentTimeRef = useRef(currentTime);
  const playStateRef = useRef(playState);

  useEffect(() => {
    currentTimeRef.current = currentTime;
  }, [currentTime]);

  useEffect(() => {
    playStateRef.current = playState;
  }, [playState]);

  useEffect(() => {
    let mounted = true;

    const initPlayer = () => {
      if (!window.YT || !window.YT.Player) {
        setTimeout(initPlayer, 100);
        return;
      }

      if (playerRef.current) return;

      playerRef.current = new window.YT.Player('youtube-iframe-target', {
        height: '100%',
        width: '100%',
        videoId: videoId || 'jfKfPfyJRdk',
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          iv_load_policy: 3,
          autohide: 1,
          enablejsapi: 1,
          origin: window.location.origin
        },
        events: {
          onReady: () => {
            if (mounted) {
              setIsPlayerReady(true);
              if (playerRef.current) {
                if (playerRef.current.getDuration && onDurationChange) {
                  onDurationChange(playerRef.current.getDuration());
                }
                const targetTime = typeof currentTimeRef.current === 'number' ? currentTimeRef.current : 0;
                playerRef.current.seekTo(targetTime, true);
                if (playStateRef.current === 'playing') {
                  playerRef.current.playVideo();
                } else {
                  playerRef.current.pauseVideo();
                }
              }
            }
          },
          onStateChange: () => {
            if (playerRef.current?.getDuration && onDurationChange) {
              onDurationChange(playerRef.current.getDuration());
            }
          }
        }
      });
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
      initPlayer();
    }

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isPlayerReady || !playerRef.current) return;

    const interval = setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime) {
        const liveTime = playerRef.current.getCurrentTime();
        if (typeof liveTime === 'number') {
          setDisplayTime(liveTime);
        }
        if (playerRef.current.getDuration && onDurationChange) {
          const dur = playerRef.current.getDuration();
          if (dur > 0) onDurationChange(dur);
        }
      }
    }, 250);

    return () => clearInterval(interval);
  }, [isPlayerReady, onDurationChange]);

  useEffect(() => {
    if (!isPlayerReady || !playerRef.current) return;

    try {
      const player = playerRef.current;
      const currentLoadedId = player.getVideoData?.()?.video_id;
      if (videoId && currentLoadedId !== videoId) {
        player.loadVideoById(videoId, currentTime || 0);
        if (playState === 'playing') {
          player.playVideo();
        } else {
          player.pauseVideo();
        }
        return;
      }

      const playerCurrentTime = player.getCurrentTime ? player.getCurrentTime() : 0;
      const timeDifference = Math.abs(playerCurrentTime - currentTime);

      if (timeDifference > 1.2) {
        player.seekTo(currentTime, true);
        setDisplayTime(currentTime);
      }

      const ytState = player.getPlayerState ? player.getPlayerState() : null;

      if (playState === 'playing') {
        if (ytState !== window.YT.PlayerState.PLAYING && ytState !== window.YT.PlayerState.BUFFERING) {
          player.playVideo();
        }
      } else if (playState === 'paused') {
        if (ytState === window.YT.PlayerState.PLAYING || ytState === window.YT.PlayerState.BUFFERING) {
          player.pauseVideo();
        }
      }
    } catch (e) {}
  }, [playState, currentTime, videoId, isPlayerReady]);

  const handleEmojiClick = (emoji) => {
    if (onSendReaction) {
      onSendReaction(emoji);
    }
    if (emoji === '🎉') {
      confetti({
        particleCount: 35,
        spread: 50,
        origin: { y: 0.8 }
      });
    }
  };

  return (
    <div
      className="solid-card"
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: isFullscreen ? 'auto' : '16 / 9',
        height: isFullscreen ? '100vh' : 'auto',
        maxHeight: isFullscreen ? 'none' : 'calc(100vh - 120px)',
        margin: '0 auto',
        backgroundColor: '#000000',
        borderRadius: isFullscreen ? 0 : '8px',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-md)'
      }}
      ref={containerRef}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
        <div id="youtube-iframe-target" style={{ width: '100%', height: '100%' }}></div>
      </div>

      <div style={{
        position: 'absolute',
        right: '12px',
        top: '40%',
        transform: 'translateY(-50%)',
        zIndex: 40,
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        pointerEvents: 'auto'
      }}>
        {isReactionsOpen && (
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(8px)',
            borderRadius: '20px',
            padding: '8px 6px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          }}>
            {EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleEmojiClick(emoji)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.2rem',
                  cursor: 'pointer',
                  padding: '2px 4px',
                  transition: 'transform 0.15s ease'
                }}
                onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(1.25)')}
                onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                title={`Send ${emoji}`}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        <button
          onClick={() => setIsReactionsOpen(prev => !prev)}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(226, 232, 240, 0.8)',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
            color: '#0f172a'
          }}
          title={isReactionsOpen ? 'Hide Reactions' : 'Show Reactions'}
        >
          {isReactionsOpen ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        pointerEvents: 'auto'
      }}>
        <RoomControls
          playState={playState}
          currentTime={displayTime}
          duration={duration}
          myRole={myRole}
          onPlay={onPlay}
          onPause={onPause}
          onSeek={onSeek}
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
        />
      </div>

      {reactions.map((react, idx) => {
        const leftPercent = 10 + ((idx * 37 + react.username.length * 15) % 80);
        return (
          <div
            key={react.id}
            className="floating-emoji"
            style={{ left: `${leftPercent}%`, bottom: '60px' }}
          >
            {react.emoji}
            <span style={{
              fontSize: '0.7rem',
              display: 'block',
              color: '#ffffff',
              fontWeight: 600
            }}>
              {react.username}
            </span>
          </div>
        );
      })}
    </div>
  );
};
