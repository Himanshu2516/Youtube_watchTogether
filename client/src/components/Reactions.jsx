import React from 'react';
import confetti from 'canvas-confetti';

const EMOJIS = ['❤️', '🔥', '🎉', '😂', '👏', '😮'];

export const Reactions = ({ onSendReaction }) => {

  const handleReactionClick = (emoji) => {
    onSendReaction(emoji);
    
    if (emoji === '🎉') {
      confetti({
        particleCount: 35,
        spread: 50,
        origin: { y: 0.8 }
      });
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      padding: '4px 0'
    }}>
      {EMOJIS.map((emoji) => (
        <button
          key={emoji}
          onClick={() => handleReactionClick(emoji)}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            fontSize: '1.25rem',
            padding: '4px 8px',
            cursor: 'pointer',
            borderRadius: '4px',
            transition: 'transform 0.1s ease'
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
  );
};
