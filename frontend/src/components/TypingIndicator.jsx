import React from 'react';
import './TypingIndicator.css';

const TypingIndicator = ({ isVisible = false, className = '', ...props }) => {
  if (!isVisible) return null;

  return (
    <div 
      className={`typing-indicator ${className}`}
      role="status"
      aria-live="polite"
      aria-label="Nyx is typing"
      {...props}
    >
      <div className="typing-indicator__container">
        <div className="typing-indicator__avatar" aria-hidden="true">
          🌙
        </div>
        <div className="typing-indicator__content">
          <div className="typing-indicator__text">
            <span className="sr-only">Nyx is typing</span>
            <div className="typing-indicator__dots" aria-hidden="true">
              <div className="typing-indicator__dot" />
              <div className="typing-indicator__dot" />
              <div className="typing-indicator__dot" />
            </div>
          </div>
          <div className="typing-indicator__label">
            Nyx is channeling mystical energies...
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
