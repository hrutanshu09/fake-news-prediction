// client/src/App.jsx - FINAL CORRECTED VERSION

import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation, useNavigate } from 'react-router-dom';

// Import your page components
import Welcome from './components/Welcome';
import Login from './components/Login';
import Signup from './components/Signup';
import Predictor from './components/Predictor';
import History from './components/History';
import ProtectedRoute from './components/ProtectedRoute';
import PillNav from './components/PillNav';
import Aurora from './components/Aurora'; // 1. Import Aurora here
import logo from './assets/logo.svg';
import './App.css'; // 2. Import the new App.css for layout

// This helper component manages all navigation logic
function NavigationController() {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = !!localStorage.getItem('user');

  const handleLogout = async () => {
    await fetch('http://localhost:3000/logout', {
        method: 'POST',
        credentials: 'include'
    });
    localStorage.removeItem('user');
    navigate('/');
  };

  // Define navigation items based on the current page
  let navItems = [];

  if (location.pathname === '/predictor') {
    navItems = [
      { label: 'History', href: '/history' },
      { label: 'Logout', onClick: handleLogout }
    ];
  } else if (location.pathname === '/history') {
    navItems = [
      { label: 'Back to Predictor', href: '/predictor' },
      { label: 'Logout', onClick: handleLogout }
    ];
  }

  // Hide the navigation on welcome, login, and signup pages
  if (['/', '/login', '/signup'].includes(location.pathname)) {
    return null;
  }

  return (
    <PillNav
      logo={logo}
      logoAlt="App Logo"
      items={navItems}
      activeHref={location.pathname}
      baseColor="#ffffff"
      pillColor="#141428"
      hoveredPillTextColor="#ffffff"
      pillTextColor="#ffffff"
    />
  );
}

function App() {
  return (
    // 3. Main container for layering
    <div className="app-container">
      {/* 4. Add Aurora as the global background */}
      <Aurora
        colorStops={["#3A29FF", "#FF94B4", "#FF3232"]}
        blend={0.5}
        amplitude={1.0}
        speed={0.5}
      />
      {/* 5. Container for the actual page content */}
      <div className="content-container">
        <Router>
          <NavigationController />
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/predictor"
              element={<ProtectedRoute><Predictor /></ProtectedRoute>}
            />
            <Route
              path="/history"
              element={<ProtectedRoute><History /></ProtectedRoute>}
            />
          </Routes>
        </Router>
      </div>
    </div>
  );
}

export default App;
