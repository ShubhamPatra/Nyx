import React, { ErrorBoundary } from 'react';
import MessageList from './MessageList';
import InputBar from './InputBar';
import ThemeToggle from './ThemeToggle';
import Logo from './Logo';
import ClearChatButton from './ClearChatButton';
import useChat from '../hooks/useChat';
import './ChatContainer.css';

// Error Boundary Component
class ChatErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Chat Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="chat-error-boundary">
          <div className="chat-error-boundary__content">
            <h2 className="chat-error-boundary__title">
              🌙 Mystical Interference Detected
            </h2>
            <p className="chat-error-boundary__message">
              The cosmic energies seem to be disrupted. Please refresh the realm to restore the connection.
            </p>
            <button 
              className="chat-error-boundary__button"
              onClick={() => window.location.reload()}
            >
              Restore Connection
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const ChatContainer = ({ 
  className = '',
  enableVirtualization = false,
  maxMessageHeight = 500,
  ...props 
}) => {
  const {
    messages,
    input,
    setInput,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    dismissError
  } = useChat();

  const handleSendMessage = () => {
    sendMessage();
  };

  const handleInputChange = (value) => {
    setInput(value);
  };

  const handleKeyDown = (e) => {
    // Additional keyboard shortcuts can be added here
    if (e.key === 'Escape' && error) {
      dismissError();
    }
  };

  const handleSkipToMain = (e) => {
    e.preventDefault();
    const mainContent = document.getElementById('chat-main-content');
    if (mainContent) {
      mainContent.focus();
    }
  };

  return (
    <ChatErrorBoundary>
      {/* Skip link for keyboard navigation */}
      <a 
        href="#chat-main-content" 
        className="chat-container__skip-link"
        onClick={handleSkipToMain}
      >
        Skip to chat content
      </a>
      
      <div 
        className={`chat-container ${className}`}
        role="main"
        aria-label="Nyx Chat Interface"
        {...props}
      >
        <header className="chat-container__header">
          <div className="chat-container__title">
            <Logo />
          </div>
          
          <div className="chat-container__header-controls">
            <ClearChatButton 
              onClear={clearMessages}
              disabled={isLoading}
            />
            <ThemeToggle />
          </div>
          
          {error && (
            <div 
              className="chat-container__error"
              role="alert"
              aria-live="assertive"
              aria-describedby="error-details"
            >
              <div className="chat-container__error-content">
                <span className="chat-container__error-icon" aria-hidden="true">⚠️</span>
                <span className="chat-container__error-message" id="error-details">
                  {error.message}
                </span>
                <button 
                  className="chat-container__error-dismiss"
                  onClick={dismissError}
                  aria-label="Dismiss error"
                  title="Dismiss error"
                >
                  ✕
                </button>
              </div>
            </div>
          )}
        </header>

        <main 
          className="chat-container__main" 
          id="chat-main-content"
          tabIndex="-1"
        >
          <MessageList
            messages={messages}
            isLoading={isLoading}
            enableVirtualization={enableVirtualization}
            virtualizationThreshold={25}
            height={maxMessageHeight}
            className="chat-container__messages"
          />
        </main>

        <footer className="chat-container__footer">
          <InputBar
            value={input}
            onChange={handleInputChange}
            onSend={handleSendMessage}
            onKeyDown={handleKeyDown}
            disabled={!!error}
            isLoading={isLoading}
            className="chat-container__input"
          />
        </footer>
      </div>
    </ChatErrorBoundary>
  );
};

export default ChatContainer;
