import React from 'react';
import clsx from 'clsx';
import './MessageBubble.css';

const MessageBubble = ({ 
  message, 
  sender, 
  timestamp, 
  status = 'sent',
  className = '',
  id,
  ...props 
}) => {
  const isUser = sender === 'user';
  const isNyx = sender === 'nyx';
  
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getAriaLabel = () => {
    const senderName = isUser ? 'you' : 'Nyx';
    const timeInfo = timestamp ? ` at ${formatTimestamp(timestamp)}` : '';
    const statusInfo = status === 'sending' ? ' (sending)' : status === 'error' ? ' (failed to send)' : '';
    return `Message from ${senderName}${timeInfo}${statusInfo}: ${message}`;
  };

  return (
    <div
      id={id}
      className={clsx(
        'message-bubble',
        {
          'message-bubble--user': isUser,
          'message-bubble--nyx': isNyx,
          'message-bubble--sending': status === 'sending',
          'message-bubble--error': status === 'error',
        },
        className
      )}
      role="article"
      aria-label={getAriaLabel()}
      aria-live={status === 'sending' ? 'polite' : undefined}
      {...props}
    >
      <div className="message-bubble__content">
        <div className="message-bubble__text">
          {message}
        </div>
        {timestamp && (
          <div 
            className="message-bubble__timestamp"
            aria-label={`Sent at ${formatTimestamp(timestamp)}`}
          >
            {formatTimestamp(timestamp)}
          </div>
        )}
      </div>
      
      {status === 'sending' && (
        <div className="message-bubble__status" aria-label="Sending message">
          <div className="spinner" />
        </div>
      )}
      
      {status === 'error' && (
        <div 
          className="message-bubble__status message-bubble__status--error" 
          aria-label="Failed to send message"
          title="Failed to send message"
        >
          ⚠️
        </div>
      )}
      
      {isNyx && (
        <div className="message-bubble__avatar" aria-hidden="true">
          🌙
        </div>
      )}
    </div>
  );
};

export default MessageBubble;
