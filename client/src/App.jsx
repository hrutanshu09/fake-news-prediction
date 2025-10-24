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
import logo from './assets/logo.svg';

// This helper component manages all navigation logic
function NavigationController() {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = !!localStorage.getItem('user');

  const handleLogout = async () => {
    // **THE FIX**: This tells the browser to send the session cookie.
    await fetch('http://localhost:3000/logout', { 
        method: 'POST', 
        credentials: 'include' 
    });
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Define navigation items for different pages
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

  // Hide the navigation on login, signup, and welcome pages
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
  );
}

export default App;