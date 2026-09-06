import React, { useState } from 'react';
import { Link as LinkIcon } from 'lucide-react';
import { extractYouTubeId } from '../utils/youtube';

export const UrlInputForm = ({ myRole, onChangeVideo }) => {
  const [urlInput, setUrlInput] = useState('');
  const [inputError, setInputError] = useState('');

  const canControl = myRole === 'host' || myRole === 'moderator';

  const handleVideoSubmit = (e) => {
    e.preventDefault();
    setInputError('');
    if (!canControl) return;

    const extractedId = extractYouTubeId(urlInput);
    if (!extractedId) {
      setInputError('Invalid YouTube URL or Video ID');
      return;
    }

    onChangeVideo(extractedId);
    setUrlInput('');
  };

  return (
    <div className="solid-card" style={{ padding: '8px 12px', marginTop: '8px' }}>
      <form onSubmit={handleVideoSubmit} style={{ display: 'flex', gap: '8px' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <div style={{
            position: 'absolute',
            left: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)'
          }}>
            <LinkIcon size={14} />
          </div>
          <input
            type="text"
            placeholder={canControl ? "Paste YouTube Video Link or ID..." : "Only Host or Moderator can change video"}
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            disabled={!canControl}
            style={{
              width: '100%',
              padding: '6px 10px 6px 30px',
              backgroundColor: '#f8fafc',
              border: inputError ? '1px solid #ef4444' : '1px solid var(--border-card)',
              borderRadius: '6px',
              color: 'var(--text-main)',
              fontSize: '0.85rem'
            }}
          />
        </div>
        <button
          type="submit"
          className="btn-primary"
          disabled={!canControl || !urlInput.trim()}
          style={{ whiteSpace: 'nowrap', padding: '6px 14px', fontSize: '0.85rem' }}
        >
          Load
        </button>
      </form>
      {inputError && (
        <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px' }}>
          {inputError}
        </div>
      )}
    </div>
  );
};
