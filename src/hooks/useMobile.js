// Create this file: src/hooks/useMobile.js

import { useState, useEffect, useCallback } from 'react';

// Hook for detecting mobile device
export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};

// Hook for preventing body scroll when quiz is active
export const usePreventScroll = (isActive) => {
  useEffect(() => {
    if (isActive) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }

    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
    };
  }, [isActive]);
};

// Hook for handling viewport height on mobile (fixes iOS Safari issues)
export const useViewportHeight = () => {
  useEffect(() => {
    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    setVH();
    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', setVH);

    // Delay for iOS Safari
    setTimeout(setVH, 100);

    return () => {
      window.removeEventListener('resize', setVH);
      window.removeEventListener('orientationchange', setVH);
    };
  }, []);
};

// Hook for swipe gestures (optional - for next/previous)
export const useSwipeGesture = (onSwipeLeft, onSwipeRight) => {
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && onSwipeLeft) {
      onSwipeLeft();
    }
    if (isRightSwipe && onSwipeRight) {
      onSwipeRight();
    }
  };

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd
  };
};

// Hook for haptic feedback (if supported)
export const useHapticFeedback = () => {
  const triggerHaptic = useCallback((type = 'light') => {
    if (navigator.vibrate) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30],
        success: [10, 50, 10],
        error: [50, 50, 50]
      };
      navigator.vibrate(patterns[type] || patterns.light);
    }
  }, []);

  return triggerHaptic;
};

// Mobile utility functions
export const mobileUtils = {
  // Check if device is iOS
  isIOS: () => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  },

  // Check if device is Android
  isAndroid: () => {
    return /Android/.test(navigator.userAgent);
  },

  // Get device pixel ratio for high-DPI displays
  getPixelRatio: () => {
    return window.devicePixelRatio || 1;
  },

  // Prevent zoom on double tap
  preventZoom: (element) => {
    let lastTouchEnd = 0;
    element.addEventListener('touchend', (event) => {
      const now = (new Date()).getTime();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    }, false);
  },

  // Smooth scroll to element
  scrollToElement: (elementId, offset = 0) => {
    const element = document.getElementById(elementId);
    if (element) {
      const top = element.offsetTop - offset;
      window.scrollTo({
        top,
        behavior: 'smooth'
      });
    }
  }
};