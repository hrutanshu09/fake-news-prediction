import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Welcome from './components/Welcome';
import Login from './components/Login';
import Signup from './components/Signup';
import Predictor from './components/Predictor';
import History from './components/History';
import Header from './components/Header';
import './style.css';

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/predictor" element={<Predictor />} />
        <Route path="/history" element={<History />} />
      </Routes>
    </Router>
  );
}

export default App;