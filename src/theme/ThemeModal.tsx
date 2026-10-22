import React, { useEffect } from 'react';
import { useTheme, THEME_COLORS } from './ThemeContext';
import './ThemeModal.css';

export const ThemeModal: React.FC = () => {
  const { themeId, setThemeId, isDark, toggleDarkMode, showThemeModal, setShowThemeModal } = useTheme();
  const currentTheme = THEME_COLORS.find(theme => theme.id === themeId) || THEME_COLORS[0];

  useEffect(() => {
    if (!showThemeModal) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setShowThemeModal(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showThemeModal, setShowThemeModal]);

  if (!showThemeModal) return null;

  return (
    <div className="theme-modal-overlay" onClick={() => setShowThemeModal(false)}>
      <section
        className="theme-modal-container"
        role="dialog"
        aria-modal="true"
        aria-labelledby="theme-modal-title"
        onClick={event => event.stopPropagation()}
      >
        <header className="theme-modal-header">
          <div className="theme-header-title">
            <span className="theme-header-icon" aria-hidden="true">✦</span>
            <div>
              <h2 id="theme-modal-title">Choose your theme</h2>
              <p>Personalize the university portal</p>
            </div>
          </div>
          <button
            type="button"
            className="theme-modal-close-btn"
            onClick={() => setShowThemeModal(false)}
            aria-label="Close theme selector"
          >×</button>
        </header>

        <div className="theme-modal-body">
          <section className="theme-mode-section" aria-labelledby="theme-mode-label">
            <span className="theme-section-label" id="theme-mode-label">Appearance</span>
            <div className="theme-mode-toggle-group">
              <button type="button" className={`theme-mode-btn ${!isDark ? 'active' : ''}`} aria-pressed={!isDark} onClick={() => isDark && toggleDarkMode()}>
                <span className="theme-mode-icon" aria-hidden="true">☀</span>Light
              </button>
              <button type="button" className={`theme-mode-btn ${isDark ? 'active' : ''}`} aria-pressed={isDark} onClick={() => !isDark && toggleDarkMode()}>
                <span className="theme-mode-icon" aria-hidden="true">☾</span>Dark
              </button>
            </div>
          </section>

          <section className="theme-palettes-section" aria-labelledby="theme-palette-label">
            <div className="theme-section-label" id="theme-palette-label">Color palette <span className="theme-count">6 themes</span></div>
            <div className="theme-color-grid" role="group" aria-label="Choose a color theme">
              {THEME_COLORS.map(theme => {
                const selected = themeId === theme.id;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    className={`theme-color-card ${selected ? 'selected' : ''}`}
                    onClick={() => setThemeId(theme.id)}
                    aria-pressed={selected}
                    title={`Use ${theme.name} theme`}
                  >
                    <span className="theme-color-swatch" style={{ background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)` }} aria-hidden="true">
                      {selected && <span className="theme-check-icon">✓</span>}
                    </span>
                    <span className="theme-color-name">{theme.name}</span>
                    {theme.id === 'royal' && <span className="theme-color-description">Blue &amp; white</span>}
                  </button>
                );
              })}
            </div>
          </section>

          <div className="theme-preview-card" aria-live="polite">
            <span className="theme-preview-dot" style={{ backgroundColor: currentTheme.primary }} aria-hidden="true" />
            <div className="theme-preview-copy">
              <strong>{currentTheme.name}</strong>
              <span>{isDark ? 'Dark appearance' : 'Light appearance'} · preview applied instantly</span>
            </div>
            <span className="theme-preview-sample" style={{ background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.secondary})` }}>Aa</span>
          </div>
        </div>

        <footer className="theme-modal-footer">
          <button type="button" className="theme-done-btn" onClick={() => setShowThemeModal(false)}>Done</button>
        </footer>
      </section>
    </div>
  );
};
