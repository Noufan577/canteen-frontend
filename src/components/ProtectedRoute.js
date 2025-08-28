import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  if (!token || !user) {
    return <Navigate to="/login" />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" />; // Not authorized, redirect to home
  }

  return children;
};

export default ProtectedRoute;