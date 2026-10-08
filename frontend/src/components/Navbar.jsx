import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../state/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo" aria-label="ShipSpace home">
        <span className="brand-mark">◆</span>
        <span>Ship<span>Space</span></span>
      </Link>

      <div className="navbar-links">
        <Link to="/find-space">Find Space</Link>
        <Link to="/analytics">Analytics</Link>
        <Link to="/pricing">Pricing</Link>

        {user ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            {user.role === 'admin' && <Link to="/admin" className="admin-nav-link">Admin</Link>}
            <button type="button" className="nav-logout" onClick={onLogout}>Logout</button>
            <Link to="/create-listing" className="btn-nav-register">List Your Space</Link>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register" className="btn-nav-register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
