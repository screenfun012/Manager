import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

const WarningPopup = ({ 
  isVisible, 
  message, 
  onClose, 
  position = { top: 0, left: 0 },
  targetElement = null 
}) => {
  if (!isVisible || !message) return null;

  // Pozicija popup-a
  const popupStyle = {
    position: 'absolute',
    top: targetElement ? `${targetElement.offsetTop + targetElement.offsetHeight + 5}px` : `${position.top}px`,
    left: targetElement ? `${targetElement.offsetLeft}px` : `${position.left}px`,
    zIndex: 9999,
    background: '#f59e0b',
    color: '#ffffff',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontWeight: '500',
    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)',
    border: '1px solid #d97706',
    maxWidth: '300px',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    animation: 'slideDown 0.3s ease-out'
  };

  // Arrow koji pokazuje na element
  const arrowStyle = {
    position: 'absolute',
    top: '-6px',
    left: '20px',
    width: '0',
    height: '0',
    borderLeft: '6px solid transparent',
    borderRight: '6px solid transparent',
    borderBottom: '6px solid #f59e0b'
  };

  return (
    <>
      <style>
        {`
          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
      <div style={popupStyle}>
        <div style={arrowStyle}></div>
        <AlertTriangle size={16} style={{ flexShrink: 0 }} />
        <span style={{ flex: 1 }}>{message}</span>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#ffffff',
            cursor: 'pointer',
            padding: '0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0.8,
            transition: 'opacity 0.2s ease'
          }}
          onMouseEnter={(e) => e.target.style.opacity = '1'}
          onMouseLeave={(e) => e.target.style.opacity = '0.8'}
        >
          <X size={14} />
        </button>
      </div>
    </>
  );
};

export default WarningPopup;
