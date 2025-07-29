import { useEffect, useRef, useState, useCallback } from 'react';

// Throttle function for performance optimization
const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

const useScrollAnchor = (dependency = null, options = {}) => {
  const {
    threshold = 50, // Reduced threshold for better responsiveness
    behavior = 'smooth',
    enabled = true,
    delay = 0,
    throttleMs = 16 // 60fps throttling
  } = options;

  const scrollRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const timeoutRef = useRef(null);
  const throttledHandleScrollRef = useRef(null);

  // Check if user is near the bottom of the scroll container
  const checkIfAtBottom = useCallback(() => {
    const element = scrollRef.current;
    if (!element) return false;

    const { scrollTop, scrollHeight, clientHeight } = element;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    const atBottom = distanceFromBottom <= threshold;
    
    setIsAtBottom(atBottom);
    return atBottom;
  }, [threshold]);

  // Scroll to bottom function
  const scrollToBottom = useCallback((force = false) => {
    const element = scrollRef.current;
    if (!element || (!enabled && !force)) return;

    const scrollToBottomInternal = () => {
      element.scrollTo({
        top: element.scrollHeight,
        behavior
      });
    };

    if (delay > 0) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(scrollToBottomInternal, delay);
    } else {
      scrollToBottomInternal();
    }
  }, [enabled, behavior, delay]);

  // Handle scroll events with throttling
  const handleScroll = useCallback(() => {
    const atBottom = checkIfAtBottom();
    
    // If user manually scrolled away from bottom, disable auto-scroll
    if (!atBottom && shouldAutoScroll) {
      setShouldAutoScroll(false);
    }
    
    // If user scrolled back to bottom, re-enable auto-scroll
    if (atBottom && !shouldAutoScroll) {
      setShouldAutoScroll(true);
    }
  }, [checkIfAtBottom, shouldAutoScroll]);

  // Create throttled scroll handler
  useEffect(() => {
    throttledHandleScrollRef.current = throttle(handleScroll, throttleMs);
  }, [handleScroll, throttleMs]);

  // Auto-scroll when dependency changes (e.g., new message)
  useEffect(() => {
    if (dependency !== null && shouldAutoScroll && enabled) {
      scrollToBottom();
    }
  }, [dependency, shouldAutoScroll, enabled, scrollToBottom]);

  // Set up scroll event listener with throttling
  useEffect(() => {
    const element = scrollRef.current;
    if (!element || !throttledHandleScrollRef.current) return;

    const throttledHandler = throttledHandleScrollRef.current;
    element.addEventListener('scroll', throttledHandler, { passive: true });
    
    // Initial check
    checkIfAtBottom();

    return () => {
      element.removeEventListener('scroll', throttledHandler);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [checkIfAtBottom]);

  // Manual scroll controls
  const scrollToTop = useCallback(() => {
    const element = scrollRef.current;
    if (!element) return;

    element.scrollTo({
      top: 0,
      behavior
    });
    setShouldAutoScroll(false);
  }, [behavior]);

  const enableAutoScroll = useCallback(() => {
    setShouldAutoScroll(true);
    scrollToBottom(true);
  }, [scrollToBottom]);

  const disableAutoScroll = useCallback(() => {
    setShouldAutoScroll(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    scrollRef,
    isAtBottom,
    shouldAutoScroll,
    scrollToBottom,
    scrollToTop,
    enableAutoScroll,
    disableAutoScroll,
    checkIfAtBottom
  };
};

export default useScrollAnchor;
