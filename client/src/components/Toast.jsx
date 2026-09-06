import React, { useEffect } from 'react';
import { AlertCircle, X } from 'lucide-react';

export const Toast = ({ message, onClose }) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 9999,
      backgroundColor: '#ef4444',
      color: '#ffffff',
      padding: '12px 18px',
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-lg)',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      maxWidth: '400px'
    }}>
      <AlertCircle size={20} />
      <div style={{ fontSize: '0.85rem', fontWeight: 600, flex: 1 }}>{message}</div>
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
        <X size={16} />
      </button>
    </div>
  );
};
