import React from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const isLoggedIn = !!localStorage.getItem('user');

  if (!isLoggedIn) {
    // If the user is not logged in, redirect them to the login page
    return <Navigate to="/login" replace />;
  }

  // If the user is logged in, render the component they were trying to access
  return children;
}

export default ProtectedRoute;