import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Header() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('user');

  const handleLogout = async () => {
    await fetch('http://localhost:3000/logout', { 
        method: 'POST', 
        credentials: 'include' 
    });
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div style={{ padding: '10px', background: '#eee', textAlign: 'right' }}>
      <Link to="/history" style={{ marginRight: '15px' }}>View History</Link>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Header;