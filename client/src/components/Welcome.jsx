// client/src/components/Welcome.jsx - CORRECTED VERSION

import React from 'react';
import PillNav from './PillNav';
import './Welcome.css';

function Welcome() {
  const welcomeNavItems = [
    { label: 'Login', href: '/login' },
    { label: 'Sign Up', href: '/signup' }
  ];

  return (
    <div className="welcome-page-container">
      <div className="welcome-content">
        <h1>Fake News Predictor</h1>
        <p>
          Tired of sifting through headlines, unsure of what's real and what's not? Our tool is here to help you navigate the media landscape with confidence.
        </p>
        <div className="welcome-cta">
          <PillNav
            items={welcomeNavItems}
            className="welcome-nav"
            baseColor="#ffffff"
            pillColor="rgba(20, 20, 40, 0.7)"
            hoveredPillTextColor="#ffffff"
            pillTextColor="#ffffff"
            initialLoadAnimation={false}
          />
        </div>
      </div>
    </div>
  );
}

export default Welcome;