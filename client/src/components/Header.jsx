import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Header() {
  const location = useLocation();
  const isLoggedIn = !!localStorage.getItem('user');

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  if (!isLoggedIn || ['/', '/login', '/signup'].includes(location.pathname)) {
    return null;
  }

  return (
    <div className="header-links">
      <Link to="/history" className="history-link">View History →</Link>
      <button onClick={handleLogout} className="logout-link">Logout</button>
    </div>
  );
}

export default Header;