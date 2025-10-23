import React from 'react';
import { Link } from 'react-router-dom';

function Welcome() {
  return (
    <div className="container">
      <h1>Welcome to the Fake News Predictor</h1>
      <p>
        Tired of sifting through headlines, unsure of what's real and what's not? Our tool is here to help you navigate the complex media landscape with greater confidence.
      </p>
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <Link to="/signup" style={{ marginRight: '10px' }}><button>Get Started</button></Link>
        <Link to="/login"><button>Login</button></Link>
      </div>
    </div>
  );
}

export default Welcome;