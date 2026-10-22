import React, { createContext, useContext, useState, useEffect } from 'react';

export interface ThemeColor {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  bgLight: string;
}

export const THEME_COLORS: ThemeColor[] = [
  { id: 'teal', name: 'AKU Teal', primary: '#0d9488', secondary: '#14b8a6', accent: '#84cc16', bgLight: '#e0f2fe' },
  { id: 'blue', name: 'Ocean Blue', primary: '#075985', secondary: '#0e7490', accent: '#67e8f9', bgLight: '#ecfeff' },
  { id: 'midnight', name: 'Midnight Navy', primary: '#111827', secondary: '#b45309', accent: '#fbbf24', bgLight: '#f3f4f6' },
  { id: 'lavender', name: 'Lavender Mist', primary: '#7c3aed', secondary: '#be185d', accent: '#f9a8d4', bgLight: '#faf5ff' },
  { id: 'coal', name: 'Graphite Coal', primary: '#1f2937', secondary: '#64748b', accent: '#cbd5e1', bgLight: '#f1f5f9' },
  { id: 'royal', name: 'AKU Heritage Blue', primary: '#1d58a6', secondary: '#164788', accent: '#e2c46e', bgLight: '#edf5ff' },
];

const hexToRgb = (hex: string): string => {
  const cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0] + cleanHex[0], 16);
    const g = parseInt(cleanHex[1] + cleanHex[1], 16);
    const b = parseInt(cleanHex[2] + cleanHex[2], 16);
    return `${r}, ${g}, ${b}`;
  }
  const r = parseInt(cleanHex.substring(0, 2), 16) || 13;
  const g = parseInt(cleanHex.substring(2, 4), 16) || 148;
  const b = parseInt(cleanHex.substring(4, 6), 16) || 136;
  return `${r}, ${g}, ${b}`;
};

interface ThemeContextType {
  themeId: string;
  isDark: boolean;
  setThemeId: (id: string) => void;
  toggleDarkMode: () => void;
  showThemeModal: boolean;
  setShowThemeModal: (open: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeId, setThemeIdState] = useState<string>(() => {
    const savedTheme = localStorage.getItem('aku_theme_color_v2');
    return THEME_COLORS.some(theme => theme.id === savedTheme) ? savedTheme as string : 'royal';
  });

  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('aku_theme_mode');
    if (saved) return saved === 'dark';
    return false;
  });

  const [showThemeModal, setShowThemeModal] = useState<boolean>(false);

  const applyTheme = (id: string, dark: boolean) => {
    document.documentElement.setAttribute('data-theme', id);
    if (dark) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      document.documentElement.classList.remove('light');
      document.body.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      document.documentElement.classList.add('light');
      document.body.classList.add('light');
    }

    const selected = THEME_COLORS.find(t => t.id === id) || THEME_COLORS[0];
    document.documentElement.style.setProperty('--theme-primary', selected.primary);
    document.documentElement.style.setProperty('--theme-primary-rgb', hexToRgb(selected.primary));
    document.documentElement.style.setProperty('--theme-secondary', selected.secondary);
    document.documentElement.style.setProperty('--theme-secondary-rgb', hexToRgb(selected.secondary));
    document.documentElement.style.setProperty('--theme-accent', selected.accent);
    document.documentElement.style.setProperty('--theme-accent-rgb', hexToRgb(selected.accent));
    document.documentElement.style.setProperty('--ion-color-primary', selected.primary);
    document.documentElement.style.setProperty('--theme-color', selected.primary);
    const headerBg = `linear-gradient(105deg, ${selected.primary} 0%, ${selected.secondary} 100%)`;
    document.documentElement.style.setProperty('--theme-header-bg', headerBg);
    document.documentElement.style.setProperty('--theme-shadow', `rgba(${hexToRgb(selected.primary)}, 0.32)`);
    document.documentElement.style.setProperty('--theme-shadow-lg', `rgba(${hexToRgb(selected.primary)}, 0.48)`);
  };

  useEffect(() => {
    applyTheme(themeId, isDark);
    localStorage.setItem('aku_theme_color_v2', themeId);
    localStorage.setItem('aku_theme_mode', isDark ? 'dark' : 'light');
  }, [themeId, isDark]);

  const setThemeId = (id: string) => {
    if (THEME_COLORS.some(theme => theme.id === id)) setThemeIdState(id);
  };

  const toggleDarkMode = () => {
    setIsDark(prev => !prev);
  };

  return (
    <ThemeContext.Provider
      value={{
        themeId,
        isDark,
        setThemeId,
        toggleDarkMode,
        showThemeModal,
        setShowThemeModal,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
