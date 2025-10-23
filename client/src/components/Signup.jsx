import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Signup() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }

    const res = await fetch('http://localhost:3000/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, confirmPassword }),
    });

    const data = await res.json();
    setMessage(data.message);
    if (data.success) {
      setTimeout(() => navigate('/login'), 1500);
    }
  };

  return (
    <div className="container auth-container">
      <h1>Sign Up</h1>
      <form onSubmit={handleSubmit}>
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" required />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm Password" required />
        <button type="submit">Sign Up</button>
      </form>
      <p className="auth-switch">Already have an account? <Link to="/login">Login</Link></p>
      {message && <div className={`auth-message ${message.includes('successful') ? 'success' : 'error'}`}>{message}</div>}
    </div>
  );
}

export default Signup;