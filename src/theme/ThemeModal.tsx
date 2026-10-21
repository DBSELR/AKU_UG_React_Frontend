import React from 'react';
import { useTheme, THEME_COLORS } from './ThemeContext';
import './ThemeModal.css';

export const ThemeModal: React.FC = () => {
  const { themeId, setThemeId, isDark, toggleDarkMode, showThemeModal, setShowThemeModal } = useTheme();

  if (!showThemeModal) return null;

  const currentTheme = THEME_COLORS.find(t => t.id === themeId) || THEME_COLORS[0];

  return (
    <div className="theme-modal-overlay" onClick={() => setShowThemeModal(false)}>
      <div className="theme-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="theme-modal-header">
          <div className="theme-header-title">
            <span className="theme-header-icon">🎨</span>
            <div>
              <h3>Theme Studio</h3>
              <p>Glassmorphic UI &amp; Multi-Palette Engine</p>
            </div>
          </div>
          <button
            className="theme-modal-close-btn"
            onClick={() => setShowThemeModal(false)}
            aria-label="Close Theme Studio"
          >
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="theme-modal-body">
          {/* Mode Switcher */}
          <div className="theme-mode-section">
            <span className="theme-section-label">Display Mode</span>
            <div className="theme-mode-toggle-group">
              <button
                type="button"
                className={`theme-mode-btn ${!isDark ? 'active' : ''}`}
                onClick={() => isDark && toggleDarkMode()}
              >
                <span className="theme-mode-icon">☀️</span>
                <span className="theme-mode-text">Crisp Light Glass</span>
              </button>
              <button
                type="button"
                className={`theme-mode-btn ${isDark ? 'active' : ''}`}
                onClick={() => !isDark && toggleDarkMode()}
              >
                <span className="theme-mode-icon">🌙</span>
                <span className="theme-mode-text">Cosmic Dark Glass</span>
              </button>
            </div>
          </div>

          {/* Color Palettes Grid */}
          <div className="theme-palettes-section">
            <span className="theme-section-label">Color Themes ({THEME_COLORS.length} Palettes)</span>
            <div className="theme-color-grid">
              {THEME_COLORS.map((t) => {
                const isSelected = themeId === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    className={`theme-color-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => setThemeId(t.id)}
                    title={t.name}
                  >
                    <div
                      className="theme-color-swatch"
                      style={{
                        background: `linear-gradient(135deg, ${t.primary} 0%, ${t.secondary} 100%)`,
                      }}
                    >
                      {isSelected && <span className="theme-check-icon">✓</span>}
                    </div>
                    <span className="theme-color-name">{t.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live Preview Card */}
          <div className="theme-preview-card">
            <div className="theme-preview-header">
              <span className="theme-preview-dot" style={{ backgroundColor: 'var(--theme-primary)' }}></span>
              <span className="theme-preview-title">Live Dynamic Preview</span>
            </div>
            <div className="theme-preview-actions">
              <span className="theme-preview-chip">Active: {currentTheme.name}</span>
              <span className="theme-preview-chip-mode">{isDark ? '🌙 Cosmic Acrylic' : '☀️ Luminous Glass'}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="theme-modal-footer">
          <button
            type="button"
            className="theme-done-btn"
            onClick={() => setShowThemeModal(false)}
          >
            Apply &amp; Done
          </button>
        </div>
      </div>
    </div>
  );
};
