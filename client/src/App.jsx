import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Welcome from './components/Welcome';
import Login from './components/Login';
import Signup from './components/Signup';
import Predictor from './components/Predictor';
import History from './components/History';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute'; // --- 1. Import ProtectedRoute ---

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        {/* --- Public Routes --- */}
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* --- Protected Routes --- */}
        <Route
          path="/predictor"
          element={
            <ProtectedRoute> {/* --- 2. Wrap Predictor --- */}
              <Predictor />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute> {/* --- 3. Wrap History --- */}
              <History />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;