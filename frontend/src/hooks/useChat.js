import { useState, useCallback, useRef, useEffect } from 'react';

// Local storage key for message persistence
const STORAGE_KEY = 'nyx_chat_messages';

// Load messages from localStorage
const loadPersistedMessages = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.warn('Failed to load persisted messages:', error);
    return [];
  }
};

// Save messages to localStorage
const persistMessages = (messages) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch (error) {
    console.warn('Failed to persist messages:', error);
  }
};

const useChat = () => {
  const [messages, setMessages] = useState(() => loadPersistedMessages());
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messageIdCounter = useRef(0);
  const abortControllerRef = useRef(null);

  // Persist messages when they change
  useEffect(() => {
    persistMessages(messages);
  }, [messages]);

  const generateMessageId = useCallback(() => {
    return `msg_${Date.now()}_${++messageIdCounter.current}`;
  }, []);

  const addMessage = useCallback((content, sender, status = 'sent') => {
    const message = {
      id: generateMessageId(),
      content,
      sender,
      timestamp: new Date().toISOString(),
      status
    };
    
    setMessages(prev => [...prev, message]);
    return message.id;
  }, [generateMessageId]);

  const updateMessageStatus = useCallback((messageId, status) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId ? { ...msg, status } : msg
      )
    );
  }, []);

  const sendMessage = useCallback(async (messageContent = input.trim()) => {
    if (!messageContent || isLoading) return;

    setError(null);
    setInput('');
    
    // Add user message with sending status (optimistic update)
    const userMessageId = addMessage(messageContent, 'user', 'sending');
    
    // Create abort controller for request cancellation
    abortControllerRef.current = new AbortController();
    
    try {
      setIsLoading(true);
      
      const response = await fetch('http://localhost:5000/api/nyx', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: messageContent }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.response) {
        // Update user message status to sent
        updateMessageStatus(userMessageId, 'sent');
        // Add Nyx response
        addMessage(data.response, 'nyx');
      } else {
        throw new Error('No response received from Nyx');
      }
    } catch (err) {
      // Don't handle aborted requests as errors
      if (err.name === 'AbortError') {
        return;
      }
      
      console.error('Error sending message:', err);
      
      // Update user message status to error
      updateMessageStatus(userMessageId, 'error');
      
      // Set error state with more detailed information
      const errorMessage = err.message.includes('fetch') 
        ? 'Unable to connect to Nyx. Please check your connection and try again.'
        : 'Failed to send message. Please try again.';
      
      setError({
        type: 'send_failed',
        message: errorMessage,
        details: err.message,
        retryable: true,
        messageId: userMessageId
      });
      
      // Add contextual error message from Nyx
      const nyxErrorMessage = err.message.includes('fetch')
        ? "The mystical connection seems to be disrupted. Please ensure your connection to the realm is stable."
        : "I'm experiencing some mystical interference right now. Please try reaching out again in a moment.";
        
      addMessage(nyxErrorMessage, 'nyx', 'error');
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [input, isLoading, addMessage, updateMessageStatus]);

  const retryMessage = useCallback(async (messageId) => {
    const message = messages.find(msg => msg.id === messageId);
    if (!message || message.sender !== 'user') return;
    
    // Update message status to sending
    updateMessageStatus(messageId, 'sending');
    
    try {
      const response = await fetch('http://localhost:3001/api/nyx', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: message.content }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.response) {
        updateMessageStatus(messageId, 'sent');
        addMessage(data.response, 'nyx');
        setError(null);
      } else {
        throw new Error('No response received from Nyx');
      }
    } catch (err) {
      console.error('Error retrying message:', err);
      updateMessageStatus(messageId, 'error');
      setError({
        type: 'retry_failed',
        message: 'Retry failed. Please try again.',
        details: err.message
      });
    }
  }, [messages, updateMessageStatus, addMessage]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
    // Clear persisted messages
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear persisted messages:', error);
    }
  }, []);

  const dismissError = useCallback(() => {
    setError(null);
  }, []);

  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    messages,
    input,
    setInput,
    isLoading,
    error,
    sendMessage,
    retryMessage,
    clearMessages,
    dismissError,
    cancelRequest,
    addMessage,
    updateMessageStatus
  };
};

export default useChat;
