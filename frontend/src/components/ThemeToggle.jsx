import React from 'react';
import { useTheme } from '../contexts/useTheme';
import './ThemeToggle.css';

const ThemeToggle = ({ className = '', ...props }) => {
  const { theme, toggleTheme, themes } = useTheme();
  
  const isDark = theme === themes.DARK;
  const icon = isDark ? '🌙' : '☀️';
  const label = isDark ? 'Switch to light theme' : 'Switch to dark theme';

  const handleClick = () => {
    toggleTheme();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleTheme();
    }
  };

  return (
    <button
      type="button"
      className={`theme-toggle ${className}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label={label}
      title={label}
      data-theme={theme}
      {...props}
    >
      <span className="theme-toggle__icon" aria-hidden="true">
        {icon}
      </span>
      <span className="theme-toggle__sr-text sr-only">
        Current theme: {isDark ? 'dark' : 'light'}. Click to switch to {isDark ? 'light' : 'dark'} theme.
      </span>
    </button>
  );
};

export default ThemeToggle;
