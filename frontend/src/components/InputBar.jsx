import React, { useState, useRef, useCallback, useEffect } from 'react';
import clsx from 'clsx';
import './InputBar.css';

const InputBar = ({
  value = '',
  onChange,
  onSend,
  onKeyDown,
  disabled = false,
  isLoading = false,
  placeholder = 'Ask Nyx anything mystical...',
  maxLength = 2000,
  className = '',
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const inputRef = useRef(null);
  const characterCount = value.length;
  const isNearLimit = characterCount > maxLength * 0.8;
  const isOverLimit = characterCount > maxLength;
  const canSend = value.trim().length > 0 && !disabled && !isLoading && !isOverLimit;

  // Mobile keyboard detection
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initialViewportHeight = window.visualViewport?.height || window.innerHeight;
    
    const handleViewportChange = () => {
      if (!window.visualViewport) return;
      
      const currentHeight = window.visualViewport.height;
      const heightDifference = initialViewportHeight - currentHeight;
      
      // Consider keyboard open if viewport shrunk by more than 150px
      const keyboardIsOpen = heightDifference > 150;
      setIsKeyboardOpen(keyboardIsOpen);
    };

    // Use Visual Viewport API if available (modern browsers)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange);
      return () => window.visualViewport.removeEventListener('resize', handleViewportChange);
    }

    // Fallback for older browsers
    const handleResize = () => {
      const currentHeight = window.innerHeight;
      const heightDifference = initialViewportHeight - currentHeight;
      const keyboardIsOpen = heightDifference > 150;
      setIsKeyboardOpen(keyboardIsOpen);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleInputChange = useCallback((e) => {
    if (onChange) {
      onChange(e.target.value);
    }
  }, [onChange]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (canSend && onSend) {
        onSend();
      }
    }
    
    if (onKeyDown) {
      onKeyDown(e);
    }
  }, [canSend, onSend, onKeyDown]);

  const handleSendClick = useCallback(() => {
    if (canSend && onSend) {
      onSend();
    }
  }, [canSend, onSend]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  const focusInput = useCallback(() => {
    if (inputRef.current && !disabled) {
      inputRef.current.focus();
    }
  }, [disabled]);

  return (
    <div 
      className={clsx(
        'input-bar',
        {
          'input-bar--focused': isFocused,
          'input-bar--disabled': disabled,
          'input-bar--loading': isLoading,
          'input-bar--over-limit': isOverLimit,
          'input-bar--keyboard-open': isKeyboardOpen,
        },
        className
      )}
      {...props}
    >
      <form 
        className="input-bar__form"
        onSubmit={(e) => {
          e.preventDefault();
          handleSendClick();
        }}
      >
        <div className="input-bar__container" onClick={focusInput}>
          <div className="input-bar__input-wrapper">
            <textarea
              ref={inputRef}
              value={value}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={handleFocus}
              onBlur={handleBlur}
              disabled={disabled}
              placeholder={placeholder}
              maxLength={maxLength}
              rows={1}
              className="input-bar__input"
              aria-label="Message input for Nyx"
              aria-describedby={clsx(
                isNearLimit || isOverLimit ? 'character-count' : null,
                'send-button-description input-hint'
              )}
              aria-invalid={isOverLimit ? 'true' : 'false'}
              aria-required="false"
              autoComplete="off"
              autoCorrect="on"
              autoCapitalize="sentences"
              spellCheck="true"
            />
            
            {(isNearLimit || isOverLimit) && (
              <div 
                id="character-count"
                className={clsx(
                  'input-bar__character-count',
                  {
                    'input-bar__character-count--warning': isNearLimit && !isOverLimit,
                    'input-bar__character-count--error': isOverLimit,
                  }
                )}
                aria-live="polite"
              >
                {characterCount}/{maxLength}
              </div>
            )}
          </div>
          
          <button
            type="submit"
            disabled={!canSend}
            className={clsx(
              'input-bar__send-button',
              {
                'input-bar__send-button--active': canSend,
                'input-bar__send-button--loading': isLoading,
              }
            )}
            aria-label={isLoading ? 'Sending message...' : 'Send message'}
            title={
              isLoading 
                ? 'Sending message...' 
                : !value.trim() 
                ? 'Enter a message to send' 
                : isOverLimit
                ? 'Message too long'
                : 'Send message (Enter)'
            }
          >
            <span 
              id="send-button-description" 
              className="sr-only"
            >
              {isLoading 
                ? 'Sending message to Nyx...' 
                : 'Send your message to Nyx. Press Enter or click to send.'
              }
            </span>
            
            {isLoading ? (
              <div className="input-bar__loading-spinner" aria-hidden="true">
                <div className="spinner" />
              </div>
            ) : (
              <div className="input-bar__send-icon" aria-hidden="true">
                ✨
              </div>
            )}
          </button>
        </div>
        
        <div id="input-hint" className="input-bar__hint">
          <span className="input-bar__hint-text">
            Press <kbd>Enter</kbd> to send, <kbd>Shift + Enter</kbd> for new line
          </span>
        </div>
      </form>
    </div>
  );
};

export default InputBar;
