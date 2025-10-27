import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include'
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('user', JSON.stringify({ username }));
        navigate('/predictor');
      } else {
        setMessage(data.message || 'An error occurred.');
      }
    } catch (error) {
        console.error("Fetch failed:", error);
        setMessage("Could not connect to the server. Is it running?");
    }
  };

  return (
    <div className="container auth-container">
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" required />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
        <button type="submit">Login</button>
      </form>
      <p className="auth-switch">Don't have an account? <Link to="/signup">Sign Up</Link></p>
      {message && <div className="auth-message error">{message}</div>}
    </div>
  );
}

export default Login;