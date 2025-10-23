import React from 'react';
import { Link } from 'react-router-dom';

function Welcome() {
  return (
    <div className="container welcome-container">
      <h1>Welcome to the Fake News Predictor</h1>
      <p>
        Tired of sifting through headlines, unsure of what's real and what's not? Our Fake News Predictor is here to help you navigate the complex media landscape with greater confidence.
      </p>
      <div className="welcome-features">
        <h2>How It Works</h2>
        <ul>
          <li><strong>Enter a Headline or URL:</strong> Simply paste a news headline or the URL of an article.</li>
          <li><strong>Instant Analysis:</strong> Our model will analyze the text and provide a "Real" or "Fake" prediction.</li>
          <li><strong>Confidence Score:</strong> See the confidence level of the prediction.</li>
          <li><strong>Track Your History:</strong> Keep a record of your past predictions for future reference.</li>
        </ul>
      </div>
      <div className="welcome-cta">
        <Link to="/signup" className="btn btn-primary">Get Started</Link>
        <Link to="/login" className="btn btn-secondary">Login</Link>
      </div>
    </div>
  );
}

export default Welcome;