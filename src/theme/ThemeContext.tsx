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
  { id: 'blue', name: 'Ocean Blue', primary: '#0284c7', secondary: '#38bdf8', accent: '#06b6d4', bgLight: '#e0f2fe' },
  { id: 'midnight', name: 'Midnight Navy', primary: '#1e3a8a', secondary: '#3b82f6', accent: '#60a5fa', bgLight: '#dbeafe' },
  { id: 'emerald', name: 'Emerald Green', primary: '#059669', secondary: '#10b981', accent: '#84cc16', bgLight: '#dcfce7' },
  { id: 'violet', name: 'Imperial Violet', primary: '#7c3aed', secondary: '#a855f7', accent: '#c084fc', bgLight: '#f3e8ff' },
  { id: 'crimson', name: 'Royal Crimson', primary: '#e11d48', secondary: '#f43f5e', accent: '#fb7185', bgLight: '#ffe4e6' },
  { id: 'dbase', name: 'DBASE Orange', primary: '#ea580c', secondary: '#f97316', accent: '#fbbf24', bgLight: '#ffedd5' },
  { id: 'amber', name: 'Solar Amber', primary: '#d97706', secondary: '#f59e0b', accent: '#fde047', bgLight: '#fef3c7' },
  { id: 'pink', name: 'Vibrant Pink', primary: '#db2777', secondary: '#ec4899', accent: '#f472b6', bgLight: '#fce7f3' },
  { id: 'chocolate', name: 'Mocha Bronze', primary: '#854d0e', secondary: '#a16207', accent: '#facc15', bgLight: '#fef9c3' },
  { id: 'lavender', name: 'Lavender Mist', primary: '#6366f1', secondary: '#818cf8', accent: '#a5b4fc', bgLight: '#e0e7ff' },
  { id: 'coal', name: 'Graphite Coal', primary: '#475569', secondary: '#64748b', accent: '#94a3b8', bgLight: '#e2e8f0' },
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
    return localStorage.getItem('aku_theme_color') || 'teal';
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
    document.documentElement.style.setProperty('--ion-color-primary', selected.primary);
    document.documentElement.style.setProperty('--theme-color', selected.primary);
    const headerBg = `linear-gradient(135deg, rgba(${hexToRgb(selected.primary)}, 0.88) 0%, rgba(${hexToRgb(selected.secondary)}, 0.85) 100%)`;
    document.documentElement.style.setProperty('--theme-header-bg', headerBg);
    document.documentElement.style.setProperty('--theme-shadow', `rgba(${hexToRgb(selected.primary)}, 0.32)`);
    document.documentElement.style.setProperty('--theme-shadow-lg', `rgba(${hexToRgb(selected.primary)}, 0.48)`);
  };

  useEffect(() => {
    applyTheme(themeId, isDark);
    localStorage.setItem('aku_theme_color', themeId);
    localStorage.setItem('aku_theme_mode', isDark ? 'dark' : 'light');
  }, [themeId, isDark]);

  const setThemeId = (id: string) => {
    setThemeIdState(id);
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
