import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Header.css';

function Header() {
  const navigate = useNavigate();
  // We check for the user in a try-catch block to prevent crashes if it's not valid JSON
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem('user'));
  } catch (e) {
    console.error("Could not parse user from localStorage");
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <header className="app-header-sticky">
      <div className="header-brand">
        <span role="img" aria-label="food-icon">🍔</span>
        CanteenRush
      </div>
      <nav className="header-nav">
        {/* Conditional Navigation Links */}
        {!user || user.role === 'manager' ? (
          <Link to="/">Menu</Link>
        ) : null}

        {user?.role === 'manager' && <Link to="/admin">Dashboard</Link>}
        
        {user?.role === 'staff' && <Link to="/staff/scanner">Scanner</Link>}
        
        {user ? (
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </nav>
    </header>
  );
}

export default Header;
