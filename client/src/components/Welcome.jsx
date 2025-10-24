// client/src/components/Welcome.jsx - CORRECTED VERSION

import React from 'react';
import { Link } from 'react-router-dom';
import Aurora from './Aurora';
import PillNav from './PillNav'; // Import the PillNav component
import './Welcome.css';

function Welcome() {
  // Define the items for the welcome page navigation
  const welcomeNavItems = [
    { label: 'Login', href: '/login' },
    { label: 'Sign Up', href: '/signup' }
  ];

  return (
    <div className="welcome-page-container">
      <Aurora
        colorStops={["#3A29FF", "#FF94B4", "#FF3232"]}
        blend={0.5}
        amplitude={1.0}
        speed={0.5}
      />
      <div className="container welcome-content">
        <h1>Welcome to the Fake News Predictor</h1>
        <p>
          Tired of sifting through headlines, unsure of what's real and what's not? Our tool is here to help you navigate the media landscape with confidence.
        </p>
        <div className="welcome-cta">
          {/* **FIXED**: Add the PillNav component here for the buttons */}
          <PillNav
            items={welcomeNavItems}
            baseColor="#ffffff"
            pillColor="rgba(20, 20, 40, 0.7)" // Semi-transparent dark pill
            hoveredPillTextColor="#ffffff"
            pillTextColor="#ffffff"
            initialLoadAnimation={false} // Disable the initial load animation for a cleaner look
          />
        </div>
      </div>
    </div>
  );
}

export default Welcome;