import React from 'react';
import './AmbientBackground.css';

export const AmbientBackground: React.FC = () => {
  return (
    <div className="ambient-background-container" aria-hidden="true">
      <div className="ambient-grid-overlay"></div>
      <div className="ambient-orb orb-1"></div>
      <div className="ambient-orb orb-2"></div>
      <div className="ambient-orb orb-3"></div>
      <div className="ambient-orb orb-4"></div>
      <div className="ambient-aurora"></div>
    </div>
  );
};
