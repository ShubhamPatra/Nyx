import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  ThemeContext, 
  THEMES, 
  THEME_STORAGE_KEY,
  validateTheme,
  getSystemTheme,
  getStoredTheme,
  storeTheme,
  applyTheme
} from './themeUtils';

// Custom hook to use theme context
// Note: Moved to useTheme.js for Fast Refresh compatibility

// Theme Provider Component
const ThemeProvider = React.memo(({ children }) => {
  const [theme, setThemeState] = useState(() => {
    // Initialize theme with stored preference or system preference
    const stored = getStoredTheme();
    if (stored) {
      return validateTheme(stored);
    }
    return getSystemTheme();
  });

  const [isSystemTheme, setIsSystemTheme] = useState(() => !getStoredTheme());

  // Apply theme on mount and when theme changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    if (!isSystemTheme) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e) => {
      const systemTheme = e.matches ? THEMES.DARK : THEMES.LIGHT;
      setThemeState(systemTheme);
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, [isSystemTheme]);

  // Set theme function
  const setTheme = useCallback((newTheme) => {
    const validatedTheme = validateTheme(newTheme);
    setThemeState(validatedTheme);
    storeTheme(validatedTheme);
    setIsSystemTheme(false);
  }, []);

  // Toggle theme function
  const toggleTheme = useCallback(() => {
    const newTheme = theme === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK;
    setTheme(newTheme);
  }, [theme, setTheme]);

  // Follow system theme function
  const followSystemTheme = useCallback(() => {
    setIsSystemTheme(true);
    const systemTheme = getSystemTheme();
    setThemeState(systemTheme);
    // Remove stored preference to follow system
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(THEME_STORAGE_KEY);
      } catch (error) {
        console.warn('Failed to remove theme from localStorage:', error);
      }
    }
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    theme,
    themes: THEMES,
    toggleTheme,
    setTheme,
    followSystemTheme,
    isSystemTheme,
  }), [theme, toggleTheme, setTheme, followSystemTheme, isSystemTheme]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
});

ThemeProvider.displayName = 'ThemeProvider';

// Export the provider component as default for Fast Refresh compatibility
export default ThemeProvider;
