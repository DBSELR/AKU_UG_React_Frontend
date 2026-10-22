import React from 'react';

const UniversityFooter: React.FC = () => (
  <footer className="aku-footer">
    <div className="aku-footer-inner">
      <p className="aku-footer-text aku-footer-copy">
        Copyright<a href="https://akuprakasam.ac.in/" target="_blank" rel="noreferrer" className="aku-footer-highlight">
          &copy; 2023 Andhra Kesari University
        </a>
        <span>All rights reserved.</span>
      </p>
      <div className="aku-footer-meta">
        <p className="aku-footer-text aku-footer-credit">
          Developed by{' '}
          <a href="http://dbasesolutions.in/" target="_blank" rel="noreferrer" className="aku-footer-highlight">
            D Base Solutions Private Limited
          </a>
        </p>
        <a className="aku-support-contact" href="tel:9948708389" aria-label="Call portal support at 9948708389">
          <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5.3 2.5h2.5l1.1 3.2-1.6 1.4a12.2 12.2 0 0 0 5.6 5.6l1.4-1.6 3.2 1.1v2.5a1.8 1.8 0 0 1-2 1.8A14.8 14.8 0 0 1 3.5 4.5a1.8 1.8 0 0 1 1.8-2Z" /></svg>
          <span>Portal support</span>
          <strong>9948708389</strong>
        </a>
      </div>
    </div>
  </footer>
);

export default UniversityFooter;
