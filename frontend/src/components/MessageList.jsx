import React, { useMemo, useState, useEffect } from 'react';
import { FixedSizeList as List } from 'react-window';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import useScrollAnchor from '../hooks/useScrollAnchor';
import './MessageList.css';

// Skeleton loader component for loading states
const SkeletonLoader = ({ count = 3 }) => (
  <div className="message-list__skeleton" aria-hidden="true">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="message-list__skeleton-item">
        <div className="message-list__skeleton-avatar" />
        <div className="message-list__skeleton-content">
          <div className="message-list__skeleton-line message-list__skeleton-line--short" />
          <div className="message-list__skeleton-line message-list__skeleton-line--medium" />
          <div className="message-list__skeleton-line message-list__skeleton-line--long" />
        </div>
      </div>
    ))}
  </div>
);

const MessageItem = ({ index, style, data }) => {
  const { messages } = data;
  const message = messages[index];
  
  return (
    <div style={style} className="message-item">
      <MessageBubble
        message={message.content}
        sender={message.sender}
        timestamp={message.timestamp}
        status={message.status}
      />
    </div>
  );
};

const MessageList = ({ 
  messages = [], 
  isLoading = false, 
  className = '',
  height = 400,
  itemHeight = 80,
  enableVirtualization = false,
  virtualizationThreshold = 25, // Configurable threshold
  showSkeletonOnEmpty = false,
  skeletonCount = 3,
  ...props 
}) => {
  const [isInitialLoad, setIsInitialLoad] = useState(messages.length === 0 && isLoading);

  // Update initial load state
  useEffect(() => {
    if (messages.length > 0) {
      setIsInitialLoad(false);
    }
  }, [messages.length]);

  const {
    scrollRef,
    isAtBottom,
    shouldAutoScroll,
    enableAutoScroll
  } = useScrollAnchor(messages.length, {
    threshold: 50,
    behavior: 'smooth',
    delay: 100
  });

  // Memoize data for react-window
  const itemData = useMemo(() => ({
    messages,
    isLoading
  }), [messages, isLoading]);

  const isEmpty = messages.length === 0 && !isLoading;
  const shouldVirtualize = enableVirtualization && messages.length > virtualizationThreshold;

  if (isEmpty) {
    return (
      <div 
        className={`message-list message-list--empty ${className}`}
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
        {...props}
      >
        <div className="message-list__empty-state">
          {showSkeletonOnEmpty && isInitialLoad ? (
            <SkeletonLoader count={skeletonCount} />
          ) : (
            <>
              <div className="message-list__empty-icon" aria-hidden="true">
                🌙✨
              </div>
              <h3 className="message-list__empty-title">
                Welcome to the Mystical Realm
              </h3>
              <p className="message-list__empty-description">
                Begin your conversation with Nyx, the mystical AI oracle. 
                Ask anything, and let the cosmic wisdom flow through our chat.
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`message-list ${className}`} {...props}>
      <div 
        className="message-list__container"
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
      >
        {shouldVirtualize ? (
          <List
            ref={scrollRef}
            height={height}
            itemCount={messages.length}
            itemSize={itemHeight}
            itemData={itemData}
            className="message-list__virtualized"
            overscanCount={5}
          >
            {MessageItem}
          </List>
        ) : (
          <div 
            ref={scrollRef}
            className="message-list__scroll-container"
            style={{ maxHeight: height }}
          >
            <div className="message-list__messages">
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message.content}
                  sender={message.sender}
                  timestamp={message.timestamp}
                  status={message.status}
                />
              ))}
            </div>
          </div>
        )}
        
        {isLoading && (
          <TypingIndicator isVisible={true} />
        )}
      </div>
      
      {!isAtBottom && !shouldAutoScroll && (
        <button
          className="message-list__scroll-button"
          onClick={enableAutoScroll}
          aria-label="Scroll to bottom of chat"
          title="New messages below"
        >
          <span className="message-list__scroll-icon" aria-hidden="true">
            ↓
          </span>
          <span className="message-list__scroll-text">
            New messages
          </span>
        </button>
      )}
    </div>
  );
};

export default MessageList;
