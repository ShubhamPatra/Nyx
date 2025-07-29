import React, { useCallback } from 'react';
import clsx from 'clsx';
import './ClearChatButton.css';

const ClearChatButton = ({ 
  onClear,
  confirm = true,
  disabled = false,
  className = '',
  ...props 
}) => {
  const handleClick = useCallback(() => {
    if (disabled) return;

    if (confirm) {
      const confirmed = window.confirm(
        'Are you sure you want to clear all messages? This action cannot be undone.'
      );
      if (!confirmed) return;
    }

    if (onClear) {
      onClear();
    }
  }, [onClear, confirm, disabled]);

  const handleKeyDown = useCallback((e) => {
    if (disabled) return;

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }, [handleClick, disabled]);

  return (
    <button
      className={clsx(
        'clear-chat-button',
        {
          'clear-chat-button--disabled': disabled,
        },
        className
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      aria-label="Clear conversation"
      title={disabled ? 'Cannot clear while loading' : 'Clear all messages'}
      {...props}
    >
      <span 
        className="clear-chat-button__icon" 
        aria-hidden="true"
      >
        🗑️
      </span>
      <span className="clear-chat-button__sr-text">
        Removes all messages and conversation history
      </span>
    </button>
  );
};

export default ClearChatButton;
