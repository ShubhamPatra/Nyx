import { createContext } from 'react';

// Available themes
export const THEMES = {
  DARK: 'dark',
  LIGHT: 'light',
};

export const THEME_STORAGE_KEY = 'nyx-theme-preference';

// Create the context
export const ThemeContext = createContext({
  theme: THEMES.DARK,
  themes: THEMES,
  toggleTheme: () => {},
  setTheme: () => {},
  isSystemTheme: false,
});

// Validate theme value
export const validateTheme = (theme) => {
  return Object.values(THEMES).includes(theme) ? theme : THEMES.DARK;
};

// Get system theme preference
export const getSystemTheme = () => {
  if (typeof window === 'undefined') return THEMES.DARK;
  return window.matchMedia('(prefers-color-scheme: dark)').matches 
    ? THEMES.DARK 
    : THEMES.LIGHT;
};

// Get stored theme preference
export const getStoredTheme = () => {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(THEME_STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to read theme from localStorage:', error);
    return null;
  }
};

// Store theme preference
export const storeTheme = (theme) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (error) {
    console.warn('Failed to store theme in localStorage:', error);
  }
};

// Apply theme to document
export const applyTheme = (theme) => {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', theme);
};
